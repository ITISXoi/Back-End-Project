import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Admin, CurrencyConfig, CurrencyToken} from "../../database/entities";
import {Repository} from "typeorm";
import {IAdmin} from "../../database/interfaces/IAdmin.interface";
import * as argon2 from "argon2";
import {ICurrencyConfigInterface} from "../../database/interfaces/ICurrencyConfig.interface";
import {ICurrencyTokenInterface} from "../../database/interfaces/ICurrencyToken.interface";

@Injectable()
export class SeedService {
    constructor(
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,

        @InjectRepository(CurrencyToken)
        private readonly currencyTokenRepository: Repository<CurrencyToken>,

        @InjectRepository(CurrencyConfig)
        private readonly currencyConfigRepository: Repository<CurrencyConfig>,
    ) {
    }

    async createOne(admin: IAdmin): Promise<any> {
        const hashedPassword = await argon2.hash(admin.password);

        admin = {...admin, password: hashedPassword};
        return this.adminRepository.save(admin);
    }

    async createCurrencyConfigs (currencyConfigs: ICurrencyConfigInterface[]){
        await this.currencyConfigRepository.save(currencyConfigs);
    }

    async createCurrencyTokens (currencyTokens: ICurrencyTokenInterface[]){
        await this.currencyTokenRepository.save(currencyTokens);
    }
}