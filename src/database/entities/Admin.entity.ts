import {BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {nowInMillis} from '../../shared/Utils';
import {IAdmin} from "../interfaces/IAdmin.interface";

@Entity('admin')
export class Admin implements IAdmin {
    @PrimaryGeneratedColumn({name: 'id', type: 'int'})
    id: number;

    @Column({name: 'full_name', type: 'varchar', length: 80, nullable: false, unique: false})
    fullName: string;

    @Column({name: 'email', type: 'varchar', length: 191, nullable: false, unique: true})
    email: string;

    @Column({name: 'password', type: 'varchar', length: 255, nullable: false})
    password: string;

    @Column({name: 'avatar_url', type: 'varchar', length: 255, nullable: true})
    avatarUrl: string;

    @Column({ name: 'code', type: 'varchar', length: 1000, nullable: true })
    public code: string;

    @Column({name: 'created_at', type: 'bigint', nullable: true})
    createdAt: number;

    @Column({name: 'updated_at', type: 'bigint', nullable: true})
    updatedAt: number;

    @Column({name: 'wallet', type: 'varchar', length: 255, nullable: true})
    wallet: string;

    @Column({name: 'is_active', type: 'tinyint', width: 1, nullable: false, default: 1})
    public isActive: number;

    @Column({name: 'type', type: 'tinyint', nullable: false, default: 2, width: 1})
    public type: number;
    // 1: super admin
    // 2: artist

    @BeforeInsert()
    public updateCreateDates() {
        this.createdAt = nowInMillis();
        this.updatedAt = nowInMillis();
    }

    @BeforeUpdate()
    public updateUpdateDates() {
        this.updatedAt = nowInMillis();
    }
}
