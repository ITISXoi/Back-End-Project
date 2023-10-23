import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {GoogleRecaptchaModule, GoogleRecaptchaNetwork} from '@nestlab/google-recaptcha';
import {Connection} from 'typeorm';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {databaseConfig} from './config/database.config';
import {AuthModule} from './modules/admin/auth.module';
import {AuthUserModule} from './modules/user/auth.module';
import {CommonModule} from './modules/common/common.module';
import {TransformInterceptor} from './config/rest/transform.interceptor';
import {APP_FILTER, APP_INTERCEPTOR} from '@nestjs/core';
import {ExceptionFilter} from './config/exception/exception.filter';
import {CollectionModule} from './modules/collection/collection.module';
import {NftModule} from './modules/nft/nft.module';
import {CurrencyTokenModule} from "./modules/currency-token/currencyToken.module";
import {ArtistModule} from "./modules/artist/artist.module";


@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        TypeOrmModule.forRoot(databaseConfig),
        GoogleRecaptchaModule.forRoot({
            secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
            response: req => req.headers.recaptcha,
            skipIf: process.env.NODE_ENV !== 'production',
            network: GoogleRecaptchaNetwork.Recaptcha,
        }),
        AuthModule,
        AuthUserModule,
        CommonModule,
        CollectionModule,
        NftModule,
        CurrencyTokenModule,
        ArtistModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: TransformInterceptor,
        },
        {
            provide: APP_FILTER,
            useClass: ExceptionFilter,
        },
    ],
})
export class AppModule {
    constructor(private connection: Connection) {
    }
}
