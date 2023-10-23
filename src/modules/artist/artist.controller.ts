import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    HttpStatus,
    Post,
    Query,
    Req,
    UploadedFiles,
    UseInterceptors,
    UsePipes,
    Param,
    UseGuards
} from '@nestjs/common';
import { ArtistService } from './artist.service';
import { Causes } from '../../config/exception/causes';
import { Create } from './request/create.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { checkImage } from 'src/shared/Utils';
import { TrimPipe } from 'src/shared/TrimPipe';
import { Admin } from '../../database/entities';
import {ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse} from '@nestjs/swagger';
import {PaginationResponse} from 'src/config/rest/paginationResponse';
import {JwtAuthGuard} from "../admin/jwt-auth.guard";



@Controller('artist')
export class ArtistController {
    constructor(
        private readonly artistService: ArtistService,
    ) {
    }

    @Get('list')
    @ApiOperation({
        tags: ['artist'],
        operationId: 'getList artist',
        summary: 'Get all artist',
        description: 'Get all artist',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: Admin,
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
    ): Promise<PaginationResponse<Admin>> {
        return this.artistService.getListArtist(
            {name},
            {page, limit}
        );
    }


    @Get('item/:id')
    @ApiOperation({
        tags: ['artist'],
        operationId: 'get detail artist',
        summary: 'Get detail artist',
        description: 'Get detail artist',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: Admin,
    })
    async getDetailArtist(@Param('id') id: number, @Req() request: any) {
        return this.artistService.getDetailArtist(id);
    }
}
