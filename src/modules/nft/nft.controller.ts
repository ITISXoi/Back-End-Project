import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from "@nestjs/common";
import { NftService } from "./nft.service";
import {
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";
import { Causes } from "../../config/exception/causes";
import { Create } from "./request/create.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { checkImage } from "src/shared/Utils";
import { TrimPipe } from "src/shared/TrimPipe";
import RequestWithUser from "../user/requestWithUser.interface";
import { JwtAuthGuard } from "../user/jwt-auth.guard";
import { CreateOffchain } from "./request/create-offchain.dto";
import { NftOffChainType } from "../../shared/enums";
import { UpdateOffchain } from "./request/update-offchain.dto";

@Controller("nft")
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Get("/generate")
  @ApiOperation({
    tags: ["nft"],
    operationId: "generate nft",
    summary: "create nft",
    description: "generate a new nft",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
  })
  @ApiQuery({
    name: "collectionId",
    required: false,
    example: 1,
    type: Number,
  })
  async generate(
    @Query("collectionId") collectionId: number,
    @Req() request: any
  ) {
    return await this.nftService.generate(collectionId);
  }

  @Get("/generate-auto")
  @ApiOperation({
    tags: ["nft"],
    operationId: "generate auto nft",
    summary: "create auto nft",
    description: "generate auto a new nft",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
  })
  @ApiQuery({
    name: "collectionId",
    required: false,
    example: 1,
    type: Number,
  })
  async generateAuto(
    @Query("collectionId") collectionId: number,
    @Req() request: any
  ) {
    return await this.nftService.generateNtf(collectionId);
  }

  @Post("/create")
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor("images"))
  @ApiOperation({
    tags: ["nft"],
    operationId: "create nft",
    summary: "create nft",
    description: "create a new nft",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
  })
  @ApiConsumes("multipart/form-data")
  @UsePipes(new TrimPipe())
  async create(
    @Body() data: Create,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() request: any
  ) {
    if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;
    if (!files || files.length == 0) throw Causes.DATA_INVALID;

    for (let file of files) {
      if (
        !file ||
        !file.mimetype ||
        file.mimetype.split("/").length !== 2 ||
        !file.size
      )
        throw Causes.DATA_INVALID;

      await checkImage(file);
    }
    const nft = await this.nftService.create(data, files, request.user);
    if (!nft) throw Causes.NFT_CREATE_FAILED;

    return nft;
  }

  @Post("/create-offchain")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor("images"))
  @ApiOperation({
    tags: ["nft"],
    operationId: "create nft offchain (draft)",
    summary: "create nft offchain (draft)",
    description: "create a new nft offchain (draft)",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
  })
  @ApiConsumes("multipart/form-data")
  @UsePipes(new TrimPipe())
  async createOffchain(
    @Body() data: CreateOffchain,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() request: any
  ) {
    console.log("request", request.user);
    if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;
    console.log('heheeh')
    if (!files || files.length == 0) throw Causes.DATA_INVALID;
    console.log('hahaha')

    for (let file of files) {
      if (
        !file ||
        !file.mimetype ||
        file.mimetype.split("/").length !== 2 ||
        !file.size
      )
        throw Causes.DATA_INVALID;

      await checkImage(file);
    }
    console.log('huhuhuh2')

    const nftOffchain = await this.nftService.createOffchain(
      data,
      files,
      NftOffChainType.DRAFT,
      request.user
    );
    if (!nftOffchain) throw Causes.NFT_OFFCHAIN_CREATE_FAILED;
    console.log('124124124')

    return nftOffchain;
  }

  @Post("/update-offchain/:id")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor("images"))
  @ApiOperation({
    tags: ["nft"],
    operationId: "update nft offchain (draft)",
    summary: "update nft offchain (draft)",
    description: "update a nft offchain (draft)",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
  })
  @ApiConsumes("multipart/form-data")
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
        if (
          !file ||
          !file.mimetype ||
          file.mimetype.split("/").length !== 2 ||
          !file.size
        )
          throw Causes.DATA_INVALID;

        await checkImage(file);
      }
    }
    const u_nftOffChain = await this.nftService.getDetailNftOffchain(id);
    if (!u_nftOffChain) {
      throw Causes.NFT_OFFCHAIN_DOES_NOT_EXIST;
    }
    const nftOffchain = await this.nftService.updateOffchain(
      data,
      files,
      u_nftOffChain,
      request.user
    );
    if (!nftOffchain) throw Causes.NFT_OFFCHAIN_UPDATE_FAILED;

    return nftOffchain;
  }

  @Get("list-nft")
  @ApiOperation({
    tags: ["nft"],
    operationId: "getList all-nft",
    summary: "Get all all-nft",
    description: "Get all all-nft",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "name",
    required: false,
    example: "name",
    type: String,
  })
  @ApiQuery({
    name: "collectionId",
    required: false,
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: "chainId",
    required: false,
    example: "80001",
    type: String,
  })
  @ApiQuery({
    name: "contractAddress",
    required: false,
    example: "80001",
    type: String,
  })
  async getListNfts(
    @Query("name") name: string,
    @Query("collectionId") collectionId: number,
    @Query("chainId") chainId: string,
    @Query("contractAddress") contractAddress: string,
    @Query("page", new DefaultValuePipe(1)) page: number,
    @Query("limit", new DefaultValuePipe(10)) limit: number
  ) {
    console.log(
      "name, chainId, collectionId, contractAddress",
      name,
      chainId,
      collectionId,
      contractAddress
    );
    return this.nftService.getListNfts(
      { name, chainId, collectionId, contractAddress },
      { page, limit }
    );
  }

  @Get("list-my-nft")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    tags: ["nft"],
    operationId: "getList my-nft",
    summary: "Get all my-nft",
    description: "Get all my-nft",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "name",
    required: false,
    example: "name",
    type: String,
  })
  @ApiQuery({
    name: "collectionId",
    required: false,
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: "chainId",
    required: false,
    example: "80001",
    type: String,
  })
  @ApiQuery({
    name: "contractAddress",
    required: false,
    example: "80001",
    type: String,
  })
  async getNfts(
    @Query("name") name: string,
    @Query("collectionId") collectionId: number,
    @Query("chainId") chainId: string,
    @Query("contractAddress") contractAddress: string,
    @Query("page", new DefaultValuePipe(1)) page: number,
    @Query("limit", new DefaultValuePipe(10)) limit: number,
    @Req() request: any
  ) {
    if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

    return this.nftService.getListNfts(
      { name, chainId, collectionId, contractAddress, userId: request.user.id },
      { page, limit }
    );
  }

  @Get("list-nft-offchain")
  @ApiOperation({
    tags: ["nft"],
    operationId: "getList -nft-offchain",
    summary: "Get all -nft-offchain",
    description: "Get all -nft-offchain",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "name",
    required: false,
    example: "name",
    type: String,
  })
  @ApiQuery({
    name: "type",
    required: false,
    example: "draft || customized || minted",
    type: String,
  })
  @ApiQuery({
    name: "collectionId",
    required: false,
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: "collectionKeyId",
    required: false,
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: "collectionAddress",
    required: false,
    example: "0xB232a50A850c0B1Aada934bED267ebB81cA1980f",
    type: String,
  })
  @ApiQuery({
    name: "chainId",
    required: false,
    example: "80001",
    type: String,
  })
  async getListNftOffchains(
    @Query("name") name: string,
    @Query("type") type: string,
    @Query("collectionId") collectionId: number,
    @Query("collectionKeyId") collectionKeyId: number,
    @Query("collectionAddress") collectionAddress: string,
    @Query("chainId") chainId: string,
    @Query("page", new DefaultValuePipe(1)) page: number,
    @Query("limit", new DefaultValuePipe(10)) limit: number,
    @Req() request: any
  ) {
    return this.nftService.getListNftOffchains(
      { name, collectionId, collectionKeyId, collectionAddress, chainId, type },
      { page, limit }
    );
  }

  @Get("list-my-nft-offchain")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    tags: ["nft"],
    operationId: "getList -my-nft-offchain",
    summary: "Get all -my-nft-offchain",
    description: "Get all -my-nft-offchain",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "name",
    required: false,
    example: "name",
    type: String,
  })
  @ApiQuery({
    name: "type",
    required: false,
    example: "draft || customized || minted",
    type: String,
  })
  @ApiQuery({
    name: "collectionId",
    required: false,
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: "collectionKeyId",
    required: false,
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: "collectionAddress",
    required: false,
    example: "0xB232a50A850c0B1Aada934bED267ebB81cA1980f",
    type: String,
  })
  @ApiQuery({
    name: "chainId",
    required: false,
    example: "80001",
    type: String,
  })
  async getListMyNftOffchains(
    @Query("name") name: string,
    @Query("type") type: string,
    @Query("collectionId") collectionId: number,
    @Query("collectionKeyId") collectionKeyId: number,
    @Query("collectionAddress") collectionAddress: string,
    @Query("chainId") chainId: string,
    @Query("page", new DefaultValuePipe(1)) page: number,
    @Query("limit", new DefaultValuePipe(10)) limit: number,
    @Req() request: any
  ) {
    if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

    return this.nftService.getListNftOffchains(
      {
        name,
        collectionId,
        collectionKeyId,
        collectionAddress,
        chainId,
        type,
        userId: request.user.id,
      },
      { page, limit }
    );
  }

  @Get("/:id")
  @ApiOperation({
    tags: ["nft"],
    operationId: "get detail-nft",
    summary: "Get detail-nft",
    description: "Get detail-nft",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
  })
  async getDetailNft(@Req() request: RequestWithUser, @Param("id") id: number) {
    const nft = await this.nftService.getDetailNft(id);
    if (!nft) {
      throw Causes.NFT_DOES_NOT_EXIST;
    }
    return nft;
  }

  @Get("/offchain/:id")
  @ApiOperation({
    tags: ["nft"],
    operationId: "get -detail-nft-offchain",
    summary: "Get -detail-nft-offchain",
    description: "Get -detail-nft-offchain",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
  })
  async getDetailNftOffChain(
    @Req() request: RequestWithUser,
    @Param("id") id: number
  ) {
    const nft_offchain = await this.nftService.getDetailNftOffchain(id);
    if (!nft_offchain) {
      throw Causes.NFT_OFFCHAIN_DOES_NOT_EXIST;
    }
    return nft_offchain;
  }
}
