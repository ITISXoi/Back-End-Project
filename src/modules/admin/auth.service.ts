import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginResponse } from './response/login.dto';
import * as argon2 from 'argon2';
import { Admin, User, SubscribePremiumPack } from '../../database/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Register } from './request/register.dto';
import { convertToObject, encrypt, getOffset } from '../../shared/Utils';
import { MailService } from '../mail/mail.service';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { getArrayPaginationBuildTotal } from 'src/shared/Utils';
import { getConnection, Repository } from 'typeorm';
import { SubscribePremiumPackStatus } from "../../shared/enums";

import { CreateAdmin } from "../admin/request/create.dto";
import { PaginationResponse } from "../../config/rest/paginationResponse";
import { S3 } from "aws-sdk";
import { use } from "passport";

var tokenMap = new Map();
var limitRequestLoginMap = new Map();

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private readonly mailService: MailService,

        @InjectRepository(User)
        private usersRepository: Repository<User>,

        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
    ) {
    }

    //login
    async validateAdmin(data: any): Promise<any> {
        const { email } = data;
        if (email) {
            return this.getUserByEmail(email);
        }
        return null;
    }

    async isValidToken(token: string) {
        return true;
        // return tokenMap.get(encrypt(token)) == '1';
    }

    async setValidToken(token: string) {
        return true;
        // tokenMap.set(encrypt(token), '1');
    }

    async deleteValidToken(token: string) {
        return true;
        // tokenMap.delete(encrypt(token));
    }

    async login(user: any): Promise<any> {
        const payload = { email: user.email, userId: user.id };
        const token = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: process.env.JWT_EXPIRED,
        });

        await this.setValidToken(token);

        return {
            email: user.email,
            type: user.type,
            token,
        };
    }

    async getUserByEmail(email: string): Promise<Admin | undefined> {
        return this.adminRepository.findOne({ email: email });
    }

    async checkPermissionUser(user: any): Promise<any> {
        const userData = await this.adminRepository.findOne(user.id);
        // check is super admin or not
        if (userData.type == 1) {
            return true;
        }
        return false;
    }


    //register
    async checkDuplicatedUser(data: Register): Promise<any> {
        //check duplicated username or email
        const duplicatedUser = await this.getUserByEmail(data.email);
        return duplicatedUser;
    }

    async genCode() {
        const hashedSecret = await argon2.hash(Date.now().toString());
        const code = this.jwtService.sign(
            { data: hashedSecret },
            {
                expiresIn: process.env.JWT_EXPIRED,
                secret: process.env.JWT_SECRET,
            }
        );
        return code;
    }

    async updateCode(user: Admin, code: string) {
        user.code = code;
        user = await this.adminRepository.save(user);

        delete user.code;
        delete user.password;

        return user;
    }

    async getUserByCode(code: string): Promise<Admin | undefined> {
        return this.adminRepository.findOne({ code: code });
    }

    async updateResetPassword(user: Admin, password: string) {
        const hashedNewPassword = await argon2.hash(password);

        user.password = hashedNewPassword;
        user = await this.adminRepository.save(user);

        delete user.code;
        delete user.password;

        return user;
    }

    async updateProfile(user: Admin, data: any, files: any) {
        if (!user || !user.email || !data) return false;

        let dataUser = await this.getUserByEmail(user.email);

        if (!dataUser) return false;

        for (const [key, value] of Object.entries(data)) {
            if (['fullName', 'avatarUrl'].includes(key)) {
                dataUser[key] = value;
            }
        }

        let imageUrl;
        if (files) {
            if (files.image) {
                const imageUpload = await this.upload(files.image);

                if (!imageUpload || !imageUpload.Location) return false;
                imageUrl = imageUpload.Location;
            }
        }

        if (data.avatarUrl) {
            dataUser.avatarUrl = imageUrl;
        }

        dataUser = await this.adminRepository.save(dataUser);

        delete dataUser.password;

        return dataUser;
    }

    async updatePassword(user: Admin, data: any) {
        if (!user || !user.email || !data) return false;

        let dataUser = await this.getUserByEmail(user.email);
        if (!dataUser) return false;

        const isPassword = await argon2.verify(dataUser.password, data.oldPassword);

        if (!isPassword) return false;

        const hashedNewPassword = await argon2.hash(data.newPassword);

        dataUser.password = hashedNewPassword;
        dataUser = await this.adminRepository.save(dataUser);

        // const {password, token, twoFactorAuthenticationSecret, ...dataReturn} = dataUser;

        return {};
    }

    async activeUser(token: string) {
        if (!token) return false;

        let user = await this.getUserByToken(token);

        // if (!user || user.status !== 'request') return false;

        // user.status = 'active';

        // user = await this.usersRepository.save(user);

        return user;
    }

    async resetPassword(token: string, password: string) {
        if (!token) return false;

        let user = await this.getUserByToken(token);

        if (!user) return false;

        const hashedPassword = await argon2.hash(password);
        user.password = hashedPassword;

        user = await this.usersRepository.save(user);

        return user;
    }

    async create(data: CreateAdmin, files: any): Promise<any> {
        const hashedPassword = await argon2.hash(data.password);
        let imageUrl;

        if (files) {
            if (files.image) {
                const imageUpload = await this.upload(files.image);

                if (!imageUpload || !imageUpload.Location) return false;
                imageUrl = imageUpload.Location;
            }
        }

        const user = await this._registerAdmin(
            data.email,
            data.fullName,
            data.type,
            hashedPassword,
            imageUrl
        );
        delete user.password;
        return user;
    }

    async registerUser(data: Register): Promise<any> {
        //hash password
        const hashedPassword = await argon2.hash(data.password);

        //insert user table
        const user = await this._registerUser(data.email, hashedPassword);

        const token = await this.getToken(user);

        // send mail active
        const urlActive = process.env.URL_API + '/user/active' + '?code=' + token;
        const content = "To activate your account, please click on the link below: " + urlActive;
        const subject = "Confirm email for active account";

        // await this.mailService.sendMail(user.email, subject, user.firstName, content);

        return {
            email: user.email
        };
    }

    async resendMailActiveUser(email: string): Promise<any> {

        let user = await this.getUserByEmail(email);

        if (!user) return false;

        const token = await this.getToken(user);

        // send mail active
        const urlActive = process.env.URL_API + '/user/active' + '?code=' + token;
        const content = "To activate your account, please click on the link below: " + urlActive;
        const subject = "Confirm email for active account";

        // await this.mailService.sendMail(user.email, subject, user.firstName, content);

        return {
            email: user.email
        };
    }

    async sendMailResetPassword(email: string): Promise<any> {

        let user = await this.getUserByEmail(email);

        if (!user) return false;

        const token = await this.getToken(user);

        // send mail active
        const urlActive = process.env.URL_FRONTEND + '/user/reset-password' + '?code=' + token;
        const content = "To update password your account, please click on the link below: " + urlActive;
        const subject = "Confirm email for reset password";

        // await this.mailService.sendMail(user.email, subject, user.firstName, content);

        return {
            email: user.email
        };
    }

    async _registerUser(email: string, password: string) {

        let user = new Admin();
        user.email = email;
        user.password = password;

        user = await this.adminRepository.save(user);
        return user;
    }

    async getToken(user: Admin) {
        const token = this.jwtService.sign({ email: user.email, time: Date.now() });

        // user.token = token;
        // user = await this.adminRepository.save(user);

        return token;
    }

    async getUserByToken(token: string) {
        const data = convertToObject(this.jwtService.decode(token));

        if (!data || !data.email || !data.time || (Date.now() - data.time) > parseInt(process.env.EXPRIRE_TIME_TOKEN)) return false;

        let user = await this.getUserByEmail(data.email);

        if (!user) return false;

        return user;
    }

    async _registerAdmin(
        email: string,
        fullname: string,
        type: number,
        password: string,
        imageUrl: string
    ) {
        let user = new Admin();
        user.email = email;
        user.fullName = fullname;
        user.password = password;
        user.type = type;
        user.avatarUrl = imageUrl;
        user = await this.adminRepository.save(user);
        return user;
    }


    logout(token: string) {
        const tokenWithoutBearer = token.split(' ')[1];

        this.deleteValidToken(tokenWithoutBearer);
    }

    async getListUser(params, paginationOptions: IPaginationOptions,) {
        let offset = getOffset(paginationOptions);
        let limit = Number(paginationOptions.limit);
        let queryBuilder = getConnection()
            .createQueryBuilder(User, "user")
            .select(
                "user.id, user.email, user.username, user.avatar_url as avatarUrl, " +
                "user.last_name as lastName, user.first_name as firstName, user.status, user.created_at as createdAt, user.updated_at as updatedAt"
            )
            .orderBy("user.created_at", "DESC")
            .limit(limit)
            .offset(offset);
        let queryCount = getConnection()
            .createQueryBuilder(User, "user")
            .select(" Count (1) as Total")
            .orderBy("user.created_at", "DESC");

        if (params.status) {
            queryBuilder.andWhere(`user.status =:status`, {
                status: params.status,
            });
            queryCount.andWhere(`user.status =:status`, {
                status: params.status,
            });
        }
        if (params.email && params.email !== "") {
            if (
                params.email.includes("%") != true &&
                params.email.includes("_") != true
            ) {
                queryBuilder.andWhere(
                    `user.email like '%${params.email.trim()}%'`
                );
                queryCount.andWhere(
                    `user.email like '%${params.email.trim()}%'`
                );
            } else {
                queryBuilder.andWhere(
                    `user.email like '%!${params.email.trim()}%' ESCAPE '!'`
                );
                queryCount.andWhere(
                    `user.email like '%!${params.email.trim()}%' ESCAPE '!'`
                );
            }
        }
        if (params.username) {
            queryBuilder.andWhere(`user.username like '%!${params.username.trim()}%' ESCAPE '!'`);
            queryCount.andWhere(`user.username like '%!${params.username.trim()}%' ESCAPE '!'`);
        }
        const users = await queryBuilder.execute();
        const usersCountList = await queryCount.execute();

        const { items, meta } = getArrayPaginationBuildTotal<User>(
            users,
            usersCountList,
            paginationOptions
        );

        return {
            results: items,
            pagination: meta,
        };
    }

    async getList(
        params,
        paginationOptions: IPaginationOptions
    ): Promise<PaginationResponse<Admin>> {

        let offset = getOffset(paginationOptions);
        let limit = Number(paginationOptions.limit);
        let queryBuilder = getConnection()
            .createQueryBuilder(Admin, "admin")
            .select(
                "admin.id, admin.email,admin.is_active as isActive, admin.avatar_url as avatarUrl, " +
                "admin.full_name as fullName, admin.type, admin.created_at as createdAt, admin.updated_at as updatedAt"
            )
            .orderBy("admin.created_at", "DESC")
            .limit(limit)
            .offset(offset);
        let queryCount = getConnection()
            .createQueryBuilder(Admin, "admin")
            .select(" Count (1) as Total")
            .orderBy("admin.created_at", "DESC");

        if (params.isActive) {
            queryBuilder.andWhere(`admin.is_active =:isActive`, {
                isActive: params.isActive,
            });
            queryCount.andWhere(`admin.is_active =:isActive`, {
                isActive: params.isActive,
            });
        }
        if (params.email && params.email !== "") {
            if (
                params.email.includes("%") != true &&
                params.email.includes("_") != true
            ) {
                queryBuilder.andWhere(
                    `admin.email like '%${params.email.trim()}%'`
                );
                queryCount.andWhere(
                    `admin.email like '%${params.email.trim()}%'`
                );
            } else {
                queryBuilder.andWhere(
                    `admin.email like '%!${params.email.trim()}%' ESCAPE '!'`
                );
                queryCount.andWhere(
                    `admin.email like '%!${params.email.trim()}%' ESCAPE '!'`
                );
            }
        }
        if (params.type) {
            queryBuilder.andWhere(`admin.type  =:type`, { type: params.type });
            queryCount.andWhere(`admin.type  =:type`, { type: params.type });
        }
        const admins = await queryBuilder.execute();
        const adminsCountList = await queryCount.execute();

        console.log(admins);
        console.log(adminsCountList);
        const { items, meta } = getArrayPaginationBuildTotal<Admin>(
            admins,
            adminsCountList,
            paginationOptions
        );

        return {
            results: items,
            pagination: meta,
        };
    }

    async getUserByUsername(username: string): Promise<Admin | undefined> {
        return this.adminRepository.findOne({});
    }

    async getAdminById(id: number): Promise<Admin | undefined> {
        const admin = await this.adminRepository.findOne(id);
        delete admin.password;
        return admin;
    }

    async getUserById(id: number): Promise<User | undefined> {
        const user = await this.usersRepository.findOne(id);
        delete user.password;
        delete user.token;
        return user;
    }

    getOffset(paginationOptions: IPaginationOptions) {
        let offset = 0;
        if (paginationOptions.page && paginationOptions.limit) {
            if (paginationOptions.page > 0) {
                offset =
                    (Number(paginationOptions.page) - 1) *
                    Number(paginationOptions.limit);
            }
        }
        return offset;
    }

    async upload(file): Promise<any> {
        const { originalname } = file;
        const bucketS3 = process.env.AWS_BUCKET;
        return await this.uploadS3(file.buffer, bucketS3, originalname);
    }

    async uploadS3(file, bucket, name) {
        const s3 = this.getS3();
        const params = {
            Bucket: bucket,
            Key: 'collections/' + String(name),
            Body: file,
        };
        return new Promise((resolve, reject) => {
            s3.upload(params, (err, data) => {
                if (err) {
                    reject(err.message);
                }
                return resolve(data);
            });
        });
    }

    getS3() {
        return new S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
    }


    async getListSubscribePremiumPack(user : any,paginationOptions: IPaginationOptions) {
        let offset = this.getOffset(paginationOptions);
        let limit = Number(paginationOptions.limit);

        let queryBuilder = getConnection()
            .createQueryBuilder(SubscribePremiumPack, "subscribe_premium_pack")
            .leftJoin(Admin,'admin','admin.id = subscribe_premium_pack.artist_id')
            .select(`
                subscribe_premium_pack.id as id,
                subscribe_premium_pack.artist_id as artistId,
                subscribe_premium_pack.price as price,
                subscribe_premium_pack.start_time as startTime,
                subscribe_premium_pack.end_time as endTime,
                subscribe_premium_pack.status as status
            `)
            .addSelect(`
                admin.full_name as nameArtist,
                admin.email as email
            `)
            .where(`subscribe_premium_pack.status = '${SubscribePremiumPackStatus.CONFIRMED}'`)
            .orderBy("subscribe_premium_pack.created_at", "DESC")
            .limit(limit)
            .offset(offset);

        let queryCount = getConnection()
            .createQueryBuilder(SubscribePremiumPack, "subscribe_premium_pack")
            .select(" Count (1) as Total")
            .where(`subscribe_premium_pack.status = '${SubscribePremiumPackStatus.CONFIRMED}'`)
            .orderBy("subscribe_premium_pack.created_at", "DESC");

        const subscribePremiumPack = await queryBuilder.execute();
        const subscribePremiumPackCountList = await queryCount.execute();
        const { items, meta } = getArrayPaginationBuildTotal<SubscribePremiumPack>(
            subscribePremiumPack,
            subscribePremiumPackCountList,
            paginationOptions
        );

        return {
            results: items,
            pagination: meta,
        };
    }


    async getSubscribePremiumPack(user : any) {

        let queryBuilder = getConnection()
            .createQueryBuilder(SubscribePremiumPack, "subscribe_premium_pack")
            .leftJoin(Admin,'admin','admin.id = subscribe_premium_pack.artist_id')
            .select(`
                subscribe_premium_pack.id as id,
                subscribe_premium_pack.artist_id as artistId,
                subscribe_premium_pack.price as price,
                subscribe_premium_pack.start_time as startTime,
                subscribe_premium_pack.end_time as endTime,
                subscribe_premium_pack.status as status
            `)
            .addSelect(`
                admin.full_name as nameArtist,
                admin.email as email
            `)
            .where(`subscribe_premium_pack.status = '${SubscribePremiumPackStatus.CONFIRMED}'`)
            .andWhere('subscribe_premium_pack.artist_id = :artistId',{artistId:user.id})
            .orderBy("subscribe_premium_pack.created_at", "DESC")
            .limit(1)
            .offset(0)
            .execute();

        
        return queryBuilder;
    }


    async subscribePremiumPack(data: any, user: any){
        let date = new Date();
        const newDate = await this.addYears(date, 1);


        let subscribePremiumPack = new SubscribePremiumPack();
        subscribePremiumPack.artistId = user? user.id : 1;
        subscribePremiumPack.price =  0 ;//data.price;
        subscribePremiumPack.wallet = data.wallet;
        subscribePremiumPack.status = SubscribePremiumPackStatus.CONFIRMED;
        subscribePremiumPack.startTime = date.getTime();
        subscribePremiumPack.endTime = newDate.getTime(); 
        return await getConnection().getRepository(SubscribePremiumPack).save(subscribePremiumPack);
    }

    async addYears(date, years) {
        date.setFullYear(date.getFullYear() + years);
        return date;
    }
}
