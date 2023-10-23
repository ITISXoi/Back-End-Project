import {BeforeInsert, BeforeUpdate, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm';
import {nowInMillis} from '../../shared/Utils';
import {random} from "lodash";

//draft || customized for NFT
@Entity('nft_offchain')
export class NftOffchain {
    @PrimaryGeneratedColumn({name: 'id', type: 'int'})
    public id: number;

    @Column({ name: 'type', type: 'varchar', nullable: true })
    public type: string;

    @Column({name: 'collection_id', type: 'int', nullable: true})
    public collectionId: number;

    @Column({name: 'collection_key_id', type: 'int', nullable: true})
    public collectionKeyId: number;

    @Column({name: 'collection_address', type: 'varchar', nullable: true})
    public collectionAddress: string;

    @Column({name: 'chain_id', type: 'varchar', length: 25, nullable: true})
    public chainId: string;

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

    @Column({name: 'price', type: 'decimal', precision: 65, scale: 18, nullable: true})
    public price: number;

    @Column({name: 'image_url', type: 'text', nullable: true})
    public imageUrl: string;

    @Column({name: 'description', type: 'text', nullable: true})
    public description: string;

    @Column({name: 'note', type: 'text', nullable: true})
    public note: string;

    @Column({name: 'attributes', type: 'text', nullable: true})
    public attributes: string;

    @Column({name: 'image_type', type: 'varchar', length: 25, nullable: true})
    public imageType: string;

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
        this.createdAt = nowInMillis();
        this.updatedAt = nowInMillis();
    }

    @BeforeUpdate()
    public updateUpdatedAt() {
        this.updatedAt = nowInMillis();
    }
}
