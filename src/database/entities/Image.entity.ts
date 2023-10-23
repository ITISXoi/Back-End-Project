import {BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {nowInMillis} from '../../shared/Utils';

@Entity('image')
export class Image {
    @PrimaryGeneratedColumn({name: 'id', type: 'int'})
    public id: number;

    @Column({name: 'image_url', type: 'text', nullable: true})
    public imageUrl: string;

    @Column({name: 'name', type: 'varchar', length: 80, nullable: true})
    public name: string;

    @Column({name: 'description', type: 'varchar', length: 1000, nullable: true})
    public description: string;

    @Column({name: 'creator_id', type: 'int', nullable: true})
    public creatorId: number;

    @Column({name: 'collection_id', type: 'int', nullable: true})
    public collectionId: number;

    @Column({name: 'layer_id', type: 'int', nullable: true})
    public layerId: number;

    @Column({name: 'quantity', type: 'int', nullable: true})
    public quantity: number;

    @Column({name: 'remaining_quantity', type: 'int', nullable: true})
    public remainingQuantity: number;

    @Column({name: 'probability', type: 'decimal', precision: 65, scale: 18, nullable: true})
    public probability: number;

    @Column({name: 'price', type: 'decimal', precision: 65, scale: 18, nullable: true, default: 0})
    public price: number;

    @Column({name: 'contract_price', type: 'varchar', nullable: true})
    public contractPrice: string;

    @Column({ name: 'percent', type: 'decimal',precision: 10, scale: 4,  nullable: true })
    public percent: number;

    @Column({name: 'image_type', type: 'varchar', length: 25, nullable: true})
    public imageType: string;

    @Column({name: 'is_minted', type: 'bool', nullable: true, default: false})
    public isMinted: boolean;

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