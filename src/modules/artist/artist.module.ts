import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistService } from './artist.service';
import { ArtistController } from './artist.controller';
import { Admin } from '../../database/entities';
import { MailService } from '../mail/mail.service';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from '../common/common.module';


@Module({
    imports: [
        TypeOrmModule.forFeature([Admin]),
        CommonModule,
        JwtModule.register({
            secret: process.env.SECRET_KEY || 'abcxyz',
        }),
    ],
    providers: [ArtistService, MailService],
    controllers: [ArtistController],
})
export class ArtistModule {
}
