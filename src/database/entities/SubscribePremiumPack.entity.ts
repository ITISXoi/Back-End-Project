import {BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {nowInMillis} from '../../shared/Utils';

@Entity('subscribe_premium_pack')
export class SubscribePremiumPack {
    @PrimaryGeneratedColumn({name: 'id', type: 'int'})
    public id: number;

    
    @Column({name: 'artist_id', type: 'int', nullable: true})
    public artistId: number;


    @Column({name: 'price', type: 'decimal', precision: 65, scale: 18, nullable: true})
    public price: number;


    @Column({name: 'start_time', type: 'bigint', nullable: false})
    public startTime: number;

    @Column({name: 'end_time', type: 'bigint', nullable: false})
    public endTime: number;

    @Column({name: 'wallet', type: 'varchar', length: 255, nullable: true})
    wallet: string;

    @Column({name: 'status', type: 'varchar', nullable: true})
    public status: string;


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
