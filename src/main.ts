require('dotenv').config();
import {AppWorkerModule} from "./app-worker.module";
import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {AppModule} from './app.module';
import {debugLog, logger} from './shared/logger';
import * as fs from 'fs';
import {ValidationPipe} from '@nestjs/common';
import {ExpressAdapter} from '@nestjs/platform-express';
import * as http from 'http';
import * as https from 'https';
import * as bodyParser from 'body-parser';

const express = require('express')

async function bootstrap() {
    let app = null;
    if (process.env.NODE_ENV === 'dev-worker' || process.env.NODE_ENV === 'prod-worker') {
        const server = express();
        app = await NestFactory.create(AppWorkerModule, new ExpressAdapter(server));
        app.use(logger);
        app.enableCors();
        app.useGlobalPipes(new ValidationPipe());


        app.use('/', function (req, res) {
            res.status(200);
            res.json({ meta: { code: 200, message: "Successful" } })
        });

        app.use(logger);
        app.enableCors();
        app.useGlobalPipes(new ValidationPipe());

        await app.init();
        const privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
        const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
        const httpsOptions = { key: privateKey, cert: certificate };
        http.createServer(server).listen(process.env.PORT || 3000);
        https.createServer(httpsOptions, server).listen(process.env.HTTPS_PORT || 443);
        debugLog(`Application is running on: ${process.env.PORT || 3000} and ${process.env.HTTPS_PORT || 443}`);

        debugLog(`Worker is running`);
    } else {
        if (process.env.NODE_ENV !== 'dev-api' && process.env.NODE_ENV !== 'prod-api') {
            debugLog(`NODE_ENV set to dev-api`);
        }
        const server = express();
        app = await NestFactory.create(AppModule,
            new ExpressAdapter(server));

        const options = new DocumentBuilder()
            .setTitle('NFTee APIs')
            .setDescription('NFTee APIs')
            .setVersion('1.0')
            .addBearerAuth(
                {
                    description: 'Bearer *token*',
                    type: 'apiKey',
                    name: 'Authorization',
                    in: 'header',
                },
                'JWT',
            )
            .addSecurityRequirements('JWT')
            .build();

        if (process.env.NODE_ENV !== 'prod-api') {
            const document = SwaggerModule.createDocument(app, options);
            writeSwaggerJson(`${process.cwd()}`, document);
            SwaggerModule.setup('docs', app, document);
        }


        app.use(bodyParser.json({limit: '10mb'}));
        app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));

        app.use('/ipfs', express.static('ipfs'), function (req, res) {
            // Optional 404 handler
            res.status(404);
            res.json({error: {code: 404}})
        });

        app.use(logger);
        app.enableCors();
        app.useGlobalPipes(new ValidationPipe());

        await app.init();
        const privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
        const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
        const httpsOptions = {key: privateKey, cert: certificate};
        http.createServer(server).listen(process.env.PORT || 3000);
        https.createServer(httpsOptions, server).listen(process.env.HTTPS_PORT || 443);
        debugLog(`Application is running on: ${process.env.PORT || 3000} and ${process.env.HTTPS_PORT || 443}`);
    }

}

bootstrap().then(() => {
    process.on('uncaughtException', err => {
        console.error('There was an uncaught error', err);
    });
});

export const writeSwaggerJson = (path: string, document: any) => {
    fs.writeFileSync(`${path}/swagger.json`, JSON.stringify(document, null, 2), {encoding: 'utf8'});
};
