import {BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {nowInMillis} from '../../shared/Utils';

//TODO: refactor to collection_onchain
@Entity('collection')
export class Collection {
    @PrimaryGeneratedColumn({name: 'id', type: 'int'})
    public id: number;

    @Column({name: 'name', type: 'varchar', length: 255, nullable: true})
    public name: string;

    @Column({name: 'symbol', type: 'varchar', length: 255, nullable: true})
    public symbol: string;

    // general || random || composite
    @Column({name: 'type', type: 'varchar', length: 255, nullable: true})
    public type: string;

    @Column({name: 'banner_url', type: 'text', nullable: true})
    public bannerUrl: string;

    @Column({name: 'image_url', type: 'text', nullable: true})
    public imageUrl: string;

    @Column({name: 'description', type: 'text', nullable: true})
    public description: string;

    @Column({name: 'chain_id', type: 'varchar', length: 25, nullable: false})
    public chainId: string;

    // collection id store in SmartContract
    @Column({ name: 'collection_id', type: 'int', nullable: true })
    public collectionId: number;

    @Column({name: 'address', type: 'varchar', nullable: true})
    public address: string;

    @Column({name: 'collection_address', type: 'varchar', nullable: true})
    public collectionAddress: string;

    @Column({name: 'owner', type: 'varchar', nullable: true})
    public owner: string;

    @Column({name: 'payment_token', type: 'varchar', nullable: true})
    public paymentToken: string;

    @Column({name: 'price', type: 'decimal', precision: 65, scale: 18, nullable: true})
    public price: number;

    @Column({name: 'contract_price', type: 'varchar', nullable: true,default: 1})
    public contractPrice: string;

    @Column({name: 'status', type: 'varchar', nullable: true})
    public status: string;

    @Column({name: 'is_public', type: 'bool', nullable: true, default: false})
    public isPublic: boolean;


    @Column({name: 'is_create_draft', type: 'bool', nullable: true, default: false})
    public isCreateDraft: boolean;

    // temporarily don't use
    @Column({name: 'total_nfts', type: 'int', nullable: true})
    public totalNfts: number;

    // temporarily don't use
    @Column({name: 'number_layers', type: 'int', nullable: true})
    public numberLayers: number;

    @Column({name: 'creator_id', type: 'int', nullable: true})
    public creatorId: number;

    @Column({ name: 'block_timestamp', type: 'bigint', nullable: true })
    public blockTimestamp: number;

    @Column({name: 'start_mint_time', type: 'bigint', nullable: true})
    public startMintTime: number;

    @Column({name: 'end_mint_time', type: 'bigint', nullable: true})
    public endMintTime: number;

    @Column({ name: 'is_auto_mint', type: 'bool', nullable: true, default: false })
    public isAutoMint: boolean;

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
