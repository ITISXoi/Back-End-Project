import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    HttpStatus, Param,
    Post,
    Query,
    Req,
    UploadedFiles, UseGuards,
    UseInterceptors,
    UsePipes,
    Put
} from '@nestjs/common';
import {NftService} from './nft.service';
import {ApiConsumes, ApiOperation, ApiQuery, ApiResponse} from '@nestjs/swagger';
import {Causes} from '../../config/exception/causes';
import {Create} from './request/create.dto';
import {FilesInterceptor} from '@nestjs/platform-express';
import {checkImage} from 'src/shared/Utils';
import {TrimPipe} from 'src/shared/TrimPipe';
import {AuthService} from "../admin/auth.service";
import RequestWithUser from "../admin/requestWithUser.interface";
import {JwtAuthGuard} from "../admin/jwt-auth.guard";
import {CreateOffchain} from "./request/create-offchain.dto";
import {NftOffChainType} from "../../shared/enums";
import {UpdateOffchain} from "./request/update-offchain.dto";
import {CreateArtistOffchain} from "./request/create-artist-offchain.dto";

@Controller('nft-admin')
export class NftAdminController {
    constructor(
        private readonly nftService: NftService,
        private readonly authService: AuthService,
    ) {
    }

    @Get('list-nft')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['nft-admin'],
        operationId: 'getList -all-nft',
        summary: 'Get all -all-nft',
        description: 'Get all -all-nft',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number
    })
    @ApiQuery({
        name: 'name',
        required: false,
        example: 'name',
        type: String
    })
    @ApiQuery({
        name: 'collectionId',
        required: false,
        example: 1,
        type: Number
    })
    @ApiQuery({
        name: 'chainId',
        required: false,
        example: '80001',
        type: String
    })
    @ApiQuery({
        name: 'contractAddress',
        required: false,
        example: '80001',
        type: String
    })
    async getListAllNfts(
        @Query('name') name: string,
        @Query('collectionId') collectionId: number,
        @Query('chainId') chainId: string,
        @Query('contractAddress') contractAddress: string,
        @Query('page', new DefaultValuePipe(1)) page: number,
        @Query('limit', new DefaultValuePipe(10)) limit: number,
        @Req() request: any
    ) {
        if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

        return this.nftService.n_getListAllNfts({name, chainId, collectionId, contractAddress}, {page, limit});
    }

    @Get('list-my-nft')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['nft-admin'],
        operationId: 'getList -my-nft',
        summary: 'Get all -my-nft',
        description: 'Get all -my-nft',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number
    })
    @ApiQuery({
        name: 'name',
        required: false,
        example: 'name',
        type: String
    })
    @ApiQuery({
        name: 'collectionId',
        required: false,
        example: 1,
        type: Number
    })
    @ApiQuery({
        name: 'chainId',
        required: false,
        example: '80001',
        type: String
    })
    @ApiQuery({
        name: 'contractAddress',
        required: false,
        example: '80001',
        type: String
    })
    async getListMyNfts(
        @Query('name') name: string,
        @Query('collectionId') collectionId: number,
        @Query('chainId') chainId: string,
        @Query('contractAddress') contractAddress: string,
        @Query('page', new DefaultValuePipe(1)) page: number,
        @Query('limit', new DefaultValuePipe(10)) limit: number,
        @Req() request: any
    ) {
        if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

        return this.nftService.n_getListAllNfts({name, chainId, collectionId, contractAddress, userId: request.user.id}, {page, limit});
    }

    @Post('/create-offchain')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('images'))
    @ApiOperation({
        tags: ['nft-admin'],
        operationId: 'create nft offchain (customized)',
        summary: 'create nft offchain (customized)',
        description: 'create a new nft offchain (customized)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
    })
    @ApiConsumes('multipart/form-data')
    @UsePipes(new TrimPipe())
    async createOffchain(
        @Body() data: CreateArtistOffchain,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Req() request: any
    ) {
        if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

        if (!files || files.length == 0) throw Causes.DATA_INVALID;

        for (let file of files) {
            if (!file || !file.mimetype || file.mimetype.split('/').length !== 2 || !file.size) throw Causes.DATA_INVALID;

            await checkImage(file);
        }

        const nftOffchain = await this.nftService.createOffchain(data, files, NftOffChainType.CUSTOMIZED, request.user);
        if (!nftOffchain) throw Causes.DATA_INVALID;

        return nftOffchain;
    }


    @Put('create-draft/:id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['nft-admin'],
        operationId: 'public collection createDraft',
        summary: 'public collection createDraft',
        description: 'public collection createDraft',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
    })
    async createDraftCollection(@Param('id') id: number, @Req() request: any) {
        return this.nftService.createDraftCollection(id);
    }

    @Get('list-nft-offchain')
    @ApiOperation({
        tags: ['nft-admin'],
        operationId: 'getList -nft-offchain for admin',
        summary: 'Get all -nft-offchain',
        description: 'Get all -nft-offchain',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number
    })
    @ApiQuery({
        name: 'name',
        required: false,
        example: 'name',
        type: String
    })
    @ApiQuery({
        name: 'type',
        required: false,
        example: 'draft || customized || minted',
        type: String
    })
    @ApiQuery({
        name: 'collectionId',
        required: false,
        example: 1,
        type: Number
    })
    @ApiQuery({
        name: 'collectionKeyId',
        required: false,
        example: 1,
        type: Number
    })
    @ApiQuery({
        name: 'collectionAddress',
        required: false,
        example: '0xB232a50A850c0B1Aada934bED267ebB81cA1980f',
        type: String
    })
    @ApiQuery({
        name: 'chainId',
        required: false,
        example: '80001',
        type: String
    })
    async getListNftOffchains(
        @Query('name') name: string,
        @Query('type') type: string,
        @Query('collectionId') collectionId: number,
        @Query('collectionKeyId') collectionKeyId: number,
        @Query('collectionAddress') collectionAddress: string,
        @Query('chainId') chainId: string,
        @Query('page', new DefaultValuePipe(1)) page: number,
        @Query('limit', new DefaultValuePipe(10)) limit: number,
        @Req() request: any
    ) {
        return this.nftService.getListNftOffchains({name, collectionId, collectionKeyId, collectionAddress, chainId, type}, {page, limit});
    }

    @Get('list-my-nft-offchain')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['nft-admin'],
        operationId: 'getList -my-nft-offchain',
        summary: 'Get all -my-nft-offchain',
        description: 'Get all -my-nft-offchain',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number
    })
    @ApiQuery({
        name: 'name',
        required: false,
        example: 'name',
        type: String
    })
    @ApiQuery({
        name: 'type',
        required: false,
        example: 'draft || customized || minted',
        type: String
    })
    @ApiQuery({
        name: 'collectionId',
        required: false,
        example: 1,
        type: Number
    })
    @ApiQuery({
        name: 'collectionKeyId',
        required: false,
        example: 1,
        type: Number
    })
    @ApiQuery({
        name: 'collectionAddress',
        required: false,
        example: '0xB232a50A850c0B1Aada934bED267ebB81cA1980f',
        type: String
    })
    @ApiQuery({
        name: 'chainId',
        required: false,
        example: '80001',
        type: String
    })
    async getListMyNftOffchains(
        @Query('name') name: string,
        @Query('type') type: string,
        @Query('collectionId') collectionId: number,
        @Query('collectionKeyId') collectionKeyId: number,
        @Query('collectionAddress') collectionAddress: string,
        @Query('chainId') chainId: string,
        @Query('page', new DefaultValuePipe(1)) page: number,
        @Query('limit', new DefaultValuePipe(10)) limit: number,
        @Req() request: any
    ) {
        if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

        return this.nftService.getListNftOffchains({name, collectionId, collectionKeyId, collectionAddress, chainId, type, userId: request.user.id}, {page, limit});
    }

    @Post('/update-offchain/:id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('images'))
    @ApiOperation({
        tags: ['nft-admin'],
        operationId: 'update nft offchain (customized)',
        summary: 'update nft offchain (customized',
        description: 'update a nft offchain (customized)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
    })
    @ApiConsumes('multipart/form-data')
    @UsePipes(new TrimPipe())
    async updateOffchain(
        @Body() data: UpdateOffchain,
        @Param("id") id: number,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Req() request: any
    ) {
        if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

        if (files && files.length != 0) {
            for (let file of files) {
                if (!file || !file.mimetype || file.mimetype.split('/').length !== 2 || !file.size) throw Causes.DATA_INVALID;

                await checkImage(file);
            }
        }
        const u_nftOffChain = await this.nftService.getDetailNftOffchain(id);
        if (!u_nftOffChain) {
            throw Causes.NFT_OFFCHAIN_DOES_NOT_EXIST;
        }
        const nftOffchain = await this.nftService.updateOffchain(data, files, u_nftOffChain, request.user);
        if (!nftOffchain) throw Causes.NFT_OFFCHAIN_UPDATE_FAILED;

        return nftOffchain;
    }

    @Get('/offchain/:id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['nft-admin'],
        operationId: 'get -detail-nft-offchain',
        summary: 'Get -detail-nft-offchain',
        description: 'Get -detail-nft-offchain',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
    })
    async getDetailNftOffChain(
        @Req() request: RequestWithUser,
        @Param("id") id: number
    ) {
        if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

        const nft_offchain = await this.nftService.getDetailNftOffchain(id);
        if(! nft_offchain){
            throw Causes.NFT_OFFCHAIN_DOES_NOT_EXIST;
        }
        return nft_offchain;
    }

    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['nft-admin'],
        operationId: 'get -detail-nft',
        summary: 'Get -detail-nft',
        description: 'Get -detail-nft',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
    })
    async getDetailNft(
        @Req() request: RequestWithUser,
        @Param("id") id: number
    ) {
        if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

        const nft =  await this.nftService.getDetailNft(id);
        if (!nft) {
            throw Causes.NFT_DOES_NOT_EXIST;
        }
        return nft;
    }
}