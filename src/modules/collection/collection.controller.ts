import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Param,
  Query,
  Req,
} from "@nestjs/common";
import { CollectionService } from "./collection.service";
import { ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import {
  PaginationResponse,
  Response,
} from "src/config/rest/paginationResponse";
import { Collection, Image, Layer } from "../../database/entities";
import { AuthService } from "../admin/auth.service";

@Controller("collection")
export class CollectionController {
  constructor(
    private readonly collectionService: CollectionService,
    private authService: AuthService
  ) {}

  @Get("item/:id")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({
    tags: ["collection"],
    operationId: "get detail collection",
    summary: "Get detail collection",
    description: "Get detail collection",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
    type: Collection,
  })
  async getCollection(@Param("id") id: number, @Req() request: any) {
    return this.collectionService.getDetailCollection(id);
  }

  @Get("list")
  @ApiOperation({
    tags: ["collection"],
    operationId: "getList",
    summary: "Get all collection",
    description: "Get all collection",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
    type: Collection,
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
    type: String,
  })
  async getList(
    @Query("name") name: string,
    @Query("page", new DefaultValuePipe(1)) page: number,
    @Query("limit", new DefaultValuePipe(10)) limit: number,
    @Req() request: any
  ): Promise<PaginationResponse<Collection>> {
    return this.collectionService.getListCollection({ name }, { page, limit });
  }

  @Get("/layer/list")
  @ApiOperation({
    tags: ["collection"],
    operationId: "getList /layer/list",
    summary: "Get all layer of /layer/list",
    description: "Get all layer of /layer/list",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
    type: Collection,
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
    name: "collectionId",
    required: true,
    type: Number,
  })
  async getListLayer(
    @Query("collectionId") collectionId: number,
    @Query("page", new DefaultValuePipe(1)) page: number,
    @Query("limit", new DefaultValuePipe(10)) limit: number,
    @Req() request: any
  ): Promise<PaginationResponse<Layer>> {
    return this.collectionService.getListLayerWeb(
      { collectionId },
      { page, limit }
    );
  }

  @Get("/layer/image/list")
  @ApiOperation({
    tags: ["collection"],
    operationId: "getList /layer/image/list",
    summary: "Get all image of /layer/image/list",
    description: "Get all image of /layer/image/list",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
    type: Collection,
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
    name: "layerId",
    required: false,
    type: Number,
  })
  async getListImage(
    @Query("layerId") layerId: number,
    @Query("page", new DefaultValuePipe(1)) page: number,
    @Query("limit", new DefaultValuePipe(10)) limit: number,
    @Req() request: any
  ): Promise<PaginationResponse<Image>> {
    return this.collectionService.getListImageWeb({ layerId }, { page, limit });
  }
  @Get("/metadata/list-collection")
  @ApiOperation({
    tags: ["medata-collection"],
    operationId: "getList /metadata/list-collection",
    summary: "Get all collection",
    description: "Get all collection",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
    type: Collection,
  })
  async getAllCollection(@Req() request: any): Promise<any> {
    return this.collectionService.getAllCollection();
  }
}
