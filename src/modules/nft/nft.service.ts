import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Admin,
  Collection,
  CurrencyConfig,
  Image,
  Layer,
  MetaData,
  Nft,
  NftOffchain,
  User,
} from "../../database/entities";
import { getConnection, Repository } from "typeorm";
import { IPaginationOptions } from "nestjs-typeorm-paginate";
import { join } from "path";
import { Causes } from "src/config/exception/causes";
import { S3 } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { MailService } from "../mail/mail.service";
import axios from "axios";
import {
  getArrayPaginationBuildTotal,
  getRandomFromSet,
  hashString,
  isJsonString,
  makeCombination,
  makeCombinationFromMultipleArray,
  smartContract,
} from "../../shared/Utils";
import { NftOffChainType, OnchainStatus } from "../../shared/enums";
import { Create } from "./request/create.dto";
import { BigNumber } from "src/shared/BigNumber";
const { ethers } = require("ethers");
import * as ethUtil from "ethereumjs-util";
import { CreateOffchain } from "./request/create-offchain.dto";
import { UpdateOffchain } from "./request/update-offchain.dto";
import fs from "fs";
// const { createCanvas, loadImage } = require('canvas');
import Web3 from "web3";
import { log } from "console";
@Injectable()
export class NftService {
  constructor(
    @InjectRepository(MetaData)
    private readonly metaDataRepo: Repository<MetaData>,
    @InjectRepository(CurrencyConfig)
    private readonly currencyConfigRepository: Repository<CurrencyConfig>,
    @InjectRepository(Nft)
    private readonly nftRepository: Repository<Nft>,
    @InjectRepository(NftOffchain)
    private readonly nftOffchainRepository: Repository<NftOffchain>,
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(Layer)
    private readonly layerRepository: Repository<Layer>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>
  ) {}

  async createOffchain(data: any, files: any, type: string, creator: User) {
    let imageIds = JSON.parse(data.imageIds.toString());
    const queryBuilder = getConnection()
      .createQueryBuilder(Nft, "nft")
      .select("*")
      .where(
        `nft.image_ids = '${imageIds.toString()}' AND nft.status IS NOT NULL`
      );
    const nftData = await queryBuilder.execute();
    if (nftData.length) {
      throw Causes.ERROR_DATA_NFTS;
    }

    const nftOffchainData = await this.nftOffchainRepository.findOne({
      imageIds: imageIds.toString(),
      creatorId: creator.id,
    });
    if (nftOffchainData) {
      throw Causes.ERROR_DATA_DRAFT_NFTS;
    }

    const urlImage = await this.uploadOnS3(files[0]);
    console.log(type, "!@21k2k12", data);
    let collection;
    if (type == NftOffChainType.CUSTOMIZED) {
      collection = await this.collectionRepository.findOne({
        id: data.collectionKeyId,
      });
    } else if (type == NftOffChainType.DRAFT) {
      collection = await this.collectionRepository.findOne({
        collectionId: data.collectionId,
      });
    }

    if (!collection) {
      throw Causes.COLLECTION_NOT_EXISTS;
    }

    if (Date.now() > collection.endMintTime) {
      throw Causes.COLLECTION_START_END_TIME_INVALID;
    }

    if (!isJsonString(data.imageIds.toString())) {
      throw Causes.IMAGE_IDS_FORMAT_IS_INVALID;
    }

    data.imageIds = JSON.parse(data.imageIds.toString());
    const currencyConfig = await this.currencyConfigRepository.findOne({
      chainId: collection.chainId,
    });

    // const collectionControllerContract = smartContract(
    //   "./smart-contract/CollectionController.json",
    //   "collectionController",
    //   currencyConfig,
    //   "utf-8"
    // );
    // const hashUniqueNft =
    //   "0x" +
    //   hashString(
    //     data.imageIds.toString() +
    //       collection.collectionAddress +
    //       collection.chainId
    //   );
    // const isNftMint = await collectionControllerContract.methods
    //   .isLayerMinted(hashUniqueNft)
    //   .call();

    // if (isNftMint) {
    //   throw Causes.ERROR_DATA_NFTS;
    // }

    let layerIds = [];
    const images = await this.imageRepository.findByIds(data.imageIds);
    for (let i = 0; i < images.length; i++) {
      if (images[i].remainingQuantity <= 0) {
        throw Causes.IMAGE_IS_NOT_ENOUGH(images[i].id);
      }
      images[i].remainingQuantity -= 1;
      layerIds.push(images[i].layerId);
    }
    await this.imageRepository.save(images);

    let nftOffchain = new NftOffchain();
    nftOffchain.type = type;
    nftOffchain.collectionId = collection.collectionId;
    nftOffchain.collectionKeyId = collection.id;
    nftOffchain.collectionAddress = collection.collectionAddress;
    nftOffchain.chainId = collection.chainId;
    nftOffchain.layerIds = layerIds.toString();
    nftOffchain.imageIds = data.imageIds.toString();
    nftOffchain.collectionName = collection.name;
    nftOffchain.name = data.name;
    nftOffchain.slug = data.slug;
    nftOffchain.description = data.description;
    nftOffchain.imageUrl = urlImage;
    nftOffchain.imageType = files[0].mimetype ? files[0].mimetype : null;
    nftOffchain.note = data.note;
    nftOffchain.price = data.price ? data.price : 0;
    nftOffchain.attributes = JSON.stringify(
      await this.convertAtributes(data.imageIds.toString())
    );
    nftOffchain.artistId = collection.creatorId;
    nftOffchain.creatorId = creator.id;

    nftOffchain = await this.nftOffchainRepository.save(nftOffchain);

    console.log(nftOffchain);
    return nftOffchain;
  }

  async updateOffchain(
    data: UpdateOffchain,
    files: any,
    nftOffchain: NftOffchain,
    creator: User
  ) {
    if (!isJsonString(data.imageIds.toString())) {
      throw Causes.DATA_INVALID;
    }

    data.imageIds = JSON.parse(data.imageIds.toString());
    if (data.imageIds && nftOffchain.imageIds != data.imageIds.toString()) {
      const nftData = await this.nftRepository.findOne({
        imageIds: data.imageIds.toString(),
      });
      if (nftData) {
        throw Causes.ERROR_DATA_NFTS;
      }

      const nftOffchainData = await getConnection()
        .createQueryBuilder(NftOffchain, "nft_offchain")
        .where("nft_offchain.imageIds = :imageIds", {
          imageIds: data.imageIds.toString(),
        })
        .andWhere("nft_offchain.creatorId = :creatorId", {
          creatorId: creator.id,
        })
        .andWhere("nft_offchain.id != :id", { id: nftOffchain.id })
        .getRawMany();

      if (nftOffchainData[0]) {
        throw Causes.ERROR_DATA_DRAFT_NFTS;
      }

      nftOffchain.imageIds = data.imageIds.toString();
    }

    if (files && files[0]) {
      const urlImage = await this.uploadOnS3(files[0]);
      nftOffchain.imageUrl = urlImage;
    }

    nftOffchain.name = data.name ? data.name : nftOffchain.name;
    nftOffchain.description = data.description
      ? data.description
      : nftOffchain.description;
    nftOffchain.note = data.note ? data.note : nftOffchain.note;
    nftOffchain.price = data.price ? data.price : nftOffchain.price;
    nftOffchain = await this.nftOffchainRepository.save(nftOffchain);

    return nftOffchain;
  }

  async create(data: Create, files: any, creator: User) {
    const collection = await this.collectionRepository.findOne({
      collectionId: data.collectionId,
      chainId: data.chainId,
    });
    if (!collection) {
      throw Causes.COLLECTION_NOT_EXISTS;
    }

    console.log("Date.now():", Date.now());
    if (
      Date.now() < collection.startMintTime ||
      Date.now() > collection.endMintTime
    ) {
      throw Causes.COLLECTION_START_END_TIME_INVALID;
    }

    if (!isJsonString(data.imageIds.toString())) {
      throw Causes.IMAGE_IDS_FORMAT_IS_INVALID;
    }

    data.imageIds = JSON.parse(data.imageIds.toString());
    const currencyConfig = await this.currencyConfigRepository.findOne({
      chainId: collection.chainId,
    });

    const collectionControllerContract = smartContract(
      "./smart-contract/CollectionController.json",
      "collectionController",
      currencyConfig,
      "utf-8"
    );
    const hashUniqueNft =
      "0x" +
      hashString(
        data.imageIds.toString() +
          collection.collectionAddress +
          collection.chainId
      );
    const isNftMint = await collectionControllerContract.methods
      .isLayerMinted(hashUniqueNft)
      .call();

    if (isNftMint) {
      throw Causes.ERROR_DATA_NFTS;
    }

    // upload primary image to ipfs
    const dataIpfs = await this.uploadOnIpfs(files[0]);
    if (!dataIpfs) throw Causes.ERROR_IPFS;

    // upload other images to aws s3
    const urlImage = await this.uploadOnS3(files[0]);

    let layerIds = [];

    const images = await this.imageRepository.findByIds(data.imageIds);

    if (!images.length || !images) {
      throw Causes.IMAGE_IDS_IS_EMPTY;
    }

    // check: does exist any draft || customized of this imageIds
    const nftOffchain = await this.nftOffchainRepository.findOne({
      imageIds: data.imageIds.toString(),
    });

    for (let i = 0; i < images.length; i++) {
      // if(data.type != 'draft')
      // {
      //     if (images[i].remainingQuantity <= 0) {
      //         throw Causes.IMAGE_IS_NOT_ENOUGH(images[i].id);
      //     }
      // }

      if (!nftOffchain) images[i].remainingQuantity -= 1;

      layerIds.push(images[i].layerId);
      await this.layerRepository.update(
        { id: images[i].layerId },
        { isMinted: true }
      );
    }
    if (!nftOffchain) await this.imageRepository.save(images);

    let nft = new Nft();
    nft.artistId = collection.creatorId;
    nft.creatorId = creator.id;
    nft.collectionId = data.collectionId;
    nft.layerIds = layerIds.toString();
    nft.imageIds = data.imageIds.toString();
    nft.collectionName = collection.name;
    nft.chainId = collection.chainId;
    nft.contractAddress = collection.collectionAddress;
    nft.totalImg = images.length;
    nft.name = data.name;
    nft.slug = data.name;
    nft.description = data.description;
    nft.imageUrl = urlImage;
    nft.imageType = files[0].mimetype ? files[0].mimetype : null;
    nft.note = data.note;
    nft.price = data.price ? data.price : 0;
    nft.attributes = JSON.stringify(
      await this.convertAtributes(data.imageIds.toString())
    );
    nft.data = JSON.stringify({ dataIpfs });
    nft.metaData = JSON.stringify({ dataIpfs });
    nft.layerHash = hashUniqueNft;

    if (!nftOffchain) {
      const nftOffchain = new NftOffchain();
      nftOffchain.type = NftOffChainType.DRAFT;
      nftOffchain.collectionId = data.collectionId;
      nftOffchain.collectionKeyId = collection.id;
      nftOffchain.collectionAddress = collection.collectionAddress;
      nftOffchain.chainId = collection.chainId;
      nftOffchain.layerIds = layerIds.toString();
      nftOffchain.imageIds = data.imageIds.toString();
      nftOffchain.collectionName = collection.name;
      nftOffchain.name = data.name;
      nftOffchain.slug = data.name;
      nftOffchain.price = data.price ? data.price : 0;
      nftOffchain.imageUrl = urlImage;
      nftOffchain.description = data.description;
      nftOffchain.attributes = JSON.stringify(
        await this.convertAtributes(data.imageIds.toString())
      );
      nftOffchain.note = data.note;
      nftOffchain.imageType = files[0].mimetype ? files[0].mimetype : null;
      nftOffchain.artistId = collection.creatorId;
      nftOffchain.creatorId = creator.id;
      // Save a draft for mint nft fail case
      await this.nftOffchainRepository.save(nftOffchain);
    }
    log("!21212122121");
    nft = await this.nftRepository.save(nft);

    const fileName = await this.createJsonFile(data, nft, dataIpfs);
    nft.tokenUri = fileName;
    if (!fileName) return false;
    let contractPrice = Math.round(
      Number(nft.price) * Math.pow(10, 18)
    ).toString();
    //update tokenUri
    await this.nftRepository.update({ id: nft.id }, nft);
    console.log("nft.tokenUri", nft.tokenUri);
    let signature = await this.getSignature(
      currencyConfig.chainId,
      nft.collectionId,
      data.wallet,
      contractPrice,
      data.nextTokenId,
      fileName,
      hashUniqueNft
    );

    return {
      ...nft,
      url_ipfs: nft.id,
      signature,
      hashUniqueNft,
    };
  }

  async generate(collectionId: number) {
    const collection = await this.collectionRepository.findOne(collectionId);
    if (!collection) throw Causes.COLLECTION_NOT_EXISTS;

    const layers = await this.layerRepository.find({
      collectionId: collectionId,
    });

    if (layers.length == 0) throw Causes.COLLECTION_CONTAINS_NO_LAYER;

    const images = await this.imageRepository.find({
      collectionId: collectionId,
    });

    const numberOfLayer = layers.length;
    const resultLayerCombination = [];

    for (let i = 1; i <= numberOfLayer; i++) {
      const ans = [];
      const tmp = [];
      makeCombination(numberOfLayer, i, ans, tmp);
      const newAns = [...ans];
      resultLayerCombination.push(newAns);
    }

    const layerImageCombinations = [];
    for (let i = 0; i < resultLayerCombination.length; i++) {
      for (let j = 0; j < resultLayerCombination[i].length; j++) {
        const layerCombination = resultLayerCombination[i][j];
        const layerImageCombination = [];
        for (let k = 0; k < layerCombination.length; k++) {
          const layer = layers[layerCombination[k] - 1];
          const layerImages = images.filter((e) => e.layerId == layer.id);
          const layerImageIds = layerImages.map((e) => e.id);
          layerImageCombination.push(layerImageIds);
        }
        layerImageCombinations.push(layerImageCombination);
      }
    }

    let allImageCombinations = [];
    for (let i = 0; i < layerImageCombinations.length; i++) {
      allImageCombinations.push(
        ...makeCombinationFromMultipleArray(layerImageCombinations[i])
      );
    }

    const validImageCombinations = [];
    for (let i = 0; i < allImageCombinations.length; i++) {
      const hashUniqueNft =
        "0x" +
        hashString(
          allImageCombinations[i].toString() +
            collection.collectionAddress +
            collection.chainId
        );

      const nftData = await getConnection()
        .createQueryBuilder(Nft, "nft")
        .where("nft.status is not null and nft.layer_hash = :layerHash", {
          layerHash: hashUniqueNft,
        })
        .getRawOne();

      console.log(
        allImageCombinations[i].toString(),
        collection.collectionAddress,
        collection.chainId
      );
      console.log(hashUniqueNft);

      const checkImages = await getConnection()
        .createQueryBuilder(Image, "image")
        .leftJoin(Layer, "layer", "image.layer_id = layer.id")
        .select(
          `
                        image.id as id, image.image_url as imageUrl, image.name as name,
                        image.description as description, image.image_type as imageType,
                        image.quantity as quantity, image.remaining_quantity as remainingQuantity,
                        image.probability as probability, image.price as price,
                        image.contract_price as contractPrice, image.percent as percent,
                        image.is_minted as isMinted, image.created_at as createdAt,
                        image.layer_id as layerId, image.updated_at as updatedAt,
                        layer.layer_index as layerIndex, layer.name as layerName
                        `
        )
        .where(`image.id in (${allImageCombinations[i].toString()})`)
        .getRawMany();

      const checkQuantity = checkImages.find((e) => e.remainingQuantity <= 0);

      if (!nftData && !checkQuantity) {
        validImageCombinations.push(allImageCombinations[i]);
      }
    }

    console.log(validImageCombinations);
    const generatedImages =
      validImageCombinations[
        Math.floor(Math.random() * validImageCombinations.length)
      ];
    if (generatedImages) {
      return await getConnection()
        .createQueryBuilder(Image, "image")
        .leftJoin(Layer, "layer", "image.layer_id = layer.id")
        .select(
          `
                        image.id as id, image.image_url as imageUrl, image.name as name,
                        image.description as description, image.image_type as imageType,
                        image.quantity as quantity, image.remaining_quantity as remainingQuantity,
                        image.probability as probability, image.price as price,
                        image.contract_price as contractPrice, image.percent as percent,
                        image.is_minted as isMinted, image.created_at as createdAt,
                        image.layer_id as layerId, image.updated_at as updatedAt,
                        layer.layer_index as layerIndex, layer.name as layerName
                        `
        )
        .where(`image.id in (${generatedImages.toString()})`)
        .getRawMany();
    } else {
      throw Causes.CANNOT_GENERATE_NEW_NFT;
    }
  }

  async getCombination(totalCombination: number, collectionId: number) {
    const collection = await this.collectionRepository.findOne(collectionId);
    if (!collection) throw Causes.COLLECTION_NOT_EXISTS;

    const layers = await this.layerRepository.find({
      collectionId: collectionId,
    });

    const images = await this.imageRepository
      .createQueryBuilder("image")
      .leftJoin(Layer, "layer", "image.layer_id = layer.id")
      .where("layer.collection_id = :collectionId", {
        collectionId: collectionId,
      })
      .select(
        "image.id as imageId, image.remaining_quantity as max, image.layer_id as layerId"
      )
      .execute();

    const layerData = [];
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const layerImages = images.filter((e) => e.layerId == layer.id);
      layerData.push({
        ...layer,
        images: layerImages,
      });
    }

    const layerSet = layerData.map((e) => e.images);
    const imageData = images.map((e) => {
      return {
        id: e.imageId,
        max: e.max,
      };
    });

    const product = this.cartesianProduct(layerSet);

    const validProduct = [];

    for (let i = 0; i < product.length; i++) {
      let valid = true;
      let imageChange = [];
      for (let j = 0; j < product[i].length; j++) {
        let image;
        for (let k = 0; k < imageData.length; k++) {
          if (imageData[k].id == product[i][j].imageId) {
            image = imageData[k];
            break;
          }
        }

        if (image.max <= 0) {
          valid = false;
          break;
        }

        imageChange.push(image);
      }

      if (valid) {
        validProduct.push(product[i]);
        for (let j = 0; j < imageChange.length; j++) {
          imageChange[j].max--;
        }
      }
    }

    return validProduct.slice(
      0,
      totalCombination < validProduct.length
        ? totalCombination
        : validProduct.length
    );
  }

  cartesianProduct(arrays) {
    function _cartesianProduct(index, output) {
      if (index === arrays.length) {
        return output;
      }
      var currentArray = arrays[index];
      var result = [];
      for (var i = 0; i < currentArray.length; i++) {
        for (var j = 0; j < output.length; j++) {
          result.push(output[j].concat(currentArray[i]));
        }
      }
      return _cartesianProduct(index + 1, result);
    }

    return _cartesianProduct(0, [[]]);
  }

  async generateNtf(collectionId: number) {
    let collectionData = await this.collectionRepository.findOne({
      id: collectionId,
    });
    let combinations = await this.getCombination(
      collectionData ? collectionData.totalNfts : 10,
      collectionId
    );
    let generatedNfts = [];

    for (let i = 0; i < combinations.length; i++) {
      let combination = combinations[i];
      let imageIds = [];
      for (let j = 0; j < combination.length; j++) {
        imageIds.push(combination[j].imageId);
      }

      generatedNfts.push(imageIds);
    }

    const urls = [];
    let dataSave = {
      collectionId: collectionId,
      imageIds: "",
      name: "",
      description: "automatically mint NFT",
      note: "automatically mint NFT",
      price: 0,
      images: "",
    };
    for (let i = 0; i < generatedNfts.length; i++) {
      const url = await this.overlayImages(generatedNfts[i]);
      if (url) {
        urls.push(url);
        dataSave.imageIds = generatedNfts[i];
        console.log("generatedNfts[i]", generatedNfts[i]);
        dataSave.images = url;
        dataSave.name = "DRAFT_" + generatedNfts[i].toString();
        dataSave.price = await this.sumPrice(generatedNfts[i]);
        await this.createOffchainDraft(dataSave);
      }
    }

    return urls;
  }

  async createDraftCollection(id: number) {
    const collection = await this.collectionRepository.findOne(id);
    collection.isCreateDraft = true;

    if (!collection) {
      throw Causes.DATA_INVALID;
    }

    try {
      await this.generateNtf(id);
      return await this.collectionRepository.save(collection);
    } catch (e) {
      console.log(e);
    }
  }

  async createOffchainDraft(data: any) {
    console.log("data", data);
    const urlImage = data.images;

    let collection;
    let type = NftOffChainType.CUSTOMIZED;

    collection = await this.collectionRepository.findOne({
      id: data.collectionId,
    });

    console.log("collection", collection);

    data.imageIds = data.imageIds.toString();
    // const currencyConfig = await this.currencyConfigRepository.findOne({
    //     chainId: collection.chainId
    // });

    // const collectionControllerContract = smartContract('./smart-contract/CollectionController.json',
    //     'collectionController', currencyConfig, 'utf-8');
    // const hashUniqueNft = '0x' + hashString(data.imageIds.toString() + collection.collectionAddress + collection.chainId);
    // const isNftMint = await collectionControllerContract.methods.isLayerMinted(hashUniqueNft).call();

    // if (isNftMint) {
    //     throw Causes.ERROR_DATA_NFTS;
    // }

    let layerIds = [];
    const images = await this.imageRepository.findByIds(data.imageIds);
    console.log("images", images);
    for (let i = 0; i < images.length; i++) {
      if (images[i].remainingQuantity <= 0) {
        throw Causes.IMAGE_IS_NOT_ENOUGH(images[i].id);
      }
      images[i].remainingQuantity -= 1;
      layerIds.push(images[i].layerId);
    }
    await this.imageRepository.save(images);

    let nftOffchain = new NftOffchain();
    nftOffchain.type = type;
    nftOffchain.collectionId = collection.collectionId;
    nftOffchain.collectionKeyId = collection.id;
    nftOffchain.collectionAddress = collection.collectionAddress;
    nftOffchain.chainId = collection.chainId;
    nftOffchain.layerIds = layerIds.toString();
    nftOffchain.imageIds = data.imageIds.toString();
    nftOffchain.collectionName = collection.name;
    nftOffchain.name = data.name;
    nftOffchain.slug = data.name;
    nftOffchain.description = data.description;
    nftOffchain.imageUrl = urlImage;
    nftOffchain.imageType = null;
    nftOffchain.note = data.note;
    nftOffchain.price = Number(data.price) ? Number(data.price) : 0;
    nftOffchain.attributes = JSON.stringify(
      await this.convertAtributes(data.imageIds.toString())
    );
    nftOffchain.artistId = collection.creatorId;
    nftOffchain.creatorId = collection.creatorId;

    nftOffchain = await this.nftOffchainRepository.save(nftOffchain);

    console.log(nftOffchain);
    return nftOffchain;
  }

  async overlayImages(imageIds: number[]) {
    try {
      const images = await this.imageRepository
        .createQueryBuilder("image")
        .where("image.id in (:...imageIds)", { imageIds: imageIds })
        .getMany();

      const imageDatas = [];
      // for (let i = 0; i < images.length; i++) {
      //     const image = await loadImage(images[i].imageUrl);
      //     imageDatas.push(image);
      // }

      // const canvas = createCanvas(imageDatas[0].width, imageDatas[0].height);
      // const ctx = canvas.getContext('2d');

      // for (let i = 0; i < imageDatas.length; i++) {
      //     ctx.drawImage(imageDatas[i], 0, 0);
      // }

      // const dataURL = canvas.toDataURL('image/png');
      // const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, '');
      const base64Data = null;
      const buffer = Buffer.from(base64Data, "base64");
      const fileName = uuidv4() + ".png";
      const bucketS3 = process.env.AWS_BUCKET;

      const imageUpload = await this.uploadS3(buffer, bucketS3, fileName);
      return imageUpload.Location;
    } catch (e) {
      console.log(e);
    }

    return "";
  }

  async sumPrice(imageIds: number[]) {
    const images = await this.imageRepository
      .createQueryBuilder("image")
      .where("image.id in (:...imageIds)", { imageIds: imageIds })
      .select("SUM(image.price) as sumPrice")
      .execute();
    return images[0].sumPrice;
  }

  async uploadS3(buffer, bucket, name): Promise<any> {
    const s3 = this.getS3();
    const params = {
      Bucket: bucket,
      Key: "collections/" + String(name),
      Body: buffer,
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err.message);
        }
        return resolve(data);
      });
    });
  }

  getS3() {
    return new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async createJsonFile(data: any, nft: Nft, dataIpfs: any) {
    let attributes = JSON.parse(nft.attributes);

    const jsonData = {
      name: data.name,
      description: data.description,
      off_chain_url: process.env.URL_BACKEND + "nft/meta-data/" + nft.id,
      attributes: attributes,
      image: process.env.PINATA_PATH + dataIpfs.IpfsHash,
      animation_url: process.env.PINATA_PATH + dataIpfs.IpfsHash,
    };

    var promises_1 = require("fs").promises;

    const fileName = nft.id + ".json";
    await promises_1.writeFile(
      join(process.cwd(), "ipfs", fileName),
      JSON.stringify(jsonData)
    );

    return fileName;
  }

  convertProperties(data) {
    let metaData = {};
    if (data.length > 0) {
      for (let item in data) {
        let attributes = data[item];
        metaData[attributes.type] = attributes.name;
      }
    }
    return metaData;
  }

  async convertAtributes(data) {
    let attributes = [];

    try {
      if (data) {
        let dataConvert = data.split(",");
        for (let item of dataConvert) {
          let image = await getConnection()
            .getRepository(Image)
            .findOne({ id: item });
          if (!image) continue;
          let layer = await getConnection()
            .getRepository(Layer)
            .findOne({ id: image.layerId });

          attributes.push({
            imageName: image.name,
            imageProbability: image.probability,
            imageDescription: image.description,
            imageQuantity: image.quantity,
            imagePrice: image.price,
            imagePercent: image.percent,
            imageRemainingQuantity: image.remainingQuantity,
            layerName: layer.name,
          });
        }
      }
    } catch (error) {
      console.log("convertAtributes::error", error);
    }

    return attributes;
  }

  async uploadOnIpfs(file: any) {
    const axios = require("axios");
    // const fs = require("fs");
    const FormData = require("form-data");
    const { Readable } = require("stream");

    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let data = new FormData();

    // const buffer = Buffer.from(dataNft.imageUrl);
    const stream = Readable.from(file.buffer);
    const filename = `${Date.now()}_${file.originalname}`;
    stream.path = filename;

    data.append("file", stream);
    // data.append("file", file);

    return axios
      .post(url, data, {
        headers: {
          "Content-Type": `multipart/form-data; boundary= ${data._boundary}`,
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
        },
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log("error:", error);
        return false;
      });
  }

  async uploadOnS3(file: any) {
    const s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const uploadResult = await s3
      .upload({
        Bucket: process.env.AWS_BUCKET,
        Key: "nfts/" + uuidv4(),
        Body: file.buffer,
      })
      .promise();

    if (!uploadResult || !uploadResult.Location) throw Causes.ERROR_S3;

    return uploadResult.Location;
  }

  async getDetailNft(id: number) {
    return this.nftRepository.findOne(id);
  }

  async getDetailNftOffchain(id: number) {
    let nftOffchain = await getConnection()
      .createQueryBuilder(NftOffchain, "nft_offchain")
      .leftJoin(
        Collection,
        "collection",
        `
            collection.id = nft_offchain.collection_key_id
            `
      )
      .leftJoin(
        User,
        "user",
        `
            user.id = nft_offchain.creatorId
            `
      )
      .select(
        `
            nft_offchain.id, nft_offchain.type, nft_offchain.collection_id as collectionId,
            nft_offchain.layer_ids as layerIds, nft_offchain.image_ids as imageIds,
            nft_offchain.collection_name as collectionName, nft_offchain.name as name,
            nft_offchain.slug as slug, nft_offchain.price as price,
            nft_offchain.image_url as imageUrl, nft_offchain.description as description,
            nft_offchain.note as note, nft_offchain.attributes as attributes,
            nft_offchain.image_type as imageType, nft_offchain.image_type as imageType,
            nft_offchain.image_type as imageType, nft_offchain.image_type as imageType,
            nft_offchain.collection_address as collectionAddress, nft_offchain.chain_id as chainId,
            nft_offchain.creatorId as creatorId, nft_offchain.updated_at as updatedAt
            `
      )
      .addSelect(
        `collection.id as collectionKeyId,
                  collection.image_url as collectionImageUrl`
      )
      .addSelect(
        `user.username as creatorUserName,
        user.avatar_url as creatorImageUrl`
      )
      .where(`nft_offchain.id = :id`, { id })
      .getRawOne();
    const images = await getConnection()
      .createQueryBuilder(Image, "image")
      .leftJoin(Layer, "layer", "image.layer_id = layer.id")
      .select(
        `
            image.id as id, image.image_url as imageUrl, image.name as name,
            image.description as description, image.image_type as imageType,
            image.quantity as quantity, image.remaining_quantity as remainingQuantity,
            image.probability as probability, image.price as price,
            image.contract_price as contractPrice, image.percent as percent,
            image.is_minted as isMinted, image.created_at as createdAt,
            image.layer_id as layerId, image.updated_at as updatedAt,
            layer.layer_index as layerIndex, layer.name as layerName
            `
      )
      .where(`image.id in (${nftOffchain.imageIds})`)
      .getRawMany();
    nftOffchain.images = images;
    return nftOffchain;
  }

  async getListNftOffchains(params, paginationOptions: IPaginationOptions) {
    let offset = this.getOffset(paginationOptions);
    let limit = Number(paginationOptions.limit);

    let queryBuilder = getConnection()
      .createQueryBuilder(NftOffchain, "nft_offchain")
      .select(
        `
            nft_offchain.id, nft_offchain.type, nft_offchain.collection_id as collectionId,
            nft_offchain.collection_key_id as collectionKeyId,
            nft_offchain.layer_ids as layerIds, nft_offchain.image_ids as imageIds,
            nft_offchain.collection_name as collectionName, nft_offchain.name as name,
            nft_offchain.slug as slug, nft_offchain.price as price,
            nft_offchain.image_url as imageUrl, nft_offchain.description as description,
            nft_offchain.note as note, nft_offchain.attributes as attributes,
            nft_offchain.image_type as imageType, nft_offchain.image_type as imageType,
            nft_offchain.artist_id as artistId, nft_offchain.created_at as createdAt,
            nft_offchain.creatorId as creatorId, nft_offchain.updated_at as updatedAt
            `
      )
      .orderBy("nft_offchain.created_at", "DESC")
      .limit(limit)
      .offset(offset);

    let queryCount = getConnection()
      .createQueryBuilder(NftOffchain, "nft_offchain")
      .select(" Count (1) as Total")
      .orderBy("nft_offchain.created_at", "DESC");

    if (params.collectionId) {
      queryBuilder.andWhere(`nft_offchain.collection_id = :collectionId`, {
        collectionId: params.collectionId,
      });
      queryCount.andWhere(`nft_offchain.collection_id = :collectionId`, {
        collectionId: params.collectionId,
      });
    }

    if (params.collectionKeyId) {
      queryBuilder.andWhere(
        `nft_offchain.collection_key_id = :collectionKeyId`,
        { collectionKeyId: params.collectionKeyId }
      );
      queryCount.andWhere(`nft_offchain.collection_key_id = :collectionKeyId`, {
        collectionKeyId: params.collectionKeyId,
      });
    }

    if (params.collectionAddress) {
      queryBuilder.andWhere(
        `nft_offchain.collection_address = :collectionAddress`,
        { collectionAddress: params.collectionAddress }
      );
      queryCount.andWhere(
        `nft_offchain.collection_address = :collectionAddress`,
        { collectionAddress: params.collectionAddress }
      );
    }

    if (params.chainId) {
      queryBuilder.andWhere(`nft_offchain.chain_id = :chainId`, {
        chainId: params.chainId,
      });
      queryCount.andWhere(`nft_offchain.chain_id = :chainId`, {
        chainId: params.chainId,
      });
    }

    if (params.type) {
      queryBuilder.andWhere(
        `nft_offchain.type like '%!${params.type.trim()}%' ESCAPE '!'`
      );
      queryCount.andWhere(
        `nft_offchain.type like '%!${params.type.trim()}%' ESCAPE '!'`
      );
    }

    if (params.userId) {
      queryBuilder.andWhere(`nft_offchain.creator_id = :userId`, {
        userId: params.userId,
      });
      queryCount.andWhere(`nft_offchain.creator_id = :userId`, {
        userId: params.userId,
      });
    }

    const nftOffchains = await queryBuilder.execute();
    const nftOffchainsCountList = await queryCount.execute();

    const { items, meta } = getArrayPaginationBuildTotal<Nft>(
      nftOffchains,
      nftOffchainsCountList,
      paginationOptions
    );

    return {
      results: items,
      pagination: meta,
    };
  }

  async n_getListAllNfts(params, paginationOptions: IPaginationOptions) {
    let offset = this.getOffset(paginationOptions);
    let limit = Number(paginationOptions.limit);

    //TODO: check permission of artist

    let queryBuilder = getConnection()
      .createQueryBuilder(Nft, "nft")
      .select(
        `nft.id, nft.collection_id as collectionId, nft.name as name, nft.token_id,
            nft.token_uri as tokenUri, nft.status as status, nft.chain_id as chainId, nft.contract_address as contractAddress, 
            nft.collection_name as collectionName, nft.slug as slug, nft.image_url as imageUrl, nft.description, 
            nft.note as note, nft.data,nft.meta_data as metaData, nft.files, nft.attributes, nft.image_type as imageType, nft.owner as owner`
      )
      .where(`nft.status = '${OnchainStatus.CONFIRMED}'`)
      .orderBy("nft.created_at", "DESC")
      .limit(limit)
      .offset(offset);

    let queryCount = getConnection()
      .createQueryBuilder(Nft, "nft")
      .select(" Count (1) as Total")
      .where(`nft.status = '${OnchainStatus.CONFIRMED}'`)
      .orderBy("nft.created_at", "DESC");

    if (params.name) {
      queryBuilder.andWhere(
        `nft.name like '%!${params.name.trim()}%' ESCAPE '!'`
      );
      queryCount.andWhere(
        `nft.name like '%!${params.name.trim()}%' ESCAPE '!'`
      );
    }

    if (params.chainId) {
      queryBuilder.andWhere(
        `nft.chainId like '%!${params.chainId.trim()}%' ESCAPE '!'`
      );
      queryCount.andWhere(
        `nft.chainId like '%!${params.chainId.trim()}%' ESCAPE '!'`
      );
    }

    if (params.collectionId) {
      queryBuilder.andWhere(
        `nft.collectionId like '%!${params.collectionId.trim()}%' ESCAPE '!'`
      );
      queryCount.andWhere(
        `nft.collectionId like '%!${params.collectionId.trim()}%' ESCAPE '!'`
      );
    }

    if (params.contractAddress) {
      queryBuilder.andWhere(
        `nft.contractAddress like '%!${params.contractAddress.trim()}%' ESCAPE '!'`
      );
      queryCount.andWhere(
        `nft.contractAddress like '%!${params.contractAddress.trim()}%' ESCAPE '!'`
      );
    }

    if (params.userId) {
      queryBuilder.andWhere(`nft.artist_id = :userId`, {
        userId: params.userId,
      });
      queryCount.andWhere(`nft.artist_id = :userId`, { userId: params.userId });
    }

    const nfts = await queryBuilder.execute();
    const nftsCountList = await queryCount.execute();

    const { items, meta } = getArrayPaginationBuildTotal<Nft>(
      nfts,
      nftsCountList,
      paginationOptions
    );

    return {
      results: items,
      pagination: meta,
    };
  }

  async getListNfts(params, paginationOptions: IPaginationOptions) {
    let offset = this.getOffset(paginationOptions);
    let limit = Number(paginationOptions.limit);

    //TODO: check permission of artist

    let queryBuilder = getConnection()
      .createQueryBuilder(Nft, "nft")
      .select(
        `nft.id, nft.collection_id as collectionId, nft.name as name, nft.token_id,
            nft.token_uri as tokenUri, nft.status as status, nft.chain_id as chainId, nft.contract_address as contractAddress, 
            nft.collection_name as collectionName, nft.slug as slug, nft.image_url as imageUrl, nft.description, 
            nft.price as price, nft.contract_price as contractPrice, 
            nft.note as note, nft.data,nft.meta_data as metaData, nft.files, nft.attributes, nft.image_type as imageType, nft.owner as owner`
      )
      .where(`nft.status = '${OnchainStatus.CONFIRMED}'`)
      .orderBy("nft.created_at", "DESC")
      .limit(limit)
      .offset(offset);

    let queryCount = getConnection()
      .createQueryBuilder(Nft, "nft")
      .select(" Count (1) as Total")
      .where(`nft.status = '${OnchainStatus.CONFIRMED}'`)
      .orderBy("nft.created_at", "DESC");

    if (params.name) {
      queryBuilder.andWhere(
        `nft.name like '%!${params.name.trim()}%' ESCAPE '!'`
      );
      queryCount.andWhere(
        `nft.name like '%!${params.name.trim()}%' ESCAPE '!'`
      );
    }

    if (params.chainId) {
      queryBuilder.andWhere(
        `nft.chainId like '%!${params.chainId.trim()}%' ESCAPE '!'`
      );
      queryCount.andWhere(
        `nft.chainId like '%!${params.chainId.trim()}%' ESCAPE '!'`
      );
    }

    if (params.collectionId) {
      queryBuilder.andWhere(
        `nft.collectionId like '%!${params.collectionId.trim()}%' ESCAPE '!'`
      );
      queryCount.andWhere(
        `nft.collectionId like '%!${params.collectionId.trim()}%' ESCAPE '!'`
      );
    }

    if (params.userId) {
      queryBuilder.andWhere(`nft.creator_id = :userId`, {
        userId: params.userId,
      });
      queryCount.andWhere(`nft.creator_id = :userId`, {
        userId: params.userId,
      });
    }

    const nfts = await queryBuilder.execute();
    const nftsCountList = await queryCount.execute();

    const { items, meta } = getArrayPaginationBuildTotal<Nft>(
      nfts,
      nftsCountList,
      paginationOptions
    );

    return {
      results: items,
      pagination: meta,
    };
  }

  handleStatusNft(nft) {
    if (nft && (nft.is_onsale || nft.isOnsale))
      return { ...nft, status: "onsale" };
    return { ...nft, status: "none" };
  }

  setParam(params: any) {
    var dataWhere = {};

    return dataWhere;
  }

  getOffset(paginationOptions: IPaginationOptions) {
    let offset = 0;
    if (paginationOptions.page && paginationOptions.limit) {
      if (paginationOptions.page > 0) {
        offset =
          (Number(paginationOptions.page) - 1) *
          Number(paginationOptions.limit);
      }
    }
    return offset;
  }

  async getSignature(
    chainId,
    collectionID,
    sender,
    fee,
    tokenId,
    tokenUri,
    layerHash
  ) {
    let dataHash = this.encodeData(
      chainId,
      collectionID,
      sender,
      fee,
      tokenId,
      tokenUri,
      layerHash
    );
    let signature = null;
    console.log(
      "chainId, collectionID, sender, fee, tokenId, layerHash",
      chainId,
      collectionID,
      sender,
      fee,
      tokenId,
      tokenUri,
      layerHash
    );
    let messageHashBinary = ethers.utils.arrayify(dataHash);
    let wallet = new ethers.Wallet(
      "647a9e855888b072d447fab6a0a71fd9534998476e3fd42b62f707eea7df1bcb"
    );
    console.log("wallet", wallet);
    signature = await wallet.signMessage(messageHashBinary);

    return signature;
  }

  encodeData(
    _chainId,
    _collectionID,
    _sender,
    _fee,
    _tokenId,
    _tokenUri,
    _layerHash
  ) {
    if (
      !_chainId ||
      !_collectionID ||
      !_sender ||
      !_fee ||
      !_tokenId ||
      !_layerHash
    ) {
      throw Causes.MISSING_PARAMS_WHEN_GENERATING_SIGNATURE;
    }
    console.log(
      "_chainId,_collectionID, _sender, _fee, _tokenId, _tokenUri, _layerHash",
      _chainId,
      _collectionID,
      _sender,
      _fee,
      _tokenId,
      _tokenUri,
      _layerHash
    );
    const payload = ethers.utils.defaultAbiCoder.encode(
      [
        "uint256",
        "uint256",
        "address",
        "uint256",
        "uint256",
        "string",
        "bytes",
      ],
      [_chainId, _collectionID, _sender, _fee, _tokenId, _tokenUri, _layerHash]
    );
    return ethers.utils.keccak256(payload);
  }
}
