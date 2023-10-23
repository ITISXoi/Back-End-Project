import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {NftService} from './nft.service';
import {NftController} from './nft.controller';
import {Admin, Collection, Image, Layer, MetaData, Nft, NftOffchain, User} from '../../database/entities';
import {MailService} from '../mail/mail.service';
import {JwtModule} from '@nestjs/jwt';
import {CommonModule} from '../common/common.module';
import {NftAdminController} from "./nft.admin.controller";
import {AuthService} from "../admin/auth.service";
import {AuthService as AuthUserService} from "../user/auth.service";
import {JwtStrategy} from "../admin/jwt.strategy";


@Module({
    imports: [
        TypeOrmModule.forFeature([MetaData, Nft, NftOffchain, Collection, Admin, User, Image, Layer, Collection]),
        CommonModule,
        JwtModule.register({
            secret: process.env.SECRET_KEY || 'abcxyz',
        }),
    ],
    providers: [NftService, JwtStrategy, MailService, AuthService,AuthUserService],
    controllers: [NftController, NftAdminController],
})
export class NftModule {
}
