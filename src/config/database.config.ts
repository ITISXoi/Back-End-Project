import {ConnectionOptions} from 'typeorm';
import {
    Admin,
    Collection, CollectionLog,
    Config,
    CurrencyConfig,
    CurrencyToken, Image,
    KmsCmk,
    KmsDataKey,
    LatestBlock, Layer,
    MetaData,
    Nft, NftLog, NftOffchain,
    User,
    PremiumPackPrice,
    RoyaltyFee,
    SubscribePremiumPack
} from '../database/entities';
require('dotenv').config()

export const databaseConfig: ConnectionOptions = {
    type: (process.env.TYPEORM_CONNECTION || 'mysql') as any,
    host: process.env.TYPEORM_HOST || 'localhost',
    port: parseInt(process.env.TYPEORM_PORT) || 3306,
    username: process.env.TYPEORM_USERNAME || 'user',
    password: process.env.TYPEORM_PASSWORD || 'password',
    database: process.env.TYPEORM_DATABASE || 'db',
    entities: [
        CurrencyConfig,
        KmsCmk,
        KmsDataKey,
        User,
        Admin,
        LatestBlock,
        CurrencyToken,
        Layer,
        Image,
        Config,
        Collection,
        CollectionLog,
        Nft,
        NftOffchain,
        NftLog,
        MetaData,
        PremiumPackPrice,
        RoyaltyFee,
        SubscribePremiumPack
    ],
    synchronize: true,
};
