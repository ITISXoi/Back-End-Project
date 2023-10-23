import {NftOffChainType, OnchainStatus} from '../../shared/enums';
import * as _ from 'lodash';
import {Collection, CurrencyConfig, LatestBlock, Nft, NftOffchain,} from '../../database/entities';
import {getLogger} from '../../shared/logger';
import {getConnection, LessThanOrEqual} from 'typeorm';
import * as ethereumjs from '@ethereumjs/tx';
import pLimit from 'p-limit';
import {getBlockNumber} from 'src/shared/Utils';
import {CollectionLog} from "../../database/entities/CollectionLog.entity";
import {NftLog} from "../../database/entities/NftLog.entity";

const NodeCache = require( "node-cache" );
const BATCH_LIMIT = 20;
const nodeCache = new NodeCache( { stdTTL: BATCH_LIMIT, checkperiod: BATCH_LIMIT } );
const limit = pLimit(BATCH_LIMIT);
const EthereumTx = ethereumjs.Transaction;
const Web3 = require("web3");
const fs = require('fs')
const axios = require("axios");
const logger = getLogger('CollectionControllerWorkerService');

const MAX_BLOCK_PER_TIME = 999; //999
const PREFIX_KEY = "crawl_collection_controller_";
const PREFIX_KEY_TEMP = "crawl_collection_controller_temp_";

export class CollectionControllerWorkerService {

    _web3 = new Web3(this.currency.rpcEndpoint);

    _collectionControllerAbi = fs.readFileSync('./smart-contract/CollectionController.json', 'utf8')
    _collectionControllerContract = new this._web3.eth.Contract(JSON.parse(this._collectionControllerAbi), JSON.parse(this.currency.tokenAddresses)?.["collectionController"]);

    constructor(
        private readonly currency: CurrencyConfig,
    ) {
        this._setup();
    }

    async _setup() {
        if (this._collectionControllerContract._address == null) {
            return;
        }
        this.doCrawlJob();
    }

    async delay(t) {
        return new Promise(resolve => setTimeout(resolve, t));
    }

    async doCrawlJob() {
        do {
            try {
                let isWaiting = await this.crawlData();
                if (isWaiting) {
                    await this.delay(this.currency.averageBlockTime);
                } else {
                    await this.delay(1000); // 1 seconds, to avoid too many requests
                }
            } catch (e) {
                console.log(e);
                if (e.message.indexOf('ER_LOCK_WAIT_TIMEOUT') > -1 || e.message.indexOf('ER_LOCK_DEADLOCK') > -1) {
                    logger.info(`${this.currency.network} CollectionControllerWorkerService::doCrawlJob Other server is doing the job, wait for a while`);
                } else {
                    logger.error(`${this.currency.network} CollectionControllerWorkerService::doCrawlJob ${e}`);
                }
            }
        } while (true);
    }

    /**
     * Step 1: Get the data from the blockchain
     * @returns {Promise<void>}
     */
    async crawlData() {
        return await getConnection().transaction(async (manager) => {
            let latestBlockInDb  = await manager
                .getRepository(LatestBlock)
                .createQueryBuilder('latest_block')
                .useTransaction(true)
                .setLock("pessimistic_write")
                .where({currency: PREFIX_KEY + this.currency.network + "_" + this._collectionControllerContract._address})
                .getOne();

            let latestTempBlockInDb = await manager.getRepository(LatestBlock).findOne({currency: PREFIX_KEY_TEMP + this.currency.network + "_" + this._collectionControllerContract._address});
            const latestBlock = await getBlockNumber(this.currency.chainId, this._web3);

            if (!latestBlockInDb || latestBlockInDb.blockNumber == 0) {
                latestBlockInDb = new LatestBlock();
                latestBlockInDb.currency = PREFIX_KEY + this.currency.network + "_" + this._collectionControllerContract._address;
                let getFirstBlockUrl = this.currency.scanApi
                    + `/api?module=account&action=txlist&address=${this._collectionControllerContract._address}&startblock=0&endblock=99999999&page=1&offset=1&sort=asc`
                let firstBlock = await axios.get(getFirstBlockUrl);

                latestBlockInDb.blockNumber = firstBlock.data.result[0]?.blockNumber;

                if(latestBlockInDb.blockNumber) {
                    await manager.getRepository(LatestBlock).save(latestBlockInDb);
                }
                await manager.delete(CollectionLog ,{address: this._collectionControllerContract._address});
                return false;
            }
            if (!latestTempBlockInDb) {
                latestTempBlockInDb = new LatestBlock();
                latestTempBlockInDb.currency = PREFIX_KEY_TEMP + this.currency.network + "_" + this._collectionControllerContract._address;
                latestTempBlockInDb.blockNumber = latestBlockInDb.blockNumber;
            }

            let fromBlock = latestBlockInDb.blockNumber + 1;
            let toBlock = latestBlock - this.currency.requiredConfirmations;
            // max crawl many blocks per time
            if (toBlock > fromBlock + MAX_BLOCK_PER_TIME) {
                toBlock = fromBlock + MAX_BLOCK_PER_TIME;
            }

            let tempFromBlock = Math.max(toBlock + 1, latestTempBlockInDb.blockNumber + 1);
            let tempToBlock = latestBlock - this.currency.tempRequiredConfirmations;
            // max crawl many blocks per time
            if (tempToBlock > tempFromBlock + MAX_BLOCK_PER_TIME) {
                tempToBlock = tempFromBlock + MAX_BLOCK_PER_TIME;
            }

            if (fromBlock <= toBlock) {
                logger.info(`${this.currency.network} CollectionControllerWorkerService::crawlData ${this._collectionControllerContract._address} Crawling from block ${fromBlock} => ${toBlock} (lastest block: ${latestBlock})`);
                await this.crawlBlock(manager, fromBlock, toBlock, latestBlock, false);
                await this.crawlBlock(manager, tempFromBlock, tempToBlock, latestBlock, true);

            }

            return toBlock - fromBlock > 1;

        });
    }

    async crawlBlock(_manager, _fromBlock: number, _toBlock: number, _latestBlock: number, _isTemp: boolean = false) {
        if (!_isTemp || (_latestBlock - _toBlock <= this.currency.requiredConfirmations)) {
            let blockObj = {
                fromBlock: _fromBlock,
                toBlock: _toBlock,
            };

            let [
                createCollectionEvents,
                createNftEvents
            ] = await Promise.all([
                this._collectionControllerContract.getPastEvents("CollectionCreated", blockObj),
                this._collectionControllerContract.getPastEvents("NFTMinted", blockObj),
            ]);

            logger.info(`${this.currency.network} CollectionControllerWorkerService::crawlData ${this._collectionControllerContract._address} getPastEvents::CollectionCreated ${JSON.stringify(createCollectionEvents)} from ${_fromBlock} to ${_toBlock}`);
            logger.info(`${this.currency.network} CollectionControllerWorkerService::crawlData ${this._collectionControllerContract._address} getPastEvents::createNftEvents ${JSON.stringify(createNftEvents)} from ${_fromBlock} to ${_toBlock}`);

            let status = _isTemp ? OnchainStatus.CONFIRMING : OnchainStatus.CONFIRMED;
            const [
                createdCollectionIds,
                createdNfts
                ] = await Promise.all( [
                    this.handleCreateCollectionEvents(_manager, createCollectionEvents, status, _isTemp),
                    this.handleCreateNftEvents(_manager, createNftEvents, status, _isTemp)
                ]);

            let collectionIdsMergedList = [...createdCollectionIds];
            collectionIdsMergedList = _.orderBy(collectionIdsMergedList, ['blockTimestamp'], ['asc']);
            let collectionIds = collectionIdsMergedList.map(x => x.collectionId)

            logger.info(`${this.currency.network} CollectionControllerWorkerService::crawlData ${this._collectionControllerContract._address} createdCollectionIds ${JSON.stringify(createdCollectionIds)} from ${_fromBlock} to ${_toBlock}`);
            logger.info(`${this.currency.network} CollectionControllerWorkerService::crawlData ${this._collectionControllerContract._address} collectionIdsMergedList ${JSON.stringify(collectionIdsMergedList)} from ${_fromBlock} to ${_toBlock}`);
            logger.info(`${this.currency.network} CollectionControllerWorkerService::crawlData ${this._collectionControllerContract._address} collectionIds ${JSON.stringify(collectionIds)} from ${_fromBlock} to ${_toBlock}`);

            //TODO: handle worker update nfts
            let twoDimensionTokenUris = createdNfts.map(x => x.tokenUris);
            let twoDimensionTokenIds = createdNfts.map(x => x.tokenIds);
            let collectionNftIds = createdNfts.map(x => x.collectionId);
            let collectionAddressNftIds = createdNfts.map(x => x.collectionAddress);


            logger.info(`${this.currency.network} CollectionControllerWorkerService::crawlData ${this._collectionControllerContract._address} twoDimensionTokenUris ${JSON.stringify(twoDimensionTokenUris)} from ${_fromBlock} to ${_toBlock}`);
            logger.info(`${this.currency.network} CollectionControllerWorkerService::crawlData ${this._collectionControllerContract._address} twoDimensionTokenIds ${JSON.stringify(twoDimensionTokenIds)} from ${_fromBlock} to ${_toBlock}`);
            logger.info(`${this.currency.network} CollectionControllerWorkerService::crawlData ${this._collectionControllerContract._address} collectionNftIds ${JSON.stringify(collectionNftIds)} from ${_fromBlock} to ${_toBlock}`);
            logger.info(`${this.currency.network} CollectionControllerWorkerService::crawlData ${this._collectionControllerContract._address} collectionAddressNftIds ${JSON.stringify(collectionAddressNftIds)} from ${_fromBlock} to ${_toBlock}`);

            await Promise.all([
                await this.handleUpdateCollectionOnchain(_manager, collectionIds, _toBlock, status),
                await this.handleUpdateNftOnchain(_manager,twoDimensionTokenUris, twoDimensionTokenIds, collectionNftIds, collectionAddressNftIds, _toBlock, status)
            ]);

        }

        if (!_isTemp) {
            await _manager.delete(CollectionLog, {status: OnchainStatus.CONFIRMING, blockNumber: LessThanOrEqual(_toBlock)});
            await _manager.delete(NftLog, {status: OnchainStatus.CONFIRMING, blockNumber: LessThanOrEqual(_toBlock)});
        }
        // update latest block in transaction
        const latestBlockKey = _isTemp ? (PREFIX_KEY_TEMP + this.currency.network + "_" + this._collectionControllerContract._address) : (PREFIX_KEY + this.currency.network + "_" + this._collectionControllerContract._address)
        let latestBlock = await _manager.findOne(LatestBlock, {currency: latestBlockKey});
        if (!latestBlock) {
            latestBlock = new LatestBlock();
            latestBlock.currency = latestBlockKey;
        }
        latestBlock.blockNumber = _toBlock;
        await _manager.save(latestBlock);
    }

    async handleCreateCollectionEvents(_manager, _events, _status, _isTemp): Promise<any[]> {
        return Promise.all(
            _events.map(async (event) => {
                return limit(async () => {
                    const blockData:any = await this.web3Cache("getBlock_" + event.blockNumber,this._web3.eth.getBlock(event.blockNumber));
                    const collection = event.returnValues;
                    let collectionLog = new CollectionLog();
                    collectionLog.address = this._collectionControllerContract._address;
                    collectionLog.collectionAddress = collection.nFTaddress;
                    collectionLog.owner = collection.artist;
                    collectionLog.collectionId = collection.collectionId;
                    collectionLog.keyId = Number(collection.keyId);
                    collectionLog.chainId = this.currency.chainId;
                    collectionLog.paymentToken = collection.paymentToken;
                    collectionLog.price = collection.price;
                    collectionLog.status = _status;
                    collectionLog.txid = event.transactionHash;
                    collectionLog.blockHash = event.blockHash;
                    collectionLog.blockTimestamp = blockData.timestamp;
                    collectionLog.blockNumber = event.blockNumber;

                    logger.info(`${this.currency.network} CollectionControllerWorkerService::handleCreatedLootBoxEvents${_isTemp ? "Temp" : ""} Update token ${JSON.stringify(collectionLog)}`);
                    await _manager.save(collectionLog);
                    return {"collectionId": collection.collectionId, "keyId": Number(collection.keyId), "blockTimestamp": blockData.timestamp, "event": event.event};
                });
            })
        );
    }

    async handleUpdateCollectionOnchain(_manager, _collectionIds: any, _toBlock, _status): Promise<any>{
        const blockData:any = await this.web3Cache("getBlock_" + _toBlock,this._web3.eth.getBlock(_toBlock));
        let idUpdateArr = [..._collectionIds];

        return Promise.all(
            idUpdateArr.map(async (collectionId) => {
                return limit(async () => {

                    const collection = await this._collectionControllerContract.methods.collections(collectionId).call();
                    logger.info(`${this.currency.network} CollectionControllerWorkerService::handleUpdateCollectionOnchain collectionId = ${JSON.stringify(collectionId)}`);
                    logger.info(`${this.currency.network} CollectionControllerWorkerService::handleUpdateCollectionOnchain collection = ${JSON.stringify(collection)}`);

                    let collectionOnchain = await _manager.findOne(Collection, {
                        address: this._collectionControllerContract._address,
                        id: Number(collection.keyId),
                        chainId: this.currency.chainId,
                    });

                    if (collectionOnchain) {
                        await _manager.update(
                            Collection,
                            {
                                address: this._collectionControllerContract._address,
                                id: Number(collection.keyId),
                                chainId: this.currency.chainId,
                            },
                            {
                                collectionId: collectionId,
                                owner: collection.artist,
                                paymentToken: collection.paymentToken,
                                contractPrice: collection.price,
                                collectionAddress: collection.collectionAddress,
                                status: _status,
                                blockTimestamp: blockData.timestamp,
                            }
                        );
                    } else {
                        // const collectionOnchain = new Collection();
                        // collectionOnchain.chainId = this.currency.chainId;
                        // collectionOnchain.collectionId = collectionId;
                        // collectionOnchain.address = this._collectionControllerContract._address;
                        // collectionOnchain.owner = collection.artist;
                        // collectionOnchain.paymentToken = collection.paymentToken;
                        // collectionOnchain.contractPrice = collection.price;
                        // collectionOnchain.status = _status;
                        // collectionOnchain.blockTimestamp = blockData.timestamp;
                        //
                        // await _manager.save(collectionOnchain);
                        // logger.info(`${this.currency.network} CollectionControllerWorkerService::handleUpdateCollectionOnchain created ${JSON.stringify(collectionOnchain)}`);

                    }
                    logger.info(`${this.currency.network} CollectionControllerWorkerService::handleUpdateCollectionOnchain updated ${JSON.stringify(collectionOnchain)}`);
                })
            })
        );
    }

    async handleCreateNftEvents(_manager, _events, _status, _isTemp): Promise<any[]> {
        return Promise.all(
            _events.map(async (event) => {
                return limit(async () => {
                    const blockData:any = await this.web3Cache("getBlock_" + event.blockNumber,this._web3.eth.getBlock(event.blockNumber));
                    const eventDatas = event.returnValues;
                    console.log("eventDatas",eventDatas);

                    let nftLog = new NftLog();
                    nftLog.chainId = this.currency.chainId;
                    nftLog.collectionId = eventDatas.collectionId;
                    nftLog.contractAddress = eventDatas.collectionAddress; // waiting for SC update
                    nftLog.tokenId = eventDatas.tokenId;
                    nftLog.owner = eventDatas.receiver;
                    nftLog.tokenUri = eventDatas.uri;
                    nftLog.status = _status;
                    nftLog.txid = event.transactionHash;
                    nftLog.blockHash = event.blockHash;
                    nftLog.blockTimestamp = blockData.timestamp;
                    nftLog.blockNumber = event.blockNumber;
                    logger.info(`${this.currency.network} CollectionControllerWorkerService::handleCreateNftEvents${_isTemp ? "Temp" : ""} Update token ${JSON.stringify(nftLog)}`);
                    await _manager.save(nftLog);
                    console.log("nftLog",nftLog);
                    console.log("nftLog",nftLog);
                    // await Promise.all(eventDatas.uris.map(async (uri, index) => {
                    //     let nftLog = new NftLog();
                    //     nftLog.chainId = this.currency.chainId;
                    //     nftLog.collectionId = eventDatas.collectionId;
                    //     nftLog.contractAddress = eventDatas.collectionAddress; // waiting for SC update
                    //     nftLog.tokenId = eventDatas.tokenId[index];
                    //     nftLog.owner = eventDatas.receivers[index];
                    //     nftLog.tokenUri = uri;
                    //     nftLog.status = _status;
                    //     nftLog.txid = event.transactionHash;
                    //     nftLog.blockHash = event.blockHash;
                    //     nftLog.blockTimestamp = blockData.timestamp;
                    //     nftLog.blockNumber = event.blockNumber;

                    //     logger.info(`${this.currency.network} CollectionControllerWorkerService::handleCreateNftEvents${_isTemp ? "Temp" : ""} Update token ${JSON.stringify(nftLog)}`);
                    //     await _manager.save(nftLog);
                    // }))
                    return {"collectionId": eventDatas.collectionId, "collectionAddress": eventDatas.collectionAddress, "tokenUris": eventDatas.uri, "tokenIds": eventDatas.tokenId, "blockTimestamp": blockData.timestamp, "event": event.event};
                });
            })
        );
    }

    async handleUpdateNftOnchain(_manager, _twoDimensionTokenUris: any, _twoDimensionTokenIds: any, _collectionNftIds: any, _collectionAddressNftIds: any, _toBlock, _status): Promise<any> {
        
        console.log("handleUpdateNftOnchain",_twoDimensionTokenUris,_twoDimensionTokenIds,_collectionNftIds,_collectionAddressNftIds,_toBlock, _status);
        const blockData:any = await this.web3Cache("getBlock_" + _toBlock,this._web3.eth.getBlock(_toBlock));

        await Promise.all(_collectionNftIds.map(async (collectionId, i_index) => {
            const nft = await this._collectionControllerContract.methods.getNFTInfo(collectionId, _twoDimensionTokenIds[i_index]).call();
            logger.info(`${this.currency.network} CollectionControllerWorkerService::handleUpdateNftOnchain nft = ${JSON.stringify(nft)}`);

            let nftOnchain = await _manager.findOne(Nft, {
                contractAddress: _collectionAddressNftIds[i_index],
                chainId: this.currency.chainId,
                tokenUri: _twoDimensionTokenUris[i_index]
            });

            logger.info(`${this.currency.network} CollectionControllerWorkerService::handleUpdateNftOnchain contractAddress = ${JSON.stringify(_collectionAddressNftIds[i_index])}`);
            logger.info(`${this.currency.network} CollectionControllerWorkerService::handleUpdateNftOnchain chainId = ${JSON.stringify(this.currency.chainId)}`);
            logger.info(`${this.currency.network} CollectionControllerWorkerService::handleUpdateNftOnchain tokenUri = ${JSON.stringify(_twoDimensionTokenUris)}`);
            logger.info(`${this.currency.network} CollectionControllerWorkerService::handleUpdateNftOnchain nftOnchain = ${JSON.stringify(nftOnchain)}`);
            if (nftOnchain) {
                await _manager.update(
                    Nft,
                    {
                        contractAddress: _collectionAddressNftIds[i_index],
                        chainId: this.currency.chainId,
                        tokenUri: _twoDimensionTokenUris[i_index]
                    },
                    {
                        tokenId: _twoDimensionTokenIds[i_index],
                        collectionId: collectionId,
                        owner: nft[0],
                        tokenUri: nft[1],
                        status: _status,
                        blockTimestamp: blockData.timestamp,
                    }
                );
                await _manager.update(
                    NftOffchain,
                    {
                        layerIds: nftOnchain.layerIds,
                        imageIds: nftOnchain.imageIds,
                    },
                    {
                        type: NftOffChainType.MINTED,
                    }
                );
            } else {
                // const nftOnchain = new Nft();
                // nftOnchain.collectionId = collectionId;
                // nftOnchain.tokenId = tokenId;
                // nftOnchain.tokenUri = nft[1];
                // nftOnchain.status = _status;
                // nftOnchain.blockTimestamp = blockData.timestamp;
                // nftOnchain.owner = nft[0];
                // nftOnchain.chainId = this.currency.chainId;
                // nftOnchain.contractAddress = _collectionAddressNftIds[i_index];
                //
                // await _manager.save(nftOnchain);
                // logger.info(`${this.currency.network} CollectionControllerWorkerService::handleUpdateNftOnchain created nftOnchain = ${JSON.stringify(nftOnchain)}`);

            }
            logger.info(`${this.currency.network} CollectionControllerWorkerService::handleUpdateNftOnchain updated nftOnchain = ${JSON.stringify(nftOnchain)}`);
        }));
    }
    async web3Cache(key, func) {
        let value = nodeCache.get(key);
        if ( value == undefined ){
            // handle miss!
            value = await func;
            nodeCache.set(key,value);
            return value;
        }
        return value;
    }
}
