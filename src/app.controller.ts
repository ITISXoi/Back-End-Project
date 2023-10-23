import {Controller, Get, HttpStatus, Query} from '@nestjs/common';
import {AppService} from './app.service';
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {Collection} from "./database/entities";
import {EmptyObject} from "./shared/response/emptyObject.dto";
import axios from "axios";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {
    }

    @Get('/')
    async healthCheckRoot() {
        const healthcheck = {
            uptime: process.uptime(),
            responsetime: process.hrtime(),
            message: 'OK',
            timestamp: Date.now()
        };

        return healthcheck;
    }

    @Get('/image')
    @ApiOperation({
        tags: ['app'],
        operationId: 'get image from s3',
        summary: 'get image from s3',
        description: 'get image from s3',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: EmptyObject,
    })
    async getImage(
        @Query('url') url: string,
    ) {
        console.log(url)
        const { data, headers } = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
        console.log(data)
        return data;
    }
}
