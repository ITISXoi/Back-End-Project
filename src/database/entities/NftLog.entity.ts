import {BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {nowInMillis} from '../../shared/Utils';

@Entity('nft_log')
export class NftLog {
    @PrimaryGeneratedColumn({name: 'id', type: 'int'})
    public id: number;

    // collection id store in SmartContract
    @Column({ name: 'collection_id', type: 'int', nullable: false })
    public collectionId: number;

    @Column({name: 'chain_id', type: 'varchar', length: 25, nullable: false})
    public chainId: string;

    @Column({ name: 'contract_address', type: 'varchar', nullable: false })
    public contractAddress: string;

    @Column({name: 'token_id', type: 'varchar', nullable: true})
    public tokenId: string;

    // owner address
    @Column({name: 'owner', type: 'varchar', nullable: true})
    public owner: string;

    @Column({name: 'token_uri', type: 'varchar', nullable: true})
    public tokenUri: string;

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
