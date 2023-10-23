import {BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {nowInMillis} from '../../shared/Utils';

@Entity('layer')
export class Layer {
    @PrimaryGeneratedColumn({name: 'id', type: 'int'})
    public id: number;

    @Column({name: 'name', type: 'varchar', length: 80, nullable: true})
    public name: string;

    @Column({name: 'image_url', type: 'text', nullable: true})
    public imageUrl: string;

    @Column({name: 'description', type: 'varchar', length: 1000, nullable: true})
    public description: string;

    @Column({name: 'creator_id', type: 'int', nullable: true})
    public creatorId: number;

    @Column({name: 'layer_index', type: 'int', nullable: true})
    public layerIndex: number;

    @Column({name: 'collection_id', type: 'int', nullable: true})
    public collectionId: number;

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
