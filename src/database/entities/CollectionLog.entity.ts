import {BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {nowInMillis} from '../../shared/Utils';

@Entity('collection_log')
export class CollectionLog {
    @PrimaryGeneratedColumn({name: 'id', type: 'int'})
    public id: number;

    //id of nft_onchain
    @Column({ name: 'key_id', type: 'int', nullable: false })
    public keyId: number;

    // collection id store in SmartContract
    @Column({ name: 'collection_id', type: 'int', nullable: false })
    public collectionId: number;

    @Column({name: 'chain_id', type: 'varchar', length: 25, nullable: false})
    public chainId: string;

    // collection controller SC address
    @Column({name: 'address', type: 'varchar', nullable: true})
    public address: string;

    // collection SC address
    @Column({name: 'collection_address', type: 'varchar', nullable: true})
    public collectionAddress: string;

    // artist address
    @Column({name: 'owner', type: 'varchar', nullable: true})
    public owner: string;

    @Column({name: 'payment_token', type: 'varchar', nullable: true})
    public paymentToken: string;

    @Column({ name: 'price', type: 'varchar', nullable: true, default: 1 })
    public price: string;

    @Column({ name: 'txid', type: 'varchar', nullable: true })
    public txid: string;

    @Column({name: 'status', type: 'varchar', nullable: true})
    public status: string;

    @Column({ name: 'block_hash', type: 'varchar', length: 100, nullable: true })
    public blockHash: string;

    @Column({ name: 'block_number', type: 'bigint', nullable: true })
    public blockNumber: number;

    @Column({ name: 'block_timestamp', type: 'bigint', nullable: true })
    public blockTimestamp: number;

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
