import {
    Body,
    Controller,
    DefaultValuePipe, Delete,
    Get,
    HttpStatus,
    Param,
    Post, Put,
    Query,
    Req,
    UploadedFiles, UseGuards,
    UseInterceptors, UsePipes
} from '@nestjs/common';
import {CollectionService} from './collection.service';
import {ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse} from '@nestjs/swagger';
import {PaginationResponse} from 'src/config/rest/paginationResponse';
import {Collection, Image, Layer} from '../../database/entities';
import {Causes} from '../../config/exception/causes';
import {AuthService} from '../admin/auth.service';
import {CreateCollection} from './request/create-collection.dto';
import {FileFieldsInterceptor,FilesInterceptor} from '@nestjs/platform-express';
import {Express} from 'express';
import {checkImage} from 'src/shared/Utils';
import {UpdateCollection} from './request/update-collection.dto';
import {JwtAuthGuard} from "../admin/jwt-auth.guard";
import {TrimPipe} from "../../shared/TrimPipe";
import {FileCollectionUploadRequest} from "./request/collection-file-upload.dto";
import {FileLayerUploadRequest} from "./request/layer-file-upload.dto";
import {CreateLayer} from "./request/create-layer.dto";
import {FileImageUploadRequest,FileImageUploadS3Request} from "./request/image-file-upload.dto";
import {CreateLayerImages,UpdateLayerImages} from "./request/create-layer-image.dto";

import {CreateImage} from "./request/create-image.dto";
import {UpdateLayer} from "./request/update-layer.dto";

@Controller('collection-admin')
export class CollectionAdminController {
    constructor(
        private readonly collectionService: CollectionService,
        private authService: AuthService,
    ) {
    }

    @Get('/layer-preview')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'get detail image',
        summary: 'Get detail image',
        description: 'Get detail image',
    })
    @ApiQuery({
        name: 'collectionId',
        required: false,
        example: 1,
        type: Number
    })
    @ApiQuery({
        name: 'layerIndex',
        required: false,
        example: 1,
        type: Number
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: Collection,
    })
    async getLayerImagePreview(
        @Query('collectionId') collectionId: number,
        @Query('layerIndex') layerIndex: number,
        @Req() request: any
    ) {
        return this.collectionService.getLayerImagePreview({collectionId,layerIndex,creatorId: request.user.id});
    }


    @Get('/list')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'getList',
        summary: 'Get all collection',
        description: 'Get all collection',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: Collection,
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
    })
    @ApiQuery({
        name: 'name',
        required: false,
        type: String,
    })
    async getList(
        @Query('name') name: string,
        @Query('page', new DefaultValuePipe(1)) page: number,
        @Query('limit', new DefaultValuePipe(10)) limit: number,
        @Req() request: any
    ): Promise<PaginationResponse<Collection>> {
        return this.collectionService.getListCollection(
            {name, creatorId: request.user.id, creatorType: request.user.type, isAdmin: true},
            {page, limit}
        );
    }

    @Get('/layer/list')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'getList layer',
        summary: 'Get all layer of collection',
        description: 'Get all layer of collection',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: Collection,
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
    })
    @ApiQuery({
        name: 'name',
        required: false,
        type: String,
    })
    async getListLayer(
        @Query('name') name: string,
        @Query('collectionId') collectionId: string,
        @Query('page', new DefaultValuePipe(1)) page: number,
        @Query('limit', new DefaultValuePipe(10)) limit: number,
        @Req() request: any
    ): Promise<PaginationResponse<Layer>> {
        return this.collectionService.getListLayer(
            {name, creatorId: request.user.id, userType: request.user.type, collectionId},
            {page, limit}
        );
    }

    @Get('/layer/image/list')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'getList image',
        summary: 'Get all image of collection',
        description: 'Get all image of collection',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: Collection,
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
    })
    @ApiQuery({
        name: 'layerId',
        required: false,
        type: Number,
    })
    @ApiQuery({
        name: 'name',
        required: false,
        type: String,
    })
    async getListImage(
        @Query('name') name: string,
        @Query('layerId') layerId: string,
        @Query('page', new DefaultValuePipe(1)) page: number,
        @Query('limit', new DefaultValuePipe(10)) limit: number,
        @Req() request: any
    ): Promise<PaginationResponse<Image>> {
        return this.collectionService.getListImage(
            {name, creatorId: request.user.id,userType: request.user.type, layerId},
            {page, limit}
        );
    }

    @Post('/create')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'image', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
    ]))
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'create collection',
        summary: 'create collection',
        description: 'create a collection',
    })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
    })
    @ApiBody({
        description: 'Update profile with image',
        type: FileCollectionUploadRequest,
    })
    @UsePipes(new TrimPipe())
    async create(@Body() data: CreateCollection,
                 @UploadedFiles() files: { image?: Express.Multer.File[], banner?: Express.Multer.File[]},
                 @Req() request: any) {
        if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

        let image = files && files.image? files.image[0] : undefined;
        let banner = files && files.banner ? files.banner[0] : undefined;

        if (image) await checkImage(image);
        if (banner) await checkImage(banner);

        const collection = await this.collectionService.createCollection(data, {image, banner}, request.user);

        if (!collection) throw Causes.COLLECTION_CREATE_FAILED;

        return collection;
    }

    @Post('/create-layer')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'image', maxCount: 1 },
    ]))
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'create layer',
        summary: 'create layer',
        description: 'create a layer',
    })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
    })
    @ApiBody({
        description: 'Create layer with image',
        type: FileLayerUploadRequest,
    })
    @UsePipes(new TrimPipe())
    async createLayer(@Body() data: CreateLayer,
                      @Query("collectionId") collectionId: number,
                      @UploadedFiles() files: { image?: Express.Multer.File[]},
                      @Req() request: any) {
        if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

        let image = files && files.image? files.image[0] : undefined;

        if (image) await checkImage(image);

        const collection = await this.collectionService.getCollectionByData({id: collectionId, adminId: request.user.id});
        if (!collection) {
            throw Causes.COLLECTION_NOT_EXISTS;
        }

        const layer = await this.collectionService.createLayer(data, {image}, request.user, collection);

        if (!layer) throw Causes.LAYER_CREATE_FAILED;

        return layer;
    }


    @Post('/create-layer-images')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('images'))
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'create create-layer-images',
        summary: 'create create-layer-images',
        description: 'create a new create-layer-images',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
    })
    @UsePipes(new TrimPipe())
    async createLayerImages(@Body() data: CreateLayerImages, @Req() request: any, @UploadedFiles() files: Array<Express.Multer.File>) {
        if (!request || !request.user)  throw Causes.USER_NOT_ACCESS;

        if (!files || files.length == 0) throw Causes.DATA_INVALID;

        for (let file of files) {
            if (!file || !file.mimetype || file.mimetype.split('/').length !== 2 || !file.size) throw Causes.DATA_INVALID;
            checkImage(file);
        }
        const layer = await this.collectionService.createLayerImages(data , files, request.user);

        if (!layer) throw Causes.LAYER_CREATE_FAILED;

        return layer;
    }

    @Post('/create-image')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'image', maxCount: 1 },
    ]))
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'create image',
        summary: 'create image',
        description: 'create a image',
    })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
    })
    @ApiBody({
        description: 'Create image with image',
        type: FileImageUploadRequest,
    })
    @UsePipes(new TrimPipe())
    async createImage(@Body() data: CreateImage,
                      @Query("collectionId") collectionId: number,
                      @Query("layerId") layerId: number,
                      @UploadedFiles() files: { image?: Express.Multer.File[]},
                      @Req() request: any) {
        if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

        let image = files && files.image? files.image[0] : undefined;

        if (image) await checkImage(image);

        const collection = await this.collectionService.getCollectionByData({id: collectionId, adminId: request.user.id});
        if (!collection) {
            throw Causes.COLLECTION_NOT_EXISTS;
        }

        const layer = await this.collectionService.getLayerByData({id: layerId, adminId: request.user.id, collectionId: collectionId});

        if (!layer) {
            throw Causes.COLLECTION_NOT_EXISTS
        }
        const l_image = await this.collectionService.createImage(data, {image}, request.user, collection, layer);

        if (!l_image) throw Causes.IMAGE_CREATE_FAILED;

        return l_image;
    }

    @Post('/update/:id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileFieldsInterceptor([
        {name: 'image', maxCount: 1},
    ]))
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'update collection',
        summary: 'update collection',
        description: 'update a collection',
    })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
    })
    async update(@Body() data: UpdateCollection,
                 @Param('id') id: number,
                 @UploadedFiles() files: { image?: Express.Multer.File[], banner?: Express.Multer.File[]},
                 @Req() request: any) {
        if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

        const collection = await this.collectionService.getCollectionByData({id: id, adminId: request.user.id});
        if (!collection) {
            throw Causes.COLLECTION_NOT_EXISTS;
        }

        let image = files && files.image? files.image[0] : undefined;
        let banner = files && files.banner ? files.banner[0] : undefined;

        if (image) await checkImage(image);
        if (banner) await checkImage(banner);

        const updateCollection = await this.collectionService.updateCollection(data, id, collection, {image, banner}, request.user);

        if (!updateCollection) throw Causes.COLLECTION_UPDATE_FAILED;

        return updateCollection;
    }

    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'get detail collection',
        summary: 'Get detail collection',
        description: 'Get detail collection',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: Collection,
    })
    async getCollection(@Param('id') id: number, @Req() request: any) {
        return this.collectionService.getDetailCollection(id);
    }

    @Put('/:id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'public collection',
        summary: 'public collection',
        description: 'public collection',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: Collection,
    })
    async publicCollection(@Param('id') id: number, @Req() request: any) {
        return this.collectionService.publicCollection(id);
    }

    @Put('create-draft/:id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'public collection createDraftCollection',
        summary: 'public collection createDraftCollection',
        description: 'public collection createDraftCollection',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: Collection,
    })
    async createDraftCollection(@Param('id') id: number, @Req() request: any) {
        return this.collectionService.createDraftCollection(id);
    }

    @Get('/layer/:id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'get detail layer',
        summary: 'Get detail layer',
        description: 'Get detail layer',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: Collection,
    })
    async getLayer(@Param('id') id: number, @Req() request: any) {
        return this.collectionService.getDetailLayer(id);
    }

    @Delete('/layer/:id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'delete a layer',
        summary: 'delete a layer',
        description: 'delete a layer with all images of this image',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: Collection,
    })
    async deleteLayer(
        @Param('id') id: number,
        @Req() request: any) {
        if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

        const layer = await this.collectionService.getLayerByData({id});

        if (!layer) {
            throw Causes.LAYER_NOT_EXISTS;
        }

        if (layer.isMinted) {
            throw Causes.LAYER_HAS_MINTED_NFT;
        }

        const result = await this.collectionService.deleteLayerByData({id})

        if (!result) throw Causes.DATA_INVALID;

        return result;
    }


    @Get('/layer/image/:id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'get detail image',
        summary: 'Get detail image',
        description: 'Get detail image',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: Collection,
    })
    async getImage(@Param('id') id: number, @Req() request: any) {
        return this.collectionService.getDetailImage(id);
    }


    @Post('/create-image-s3')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'image', maxCount: 1 },
    ]))
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'create create-image-s3',
        summary: 'create create-image-s3',
        description: 'create a create-image-s3',
    })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
    })
    @ApiBody({
        description: 'Create image with image s3',
        type: FileImageUploadS3Request,
    })
    @UsePipes(new TrimPipe())
    async createImageS3(
                      @UploadedFiles() files: { image?: Express.Multer.File[]},
                      @Req() request: any) {
        if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

        let image = files && files.image? files.image[0] : undefined;

        if (image) await checkImage(image);

        const l_image = await this.collectionService.createImageS3({image});

        return l_image;
    }
    
    @Post('/update-layer-images')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('images'))
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'update update-layer-images',
        summary: 'update update-layer-images',
        description: 'update a new update-layer-images',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
    })
    @ApiConsumes('multipart/form-data')
    @UsePipes(new TrimPipe())
    async updateLayerImages(@Body() data: UpdateLayerImages, @Req() request: any, @UploadedFiles() files: Array<Express.Multer.File>) {
        if (!request || !request.user)  throw Causes.USER_NOT_ACCESS;

        if (files && files.length > 0) 

        for (let file of files) {
            if (!file || !file.mimetype || file.mimetype.split('/').length !== 2 || !file.size) throw Causes.DATA_INVALID;
            await checkImage(file);
        }
        const layer = await this.collectionService.updateLayerImages(data , files, request.user);

        if (!layer) throw Causes.LAYER_UPDATE_FAILED;

        return layer;
    }

    @Post('/update-auto-mint')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['collection-admin'],
        operationId: 'update-auto-mint',
        summary: 'update-auto-mint',
        description: ' a new update-auto-mint',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
    })
    async updateAutoMint(@Req() request: any) {
        // 
    }
}
