import { LootBoxStatus, AuctionStatus } from './../../shared/enums';
import { LatestBlock } from './../../database/entities/LatestBlock.entity';
import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { Collection, CurrencyConfig } from '../../database/entities';
import { getLogger } from '../../shared/logger';
import { Repository } from 'typeorm';
import { CollectionStatus } from 'src/shared/enums';
import { S3Handler } from 'src/shared/S3Handler';
import {CollectionControllerWorkerService} from "./collection-controller-worker.service";

const logger = getLogger('WorkerManagerService');
var cron = require('node-cron');

@Injectable()
export class WorkerManagerService {

    private _collectionMapping = {}

    constructor(
        @InjectRepository(CurrencyConfig)
        private currenciesRepository: Repository<CurrencyConfig>,
        @InjectRepository(Collection)
        private collectionRepository: Repository<Collection>,
        @InjectRepository(LatestBlock)
        private readonly latestBlockRepository: Repository<LatestBlock>,
        private readonly s3handler: S3Handler
    ) {
        this.init();
    }

    async init() {
        let currencies = await this.currenciesRepository.find();

        console.log(currencies)
        for (let currency of currencies) {
            if (currency.tokenAddresses) {
                //Each worker has a try catch
                const runCollectionControllerWorker = () => {
                    if (JSON.parse(currency.tokenAddresses)["collectionController"]) {
                        new CollectionControllerWorkerService(currency);
                    }
                };

                this.runWorker(runCollectionControllerWorker);
            }
        }
    }

    runWorker(_cb: () => void) {
        try {
            _cb();
        } catch (error) {
            logger.error(error);
        }
    }

}
