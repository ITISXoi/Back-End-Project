import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Admin, Collection, CurrencyConfig,CurrencyToken, Image, Layer, Nft} from '../../database/entities';
import {getConnection, Repository} from 'typeorm';
import {IPaginationOptions} from 'nestjs-typeorm-paginate';
import {PaginationResponse} from 'src/config/rest/paginationResponse';
import {getArrayPaginationBuildTotal} from 'src/shared/Utils';
import {S3} from 'aws-sdk';
import axios from 'axios';
import {UpdateCollection} from './request/update-collection.dto';
import {S3Handler} from "../../shared/S3Handler";
import {Causes} from "../../config/exception/causes";
import {CreateLayer} from "./request/create-layer.dto";
import {CreateImage} from "./request/create-image.dto";
import { v4 as uuidv4 } from 'uuid';
import {UpdateLayer} from "./request/update-layer.dto";
import sharp from 'sharp';

@Injectable()
export class CollectionService {
    constructor(
        @InjectRepository(Collection)
        private readonly collectionRepo: Repository<Collection>,

        @InjectRepository(Layer)
        private readonly layerRepo: Repository<Layer>,

        @InjectRepository(Image)
        private readonly imageRepo: Repository<Image>,

        // S3 handler
        private readonly s3handler: S3Handler
    ) {
    }

    async createCollection(data: any, files: any, admin: Admin) {
        const insertCollection = data;
        console.log('insertCollection',insertCollection)
        let checkCollectionName = await this.collectionRepo.findOne({
            name: data.name,
        });

        if (checkCollectionName) {
            throw Causes.COLLECTION_NAME_EXISTS;
        }


        let collection = new Collection();

        collection.name = insertCollection.name;
        collection.symbol = insertCollection.symbol;
        collection.type = insertCollection.type;
        collection.startMintTime = insertCollection.startMintTime;
        collection.endMintTime = insertCollection.endMintTime
            ? insertCollection.endMintTime
            : null;
        collection.imageUrl = insertCollection.imageUrl
            ? insertCollection.imageUrl
            : null;
        collection.bannerUrl = insertCollection.bannerUrl
            ? insertCollection.bannerUrl
            : null;
        collection.description = insertCollection.description
            ? insertCollection.description
            : null;

        const currencyConfig = await getConnection()
            .createQueryBuilder(CurrencyConfig, "currency_config")
            .select(
                "currency_config.swap_id as swapId, currency_config.chain_id as chainId, currency_config.network as network," +
                " currency_config.chain_name as chainName, currency_config.average_block_time as averageBlockTime, currency_config.required_confirmations as requiredConfirmations," +
                " currency_config.rpc_endpoint as rpcEndpoint"
            )
            .where("currency_config.chain_id = :chainId", {
                chainId: insertCollection.chainId,
            })
            .execute();
        if (!currencyConfig[0]) {
            throw Causes.CHAIN_ID_NOT_EXISTS;
        }

        collection.address = insertCollection.address;
        collection.paymentToken = insertCollection.paymentToken;
        collection.price = insertCollection.price;
        collection.chainId = insertCollection.chainId;
        collection.totalNfts = insertCollection.totalNfts;
        // collection.numberLayers = insertCollection.numberLayers;
        collection.creatorId = admin.id;
        collection.isAutoMint = insertCollection.isAutoMint;

        // Just artist can create collection
        if (!(admin.type == 2)) {
            throw Causes.USER_DONT_HAVE_PERMISSION;
        }

        if (files) {
            if (files.image) {
                const imageUpload = await this.upload(files.image);

                if (!imageUpload || !imageUpload.Location) return false;
                collection.imageUrl = imageUpload.Location;
            }

            if (files.banner) {
                const bannerUpload = await this.upload(files.banner);

                if (!bannerUpload || !bannerUpload.Location) return false;
                collection.bannerUrl = bannerUpload.Location;
            }
        }
        collection = await this.collectionRepo.save(collection);

        return {...collection,currency:data.currency};
    }


    async createLayerImages(data: any, files: any, admin: Admin) {
    //async createLayerImages(data: any, files: any) {
        const collection = await this.collectionRepo.findOne(data.collectionId);
        if(admin.type === 2 && admin.id !== collection.creatorId) {
            throw Causes.USER_NOT_ACCESS;
        }

        const queryRunner = getConnection().createQueryRunner();

        await queryRunner.startTransaction();
        let listImageUrl : string[] = [];
        try {
           const layerUpdate = await this.layerRepo.findOne({collectionId:data.collectionId,layerIndex:data.layerIndex});
            if(layerUpdate){
                await Promise.all([
                    await queryRunner.manager.createQueryBuilder(Layer, "layer").where('layer.id = :layerUpdateId', {layerUpdateId: layerUpdate.id}).delete().execute(),
                    await queryRunner.manager.createQueryBuilder(Image, "image").where('image.collection_id = :collectionId and image.layer_id = :layerId', { collectionId:data.collectionId,layerId:layerUpdate.id }).delete().execute(),
                    ]
                );
            }

            const insertLayer = data;

            let layer = new Layer();
            layer.name = insertLayer.name;
            layer.description = insertLayer.description ? insertLayer.description : null;

            layer.creatorId = admin.id;
            layer.collectionId = data.collectionId;
            layer.layerIndex = data.layerIndex;
            layer = await queryRunner.manager.save(layer);
            const imageData = JSON.parse(data.imagesDescription);
            
            for (let i = 0; i < files.length; i++) {
                const uri = await this.upload(files[i], 180);
                let image = new Image();
                image.name = imageData[i].name;
                image.description = imageData[i].description;
                image.quantity = imageData[i].quantity;
                image.remainingQuantity = imageData[i].quantity;
                image.percent = imageData[i].probability ? imageData[i].probability : 0;
                image.probability = imageData[i].probability ? imageData[i].probability : 0;
                image.price = imageData[i].price;
                image.imageUrl  = uri.Location;
                image.creatorId = admin.id;
                image.collectionId = data.collectionId;
                image.layerId = layer.id;

                listImageUrl.push(uri.Location)
                
                image = await queryRunner.manager.save(image);
            }
            await queryRunner.commitTransaction();
            return layer; 
        } catch (error) {
            await queryRunner.rollbackTransaction();
            for(let i = 0; i < listImageUrl.length; i++) {
                const keyS3 = this.splitImageUri(listImageUrl[i]);
                await this.delete(keyS3, 180);
            }
            throw error;
        } finally {
            // you need to release a queryRunner which was manually instantiated
            await queryRunner.release();
        }
    }


    async updateLayerImages(data: any, files: any, admin: Admin) {

        const collection = await this.collectionRepo.findOne(data.collectionId);
        if(admin.type === 2 && admin.id !== collection.creatorId) {
            throw Causes.USER_NOT_ACCESS;
        }

        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.startTransaction();
        let listImageUrl : string[] = [];
        try {
            const insertLayer = data;
            const imageData = JSON.parse(data.imagesDescription);
            const dataUpdate = JSON.parse(data.dataUpdate);
            const layerUpdate = await this.layerRepo.findOne({collectionId:data.collectionId,layerIndex:data.layerIndex});

            if (!layerUpdate) {
                throw Causes.LAYER_NOT_EXISTS;
            }

            layerUpdate.name = insertLayer.name;
            layerUpdate.description = insertLayer.description ? insertLayer.description : null;
            layerUpdate.creatorId = admin.id;
            layerUpdate.collectionId = data.collectionId;
            layerUpdate.layerIndex = data.layerIndex;

            await queryRunner.manager.save(layerUpdate);
            let oldImageUrl = [];
            let newImageUrl = [];
            if(layerUpdate){
                const deleteImageUrlData = await queryRunner.manager.createQueryBuilder(Image, 'img').select('image_url').where('collection_id = :collectionId and layer_id = :layerId and is_minted = 0', { collectionId:data.collectionId,layerId:layerUpdate.id }).execute();
                for(let i = 0; i < deleteImageUrlData.length; i++ ) {
                    oldImageUrl.push(deleteImageUrlData[i].image_url)
                }
                await Promise.all([
                    await queryRunner.manager.createQueryBuilder(Image, 'img').where('collection_id = :collectionId and layer_id = :layerId and is_minted = 0', { collectionId:data.collectionId,layerId:layerUpdate.id }).delete().execute(),
                    ]
                );
            }
            if(files &&files.length > 0 ){
                for (let i = 0; i < files.length; i++) {
                    const uri = await this.upload(files[i], 180);
                    console.log(" imageData[i]", imageData[i]);
                    let image = new Image();
                    image.name = imageData[i].name;
                    image.description = imageData[i].description;
                    image.quantity = imageData[i].quantity;
                    image.remainingQuantity = imageData[i].quantity;
                    image.percent = imageData[i].probability ? imageData[i].probability : 0;
                    image.probability = imageData[i].probability ? imageData[i].probability : 0;;
                    image.price = imageData[i].price;
                    image.imageUrl  = uri.Location;
                    image.creatorId = admin.id;
                    image.collectionId = data.collectionId;
                    image.layerId = layerUpdate.id;

                    listImageUrl.push(uri.Location)
                    image = await queryRunner.manager.save(image);
                }

            }
            if(dataUpdate && dataUpdate.length > 0){
                for (let i = 0; i < dataUpdate.length; i++) {
                    console.log(dataUpdate[i])
                    let image = new Image();
                    image.name = dataUpdate[i].name;
                    image.description = dataUpdate[i].description;
                    image.quantity = dataUpdate[i].quantity;
                    image.remainingQuantity = dataUpdate[i].quantity;
                    image.percent = dataUpdate[i].probability ? dataUpdate[i].probability : 0;
                    image.probability = dataUpdate[i].probability ? dataUpdate[i].probability : 0;
                    image.price = dataUpdate[i].price;
                    image.imageUrl  = dataUpdate[i].imageUrl;
                    image.creatorId = admin.id;
                    image.collectionId = data.collectionId;
                    image.layerId = layerUpdate.id;
                    
                    newImageUrl.push(dataUpdate[i].imageUrl);
                    image = await queryRunner.manager.save(image);
                }
            }
            await queryRunner.commitTransaction();
            for(let i = 0; i < oldImageUrl.length; i++) {
                if(!newImageUrl.includes(oldImageUrl[i])) {
                    const keyS3 = this.splitImageUri(oldImageUrl[i]);
                    console.log(oldImageUrl[i]);
                    this.delete(keyS3, 180);
                }
            }
            return layerUpdate;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            for(let i = 0; i < listImageUrl.length; i++) {
                const keyS3 = this.splitImageUri(listImageUrl[i]);
                await this.delete(keyS3, 180);
            }
            throw error;
        } finally {
            // you need to release a queryRunner which was manually instantiated
            await queryRunner.release()
        }
        
    }

    async createLayer(data: CreateLayer, files: any, admin: Admin, collection: Collection) {
        const insertLayer = data;

        let layer = new Layer();
        layer.name = insertLayer.name;
        layer.description = insertLayer.description ? insertLayer.description : null;

        if (files) {
            if (files.image) {
                const imageUpload = await this.upload(files.image, 180);

                if (!imageUpload || !imageUpload.Location) return false;
                layer.imageUrl = imageUpload.Location;
            }
        }

        if (!(admin.type == 2)) {
            throw Causes.USER_DONT_HAVE_PERMISSION;
        }

        layer.creatorId = admin.id;
        layer.collectionId = collection.id;

        layer = await this.layerRepo.save(layer);

        return layer;
    }


    async createImage(data: CreateImage, files: any, admin: Admin, collection: Collection, layer: Layer) {
        const insertImage = data;

        let image = new Image();
        image.name = insertImage.name;
        image.description = insertImage.description ? insertImage.description : null;
        image.quantity = insertImage.quantity;
        image.remainingQuantity = insertImage.quantity;

        if (files) {
            if (files.image) {
                const imageUpload = await this.upload(files.image);

                if (!imageUpload || !imageUpload.Location) return false;
                image.imageUrl = imageUpload.Location;
            }
        }

        if (!(admin.type == 2)) {
            throw Causes.USER_DONT_HAVE_PERMISSION;
        }

        image.creatorId = admin.id;
        image.collectionId = collection.id;
        image.layerId = layer.id;

        const images = await this.imageRepo.find({
            layerId: image.layerId,
            collectionId: image.collectionId,
        });

        let totalQuantity = Number(insertImage.quantity);
        for (let i = 0; i < images.length; i++) {
            totalQuantity += Number(images[i].quantity);
        }

        for (let i = 0; i < images.length; i++) {
            images[i].probability = Number(images[i].quantity) / totalQuantity;
            images[i].probability = images[i].probability ? images[i].probability : 0;
        }

        image.probability = Number(image.quantity) / totalQuantity;
        image = await this.imageRepo.save(image);
        await this.imageRepo.save(images);

        return image;
    }


    async createImageS3(files: any) {

        if (files) {
            if (files.image) {
                const imageUpload = await this.upload(files.image);

                if (!imageUpload || !imageUpload.Location) return false;
                return  imageUpload.Location;
            }
        }

        return false;
    
    }

    async publicCollection(id: number) {
        const collection = await this.collectionRepo.findOne(id);
        collection.isPublic = true;

        if (!collection) {
            throw Causes.DATA_INVALID;
        }

        return await this.collectionRepo.save(collection);
    }

    async createDraftCollection(id: number) {
        const collection = await this.collectionRepo.findOne(id);
        collection.isCreateDraft = true;

        

        if (!collection) {
            throw Causes.DATA_INVALID;
        }

        return await this.collectionRepo.save(collection);
    }

    async getDetailCollection(id: number) {
        let queryBuilder = getConnection()
            .createQueryBuilder(Collection, 'collection')
            .leftJoin(Admin,'admin','admin.id = collection.creator_id')
            .leftJoin(Nft,'nft',`(nft.collection_id = collection.collection_id and nft.status = 'confirmed')`)
            .leftJoin(CurrencyToken,'currency_token',`(currency_token.contract_address = collection.payment_token and currency_token.chain_id =  collection.chain_id)`)
            .select(
                `collection.id, collection.name, collection.collection_id as collectionId, 
                collection.banner_url as bannerUrl, collection.image_url as imageUrl, 
                collection.description, collection.chain_id as chainId, collection.address,
                collection.payment_token as paymentToken, collection.price,collection.status, 
                collection.creator_id as creatorId, collection.is_public as isPublic,
                collection.total_nfts as totalNfts, collection.number_layers as numberLayers,
                collection.price as price, collection.start_mint_time as startMintTime,
                collection.type as type, collection.end_mint_time as endMintTime,
                collection.is_create_draft as isCreateDraft, collection.is_auto_mint as isAutoMint, 
                collection.created_at as createdAt, collection.updated_at as updatedAt`
            )
            .addSelect(`
                admin.full_name as fullName,
                admin.email as email,
                admin.avatar_url as avatarUrl
            `)
            .addSelect('currency_token.currency as currency')
            .addSelect('count (nft.id) as nftMinted')
            .addSelect('sum (nft.total_img) as nftMintedImgs')
            .addSelect('max(nft.price) as bestOffer')
            .where('collection.id = :id',{id:id})
            .groupBy('collection.id');

    
        const collectionData = await queryBuilder.execute();
        if(collectionData && collectionData.length > 0){
            return collectionData[0];
        }
        return [];
    }

    async getDetailLayer(id: number) {
        let queryBuilder = getConnection()
            .createQueryBuilder(Layer, 'layer')
            .leftJoin(Admin,'admin','admin.id = layer.creator_id')
            .select(
                `
                layer.id as id, 
                layer.name as name, 
                layer.image_url as imageUrl, 
                layer.description, 
                layer.collection_id as collectionId,
                layer.layer_index as layerIndex
                `
            )
            .addSelect(`
                admin.full_name as fullName,
                admin.email as email,
                admin.avatar_url as avatarUrl
            `)
            .where('layer.id = :id',{id:id});

        const layerData = await queryBuilder.execute();
        return layerData[0];
    }


    async getDetailImage(id: number) {
        let queryBuilder = getConnection()
            .createQueryBuilder(Image, 'image')
            .leftJoin(Admin,'admin','admin.id = image.creator_id')
            .select(
                `
                image.id as id, 
                image.name as name, 
                image.image_url as imageUrl, 
                image.image_type as imageType,
                image.description, 
                image.collection_id as collectionId, 
                image.layer_id as layerId,
                image.quantity as quantity,
                image.remaining_quantity as remainingQuantity,
                image.probability as probability,
                image.price as price,
                image.percent as percent,
                image.is_minted as isMinted
                `
            )
            .addSelect(`
                admin.full_name as fullName,
                admin.email as email,
                admin.avatar_url as avatarUrl
            `)
            .where('image.id = :id',{id:id});

        const imageDate = await queryBuilder.execute();
        return imageDate[0];
    }

    async getListImage(
        data,
        paginationOptions: IPaginationOptions
    ): Promise<PaginationResponse<Image>> {
        let offset = this.getOffset(paginationOptions);
        let limit = Number(paginationOptions.limit);

        let queryBuilder = getConnection()
            .createQueryBuilder(Image, 'image')
            .leftJoin(Admin,'admin','admin.id = image.creator_id')
            .select(
                `
                image.id as id, 
                image.name as name, 
                image.image_url as imageUrl, 
                image.image_type as imageType,
                image.description, 
                image.collection_id as collectionId, 
                image.layer_id as layerId,
                image.quantity as quantity,
                image.remaining_quantity as remainingQuantity,
                image.probability as probability,
                image.price as price,
                image.percent as percent,
                image.is_minted as isMinted
                `
            )
            .addSelect(`
                admin.full_name as fullName,
                admin.email as email,
                admin.avatar_url as avatarUrl
            `).orderBy('image.updated_at', 'DESC')
            .limit(limit)
            .offset(offset);
        let queryCount = getConnection()
            .createQueryBuilder(Image, 'image')
            .select(' Count (1) as Total')
            .orderBy('image.updated_at', 'DESC');

        if (data.name) {
            queryBuilder.andWhere(
                `image.name like '%${data.name.trim()}%'`
            );
            queryCount.andWhere(`image.name like '%${data.name.trim()}%'`);
        }

        if (data.creatorId && data.userType != 1) {
            queryBuilder.andWhere(
                `image.creator_id = :creatorId`, {creatorId: data.creatorId}
            );
            queryCount.andWhere(
                `image.creator_id = :creatorId`, {creatorId: data.creatorId}
            );
        }


        if (data.layerId) {
            queryBuilder.andWhere(
                `image.layer_id = :layerId`, {layerId: data.layerId}
            );
            queryCount.andWhere(
                `image.layer_id = :layerId`, {layerId: data.layerId}
            );
        }

        const image = await queryBuilder.execute();
        const imageCountList = await queryCount.execute();

        const {items, meta} = getArrayPaginationBuildTotal<Image>(
            image,
            imageCountList,
            paginationOptions
        );

        return {
            results: items,
            pagination: meta,
        };
    }


    async getListImageWeb(
        data,
        paginationOptions: IPaginationOptions
    ): Promise<PaginationResponse<Image>> {
        let offset = this.getOffset(paginationOptions);
        let limit = Number(paginationOptions.limit);

        let queryBuilder = getConnection()
            .createQueryBuilder(Image, 'image')
            .leftJoin(Admin,'admin','admin.id = image.creator_id')
            .leftJoin(Collection, 'collection', 'image.collection_id = collection.id')
            .leftJoin(CurrencyToken,'currency_token',`(currency_token.contract_address = collection.payment_token and currency_token.chain_id =  collection.chain_id)`)
            .select(
                `
                image.id as id, 
                image.name as name, 
                image.image_url as imageUrl, 
                image.description,
                image.collection_id as collectionId, 
                image.layer_id as layerId,
                image.quantity as quantity,
                image.remaining_quantity as remainingQuantity,
                image.price as price,
                image.percent as percent,
                image.probability as probability,
                image.image_type as imageType,
                image.is_minted as isMinted
                `
            )
            .addSelect(`
                admin.full_name as fullName,
                admin.email as email,
                admin.avatar_url as avatarUrl
            `)
            .addSelect('currency_token.currency as currency')
            // .where(`(collection.is_public = 1 and image.remaining_quantity > 0)`)
            .where(`(collection.is_public = 1)`)
            .orderBy('image.updated_at', 'DESC')
            .limit(limit)
            .offset(offset);
        let queryCount = getConnection()
            .createQueryBuilder(Image, 'image')
            .leftJoin(Collection, 'collection', 'image.collection_id = collection.id')
            .select(' Count (1) as Total')
            // .where(`(collection.is_public = 1 and image.remaining_quantity > 0)`)
            .where(`(collection.is_public = 1)`)
            .orderBy('image.updated_at', 'DESC');



        if (data.layerId) {
            queryBuilder.andWhere(
                `image.layer_id = :layerId`, {layerId: data.layerId}
            );
            queryCount.andWhere(
                `image.layer_id = :layerId`, {layerId: data.layerId}
            );
        }

        const image = await queryBuilder.execute();
        const imageCountList = await queryCount.execute();

        const {items, meta} = getArrayPaginationBuildTotal<Image>(
            image,
            imageCountList,
            paginationOptions
        );

        return {
            results: items,
            pagination: meta,
        };
    }
    async getListLayer(
        data,
        paginationOptions: IPaginationOptions
    ): Promise<PaginationResponse<Layer>> {
        let offset = this.getOffset(paginationOptions);
        let limit = Number(paginationOptions.limit);

        let queryBuilder = getConnection()
            .createQueryBuilder(Layer, 'layer')
            .leftJoin(Admin,'admin','admin.id = layer.creator_id')
            .select(
                'layer.id as id, layer.name as name, layer.image_url as imageUrl, layer.description, layer.collection_id as collectionId,layer.layer_index as layerIndex'
            )
            .addSelect(`
                admin.full_name as fullName,
                admin.email as email,
                admin.avatar_url as avatarUrl
            `).orderBy('layer.layer_index', 'ASC')
            .limit(limit)
            .offset(offset);
        let queryCount = getConnection()
            .createQueryBuilder(Layer, 'layer')
            .select(' Count (1) as Total')
            .orderBy('layer.layer_index', 'ASC');

        if (data.name) {
            queryBuilder.andWhere(
                `layer.name like '%${data.name.trim()}%'`
            );
            queryCount.andWhere(`layer.name like '%${data.name.trim()}%'`);
        }

        if (data.creatorId && data.userType != 1) {
            queryBuilder.andWhere(
                `layer.creator_id = :creatorId`, {creatorId: data.creatorId}
            );
            queryCount.andWhere(
                `layer.creator_id = :creatorId`, {creatorId: data.creatorId}
            );
        }

        if (data.collectionId) {
            queryBuilder.andWhere(
                `layer.collection_id = :collectionId`, {collectionId: data.collectionId}
            );
            queryCount.andWhere(
                `layer.collection_id = :collectionId`, {collectionId: data.collectionId}
            );
        }

        const layer = await queryBuilder.execute();


        if(layer && layer.length > 0)
        {
            for(let i = 0 ; i < layer.length ; i++){
                let queryBuilderImage = getConnection()
                .createQueryBuilder(Image, 'image')
                .select(
                    `
                    image.id as id, 
                    image.name as name, 
                    image.image_url as imageUrl, 
                    image.image_type as imageType,
                    image.description, 
                    image.collection_id as collectionId, 
                    image.layer_id as layerId,
                    image.quantity as quantity,
                    image.remaining_quantity as remainingQuantity,
                    image.probability as probability,
                    image.price as price,
                    image.percent as percent,
                    image.is_minted as isMinted
                    `
                )
                .orderBy('image.updated_at', 'DESC')
                .where('image.layer_id = :layerId',{layerId: layer[i].id});
                const image = await queryBuilderImage.execute();
                layer[i].images = image;
            }

        }
        const layerCountList = await queryCount.execute();

        const {items, meta} = getArrayPaginationBuildTotal<Layer>(
            layer,
            layerCountList,
            paginationOptions
        );

        return {
            results: items,
            pagination: meta,
        };
    }



    async getListLayerWeb(
        data,
        paginationOptions: IPaginationOptions
    ): Promise<PaginationResponse<Layer>> {
        let offset = this.getOffset(paginationOptions);
        let limit = Number(paginationOptions.limit);

        let queryBuilder = getConnection()
            .createQueryBuilder(Layer, 'layer')
            .leftJoin(Admin,'admin','admin.id = layer.creator_id')
            .leftJoin(Collection, 'collection', 'layer.collection_id = collection.id')
            .leftJoin(CurrencyToken,'currency_token',`(currency_token.contract_address = collection.payment_token and currency_token.chain_id =  collection.chain_id)`)
            .select(
                `
                layer.id as id, 
                layer.name as name, 
                layer.image_url as imageUrl, 
                layer.description, 
                layer.collection_id as collectionId,
                layer.layer_index as layerIndex
                `
            )
            .addSelect(`
                admin.full_name as fullName,
                admin.email as email,
                admin.avatar_url as avatarUrl
            `)
            .addSelect('currency_token.currency as currency')
            .where(`collection.is_public = 1`)
            .orderBy('layer.layer_index', 'ASC')
            .limit(limit)
            .offset(offset);
        let queryCount = getConnection()
            .createQueryBuilder(Layer, 'layer')
            .leftJoin(Collection, 'collection', 'layer.collection_id = collection.id')
            .select(' Count (1) as Total')
            .where(`collection.is_public = 1`)
            .orderBy('layer.layer_index', 'ASC');


        if (data.collectionId) {
            queryBuilder.andWhere(
                `layer.collection_id = :collectionId`, {collectionId: data.collectionId}
            );
            queryCount.andWhere(
                `layer.collection_id = :collectionId`, {collectionId: data.collectionId}
            );
        }

        const layer = await queryBuilder.execute();

        if(layer && layer.length > 0)
        {
            for(let i = 0 ; i < layer.length ; i++){
                let queryBuilderImage = getConnection()
                .createQueryBuilder(Image, 'image')
                .select(
                    `
                    image.id as id, 
                    image.name as name, 
                    image.image_url as imageUrl, 
                    image.description, 
                    image.layer_id as layerId,
                    image.quantity as quantity,
                    image.remaining_quantity as remainingQuantity,
                    image.price as price,
                    image.percent as percent,
                    image.probability as probability,
                    image.image_type as imageType,
                    image.is_minted as isMinted
                    `
                )
                .orderBy('image.updated_at', 'DESC')
                .where('(image.layer_id = :layerId and image.remaining_quantity > 0)',{layerId: layer[i].id});
                const image = await queryBuilderImage.execute();
                layer[i].images = image;
            }

        }
        const layerCountList = await queryCount.execute();

        const {items, meta} = getArrayPaginationBuildTotal<Layer>(
            layer,
            layerCountList,
            paginationOptions
        );

        return {
            results: items,
            pagination: meta,
        };
    }
    async getLayerImagePreview(params: any){

        let queryBuilder = getConnection()
            .createQueryBuilder(Layer, 'layer')
            .leftJoin(Admin,'admin','admin.id = layer.creator_id')
            .leftJoin(Collection, 'collection', 'layer.collection_id = collection.id')
            .leftJoin(CurrencyToken,'currency_token',`(currency_token.contract_address = collection.payment_token and currency_token.chain_id =  collection.chain_id)`)
            .select(
                'layer.id as id, layer.name as name, layer.image_url as imageUrl, layer.description, layer.collection_id as collectionId,layer.layer_index as layerIndex'
            )
            .addSelect(`
                admin.full_name as fullName,
                admin.email as email,
                admin.avatar_url as avatarUrl
            `)
            .addSelect('currency_token.currency as currency')
            .where(`(layer.collection_id = :collectionId and layer.layer_index = :layerIndex)`,{collectionId: params.collectionId,layerIndex: params.layerIndex})
            .orderBy('layer.layer_index', 'ASC')

        if(params.creatorId)
        {
            queryBuilder.andWhere(
                `layer.creator_id = :creatorId`, {creatorId: params.creatorId}
            );
        }
        
        const layer = await queryBuilder.execute();
        console.log("layer",layer);
        if(!layer || layer.length == 0) 
        return [];

        const layerPreview = (layer && layer.length) > 0 ? layer[0] : [];
       
        let queryBuilderImage = getConnection()
        .createQueryBuilder(Image, 'image')
        .select(
            `
            image.id as id, 
            image.name as name, 
            image.image_url as imageUrl,
            image.description, 
            image.collection_id as collectionId, 
            image.layer_id as layerId,
            image.quantity as quantity,
            image.probability as probability,
            image.price as price,
            image.percent as percent,
            image.image_type as imageType,
            image.is_minted as isMinted
            `
        )
        .orderBy('image.updated_at', 'DESC')
        .where('image.layer_id = :layerId',{layerId: layer[0].id});
        const image = await queryBuilderImage.execute();
        layerPreview.images = image;

        return layerPreview;
    }

    async getListCollection(
        data,
        paginationOptions: IPaginationOptions
    ): Promise<PaginationResponse<Collection>> {
        let offset = this.getOffset(paginationOptions);
        let limit = Number(paginationOptions.limit);

        let queryBuilder = getConnection()
            .createQueryBuilder(Collection, 'collection')
            .leftJoin(Admin,'admin','admin.id = collection.creator_id')
            .select(
                'collection.id, collection.name, collection.banner_url as bannerUrl, collection.is_public as isPublic, ' +
                'collection.image_url as imageUrl, collection.description, collection.chain_id as chainId, ' +
                'collection.address , collection.collection_id as collectionId, collection.payment_token as paymentToken, collection.price,collection.status, ' +
                'collection.creator_id as creatorId, collection.collection_address as collectionAddress,' +
                'collection.price as price, collection.type as type,' +
                'collection.start_mint_time as startMintTime, collection.end_mint_time as endMintTime,' +
                'collection.symbol as symbol, collection.owner as owner, collection.created_at as createdAt, collection.updated_at as updatedAt'
            )
            .addSelect(`
                admin.full_name as fullName,
                admin.email as email,
                admin.avatar_url as avatarUrl
            `)
            .orderBy('collection.updated_at', 'DESC')
            .limit(limit)
            .offset(offset);
        let queryCount = getConnection()
            .createQueryBuilder(Collection, 'collection')
            .select(' Count (1) as Total')
            .orderBy('collection.updated_at', 'DESC');
        if (data.name) {
            queryBuilder.andWhere(
                `collection.name like '%${data.name.trim()}%'`
            );
            queryCount.andWhere(`collection.name like '%${data.name.trim()}%'`);
        }

        if (data.creatorId && data.creatorType == 2) {
            queryBuilder.andWhere(
                `collection.creator_id = :creatorId`, {creatorId: data.creatorId}
            );
            queryCount.andWhere(
                `collection.creator_id = :creatorId`, {creatorId: data.creatorId}
            );
            
        }

        if (!data.isAdmin) {
            queryBuilder.andWhere(
                `collection.status is not null`
            );
            queryCount.andWhere(
                `collection.status is not null`
            );
        }
        
        if (!data.creatorId){
            queryBuilder
            .andWhere(
                `collection.is_public = 1`
            );
            queryCount
            .andWhere(
                `collection.is_public = 1`
            );
        }

        const collection = await queryBuilder.execute();
        const collectionCountList = await queryCount.execute();

        const {items, meta} = getArrayPaginationBuildTotal<Collection>(
            collection,
            collectionCountList,
            paginationOptions
        );

        return {
            results: items,
            pagination: meta,
        };
    }

    async updateCollection(data: UpdateCollection,id:number, collection: Collection, files: any, admin: Admin) {
        const insertCollection = data;

        let checkCollectionName = await this.collectionRepo.findOne({
            id
        });

        if (checkCollectionName.name && checkCollectionName.name != collection.name) {
            throw Causes.COLLECTION_NAME_EXISTS;
        }
        if (insertCollection.name)
            collection.name = insertCollection.name;

        if (insertCollection.description)
            collection.description = insertCollection.description
                ? insertCollection.description
                : null;

        if (insertCollection.symbol)
            collection.symbol = insertCollection.symbol;

        if (insertCollection.totalNfts)
            collection.totalNfts = insertCollection.totalNfts ;

        if (insertCollection.numberLayers)
            collection.numberLayers = insertCollection.numberLayers;

        if (insertCollection.startMintTime && !collection.isPublic) {
            collection.startMintTime = insertCollection.startMintTime;
        }

        if (insertCollection.endMintTime && !collection.isPublic) {
            collection.endMintTime = insertCollection.endMintTime;
        }

        if (insertCollection.price && !collection.isPublic) {
            collection.price = insertCollection.price;
        }

        if (insertCollection.type && !collection.isPublic) {
            collection.type = insertCollection.type;
        }


        if (files) {
            if (files.image) {
                const imageUpload = await this.upload(files.image);

                if (!imageUpload || !imageUpload.Location) return false;
                collection.imageUrl = imageUpload.Location;
            }

            if (files.banner) {
                const bannerUpload = await this.upload(files.banner);

                if (!bannerUpload || !bannerUpload.Location) return false;
                collection.bannerUrl = bannerUpload.Location;
            }
        }
        collection = await this.collectionRepo.save(collection);

        return collection;
    }

    async getCollectionByData (data: any) {
        if (data.id && data.adminId) {
            return await this.collectionRepo.findOne({
                id: data.id,
                creatorId: data.adminId
            });
        }
    }

    async deleteLayerByData (data: any) {
        //TODO: add into a transaction
        if (data.id) {
            const result = await this.layerRepo.delete(data.id);
            await this.imageRepo.delete({layerId: data.id});

            return result;
        }
    }

    async getLayerByData (data: any) {
        if (data.id && data.adminId && data.collectionId) {
            return await this.layerRepo.findOne({
                id: data.id,
                creatorId: data.adminId,
                collectionId: data.collectionId,
            });
        }

        if (data.id && data.adminId) {
            return await this.layerRepo.findOne({
                id: data.id,
                creatorId: data.adminId,
            });
        }

        if (data.id && data.collectionId) {
            return await this.layerRepo.findOne({
                id: data.id,
                collectionId: data.collectionId,
            });
        }

        if (data.id) {
            return await this.layerRepo.findOne({
                id: data.id,
            });
        }
    }


    async upload(file, thumbnail_size?): Promise<any> {
        const {originalname} = file;
        const bucketS3 = process.env.AWS_BUCKET;
        if(!thumbnail_size)
            return await this.uploadS3(file.buffer, bucketS3, originalname);
        else
            return await this.uploadS3_with_thumbnail(file.buffer, bucketS3, originalname, thumbnail_size);
    }

    async uploadS3_with_thumbnail(file, bucket, name, thumbnail_size) {
        const s3 = this.getS3();
        const thumbnail = await sharp(file).resize(+thumbnail_size).toBuffer();
        const icon = await sharp(file).resize(32).toBuffer();

        const key = 'collections/'+ uuidv4()+ String(name);
        const key_thumbnail = key.replace(/(\.[\w\d_-]+)$/i, '_thumbnail$1');
        const key_icon = key.replace(/(\.[\w\d_-]+)$/i, '_icon$1');
        const params = {
            Bucket: bucket,
            Key: key,
            Body: file,
        };
        return new Promise((resolve, reject) => {
            s3.upload(params, (err, data) => {
                if (err) {
                    reject(err.message);
                }
                s3.upload(
                    {
                        Bucket: bucket,
                        Key: key_thumbnail,
                        Body: thumbnail,
                    },
                    (err, data) => {
                        if (err) {
                            reject(err.message);
                        }
                        s3.upload(
                            {
                                Bucket: bucket,
                                Key: key_icon,
                                Body: icon,
                            },
                            (err, data) => {
                                if (err) {
                                    reject(err.message);
                                }
                            }
                        )
                    }
                )
                return resolve(data);
            });
        });
    }

    async uploadS3(file, bucket, name) {
        const s3 = this.getS3();
        const params = {
            Bucket: bucket,
            Key: 'collections/'+ uuidv4()+ String(name),
            Body: file,
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

    async delete(keyS3: string, thumbnail?: number): Promise<any> {
        const bucketS3 = process.env.AWS_BUCKET;
        if(thumbnail) {
            return await this.deleteS3(bucketS3, keyS3, thumbnail);
        }
        return await this.deleteS3(bucketS3, keyS3);
    }

    async deleteS3(
        bucket: string,
        keyS3: string,
        thumbnail?: number,
    ) {
        const s3 = this.getS3();
        const key = keyS3;
        const key_thumbnail = key.replace(/(\.[\w\d\_\-\+]+)$/i, '_thumbnail$1');
        const key_icon = key.replace(/(\.[\w\d\_\-\+]+)$/i, '_icon$1');
        const params = {
            Bucket: bucket,
            Key: key,
        };

        return new Promise((resolve, reject) => {
            s3.deleteObject(params, (err, data) => {
                if (err) reject(err);
                if(thumbnail) {
                    s3.deleteObject({
                        Bucket: bucket,
                        Key: key_thumbnail,
                    }, (err, data) => {
                        if (err) reject(err);
                        
                        s3.deleteObject({
                            Bucket: bucket,
                            Key: key_icon
                        }, (err, data) => {
                            if(err) reject(err)
                        })
                    })
                }
                return resolve(data);
            });
        });
    }

    splitImageUri(imageUrl: string) {
        let keyS3 = imageUrl.match(/(collections)(\/[\w_+-]+)(\.[\w_+]+)$/i)
        return keyS3[0];
    } 

    getS3() {
        return new S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
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
}
