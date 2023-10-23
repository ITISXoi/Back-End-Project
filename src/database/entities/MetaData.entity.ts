import {random} from 'lodash';
import {BeforeInsert, BeforeUpdate, Column, Entity, PrimaryColumn} from 'typeorm';
import {nowInMillis} from '../../shared/Utils';

@Entity('meta_data')

export class MetaData {
    @PrimaryColumn({name: 'id', type: 'bigint'})
    public id: number;

    @Column({name: 'collection_id', type: 'int', nullable: true})
    public collectionId: number;

    @Column({name: 'collection_name', type: 'varchar', nullable: true})
    public collectionName: string;

    @Column({name: 'name', type: 'varchar', length: 60, nullable: true})
    public name: string;

    @Column({name: 'slug', type: 'varchar', length: 60, nullable: true})
    public slug: string;

    @Column({name: 'image_url', type: 'text', nullable: true})
    public imageUrl: string;

    @Column({name: 'description', type: 'text', nullable: true})
    public description: string;

    @Column({name: 'note', type: 'text', nullable: true})
    public note: string;

    @Column({name: 'type', type: 'varchar', length: 25, nullable: true})
    public type: string;


    @Column({name: 'image_type', type: 'varchar', length: 25, nullable: true})
    public imageType: string;

    @Column({name: 'data', type: 'text', nullable: true})
    public data: string;

    @Column({name: 'properties', type: 'text', nullable: true})
    public properties: string;

    @Column({name: 'created_at', type: 'bigint', nullable: false})
    public createdAt: number;

    @Column({name: 'updated_at', type: 'bigint', nullable: false})
    public updatedAt: number;


    @Column({name: 'files', type: 'text', nullable: true})
    public files: string;

    @Column({name: 'attributes', type: 'text', nullable: true})
    public attributes: string;

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
