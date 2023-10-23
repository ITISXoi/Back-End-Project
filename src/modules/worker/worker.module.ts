import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  LatestBlock,
  Collection,
  User, CurrencyConfig, MetaData, Nft, NftLog, Image, Layer, NftOffchain,
} from '../../database/entities';
import { CommonModule } from '../common/common.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WorkerManagerService } from './worker-manager.service';
import { NftService } from '../nft/nft.service';
import { MailService } from '../mail/mail.service';
import { AuthService } from '../user/auth.service';
import { JwtService } from '@nestjs/jwt';
import { S3Handler } from 'src/shared/S3Handler';
import {MailModule} from "../mail/mail.module";
@Module({
  imports: [TypeOrmModule.forFeature([
    LatestBlock,
    CurrencyConfig,
    Collection,
    MetaData,
    Nft,
    NftOffchain,
    NftLog,
    Image,
    Layer,
    Collection,
    User]),
    CommonModule,
    MailModule,
    ScheduleModule.forRoot()],
  controllers: [],
  exports: [TypeOrmModule, WorkerManagerService],
  providers: [WorkerManagerService, NftService,MailService, AuthService, JwtService, S3Handler],
})
export class WorkerModule {}
