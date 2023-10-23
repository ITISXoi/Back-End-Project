import {BeforeInsert, BeforeUpdate, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm';
import {nowInMillis} from '../../shared/Utils';
import {random} from "lodash";

//onchain
@Entity('nft')
export class Nft {
    @PrimaryColumn({name: 'id', type: 'bigint'})
    public id: number;

    @Column({ name: 'chain_id', type: 'varchar', nullable: true })
    public chainId: string;

    @Column({ name: 'contract_address', type: 'varchar', nullable: false })
    public contractAddress: string;

    @Column({name: 'token_id', type: 'varchar', nullable: true})
    public tokenId: string;

    @Column({name: 'total_img', type: 'int', nullable: true, default : 0})
    public totalImg: number;

    @Column({name: 'collection_id', type: 'int', nullable: false})
    public collectionId: number;

    @Column({name: 'layer_ids', type: 'text', nullable: false})
    public layerIds: string;

    @Column({name: 'image_ids', type: 'text', nullable: false})
    public imageIds: string;

    @Column({name: 'collection_name', type: 'varchar', nullable: true})
    public collectionName: string;

    @Column({name: 'name', type: 'varchar', length: 255, nullable: true})
    public name: string;

    @Column({name: 'slug', type: 'varchar', length: 60, nullable: true})
    public slug: string;

    @Column({name: 'price', type: 'decimal', precision: 65, scale: 18, nullable: true, default: 0})
    public price: number;

    @Column({name: 'contract_price', type: 'varchar', nullable: true})
    public contractPrice: string;

    @Column({name: 'image_url', type: 'text', nullable: true})
    public imageUrl: string;

    @Column({name: 'description', type: 'text', nullable: true})
    public description: string;

    @Column({name: 'note', type: 'text', nullable: true})
    public note: string;

    @Column({name: 'token_uri', type: 'varchar', nullable: true})
    public tokenUri: string;

    @Column({name: 'data', type: 'text', nullable: true})
    public data: string;

    @Column({name: 'meta_data', type: 'text', nullable: true})
    public metaData: string;

    @Column({name: 'files', type: 'text', nullable: true})
    public files: string;

    @Column({name: 'attributes', type: 'text', nullable: true})
    public attributes: string;

    @Column({name: 'image_type', type: 'varchar', length: 25, nullable: true})
    public imageType: string;

    @Column({ name: 'block_timestamp', type: 'bigint', nullable: true })
    public blockTimestamp: number;

    @Column({name: 'status', type: 'varchar', length: 25, nullable: true})
    public status: string;

    @Column({name: 'owner', type: 'varchar', nullable: true})
    public owner: string;

    @Column({name: 'layer_hash', type: 'varchar', nullable: true})
    public layerHash: string;

    @Column({name: 'artist_id', type: 'int', nullable: false})
    public artistId: number;

    @Column({name: 'creator_id', type: 'int', nullable: false})
    public creatorId: number;

    @Column({name: 'created_at', type: 'bigint', nullable: false})
    public createdAt: number;

    @Column({name: 'updated_at', type: 'bigint', nullable: false})
    public updatedAt: number;


    @BeforeInsert()
    public updateCreatedAt() {
        this.id = parseInt(random(10, 99) + '' + nowInMillis() + '' + random(100, 999));
        this.createdAt = nowInMillis();
        this.updatedAt = nowInMillis();
    }

    @BeforeUpdate()
    public updateUpdatedAt() {
        this.updatedAt = nowInMillis();
    }
}
