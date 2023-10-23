import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Admin, Collection, CurrencyConfig, Image, Layer, Nft, User} from '../../database/entities';
import {join} from 'path';
import {Causes} from 'src/config/exception/causes';
import {S3} from 'aws-sdk';
import {v4 as uuidv4} from 'uuid';
import {MailService} from '../mail/mail.service';
import axios from 'axios';
import {getConnection, Repository} from 'typeorm';
import {IPaginationOptions} from 'nestjs-typeorm-paginate';
import {PaginationResponse} from 'src/config/rest/paginationResponse';
import {getArrayPaginationBuildTotal} from 'src/shared/Utils';


@Injectable()
export class ArtistService {

    constructor(
        @InjectRepository(Admin)
        private readonly adminDataRepo: Repository<Admin>,
        private readonly mailService: MailService,
    ) {
    }


    async getListArtist(
        data,
        paginationOptions: IPaginationOptions
    ): Promise<PaginationResponse<Admin>> {
        let offset = this.getOffset(paginationOptions);
        let limit = Number(paginationOptions.limit);

        let queryBuilder = getConnection()
            .createQueryBuilder(Admin, 'admin')
            .select(
                `
                    admin.id,
                    admin.full_name as fullName,
                    admin.email as email,
                    admin.avatar_url as avatarUrl,
                    admin.is_active as isActive
                `
            )
            .orderBy('admin.updated_at', 'DESC')
            .limit(limit)
            .offset(offset)
            .where('admin.type = 2');
        let queryCount = getConnection()
            .createQueryBuilder(Admin, 'admin')
            .select(' Count (1) as Total')
            .orderBy('admin.updated_at', 'DESC')
            .where('admin.type = 2');
        if (data.name) {
            queryBuilder.andWhere(
                `admin.name like '%${data.name.trim()}%'`
            );
            queryCount.andWhere(`admin.name like '%${data.name.trim()}%'`);
        }

        const adminData = await queryBuilder.execute();
        const adminCountList = await queryCount.execute();

        const {items, meta} = getArrayPaginationBuildTotal<Admin>(
            adminData,
            adminCountList,
            paginationOptions
        );

        return {
            results: items,
            pagination: meta,
        };
    }

    async getDetailArtist(id: number) {
        let queryBuilder = getConnection()
            .createQueryBuilder(Admin, 'admin')
            .leftJoin(Collection,'collection','collection.creator_id = admin.id')
            .select(
                `
                    admin.id,
                    admin.full_name as fullName,
                    admin.email as email,
                    admin.avatar_url as avatarUrl,
                    admin.is_active as isActive
                `
            )
            .addSelect('count (collection.id) as totalCollections')
            .where('admin.type = 2')
            .andWhere('admin.id = :id',{id:id})
            .orderBy('admin.updated_at', 'DESC')
            .groupBy('admin.id');
        
        const adminData = await queryBuilder.execute();
        return adminData[0];
    }

    

    setParam(params: any) {
        var dataWhere = {};

        return dataWhere;
    }

    getOffset(paginationOptions: IPaginationOptions) {
        let offset = 0;
        if (paginationOptions.page && paginationOptions.limit) {
            if (paginationOptions.page > 0) {
                offset = (Number(paginationOptions.page) - 1) * Number(paginationOptions.limit);
            }
        }
        return offset;
    }

}
