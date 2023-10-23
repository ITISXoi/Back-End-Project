import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CollectionService} from './collection.service';
import {CollectionController} from './collection.controller';
import {Admin, Collection, Image, Layer, User} from '../../database/entities';
import {JwtModule} from '@nestjs/jwt';
import {AuthService} from '../admin/auth.service';
import {MailService} from "../mail/mail.service";
import {S3Handler} from "../../shared/S3Handler";
import {CollectionAdminController} from "./collection.admin.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([Collection, Admin, User, Layer, Image]),
        JwtModule.register({
            secret: process.env.SECRET_KEY || 'abcxyz',
        }),
    ],
    providers: [CollectionService, AuthService, MailService, S3Handler],
    controllers: [CollectionController, CollectionAdminController],
})
export class CollectionModule {
}
