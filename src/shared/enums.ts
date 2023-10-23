import {join} from "path";

export enum HotWalletStatus {
    COMPLETED = "completed",
    FAILED = "failed",
}

export enum Currency {
    BIV = "biv",
    WBIV = "wbiv",
    ETH = "eth",
}

export enum WEBHOOK_TYPE {
    TRANSFER = "transfer",
    TXCHANGED = "tx_changed",
    COMMON = "common",
}

export enum TransactionType {
    DEPOSIT = "deposit",
    WITHDRAWAL_NORMAL = "withdrawal_normal",
    WITHDRAWAL_COLD = "withdrawal_cold",
    SEED = "seed",
    COLLECT = "collect",
    WITHDRAWAL_COLLECT = "withdrawal_collect",
}

export enum WithdrawalStatus {
    INVALID = "invalid",
    UNSIGNED = "unsigned",
    SIGNING = "signing",
    SIGNED = "signed",
    SENT = "sent",
    COMPLETED = "completed",
    FAILED = "failed",
}

export enum PendingWithdrawalStatus {
    UNSIGNED = "unsigned",
    SIGNING = "signing",
    SIGNED = "signed",
    SENT = "sent",
}

export enum WithdrawOutType {
    WITHDRAW_OUT_COLD_SUFFIX = "_cold_withdrawal",
    WITHDRAW_OUT_NORMAL = "normal",
    EXPLICIT_FROM_HOT_WALLET = "explicit_from_hot_wallet",
    EXPLICIT_FROM_DEPOSIT_ADDRESS = "explicit_from_deposit_address",
    AUTO_COLLECTED_FROM_DEPOSIT_ADDRESS = "auto_collected_from_deposit_address",
}

export enum WalletEvent {
    CREATED = "created",
    DEPOSIT = "deposit",
    WITHDRAW_REQUEST = "withdraw_request",
    WITHDRAW_COMPLETED = "withdraw_completed",
    WITHDRAW_FAILED = "withdraw_failed",
    WITHDRAW_FEE = "withdraw_fee",
    WITHDRAW_ACCEPTED = "withdraw_accepted",
    WITHDRAW_DECLINED = "withdraw_declined",
    COLLECT_FEE = "collect_fee",
    COLLECT_AMOUNT = "collect_amount",
    COLLECTED_FAIL = "collected_fail",
    COLLECTED = "collected",
    SEEDED_FAIL = "seeded_fail",
    SEEDED = "seeded",
    SEED_FEE = "seed_fee",
    SEED_AMOUNT = "seed_amount",
}

export enum CollectStatus {
    UNCOLLECTED = "uncollected",
    COLLECTING_FORWARDING = "forwarding",
    COLLECTING = "collecting",
    COLLECT_SIGNED = "collect_signed",
    COLLECT_SENT = "collect_sent",
    COLLECTED = "collected",
    NOTCOLLECT = "notcollect",
    SEED_REQUESTED = "seed_requested",
    SEEDING = "seeding",
    SEED_SIGNED = "seed_signed",
    SEED_SENT = "seed_sent",
    SEEDED = "seeded",
}

export enum HotWalletType {
    NORMAL = "normal",
    SEED = "seed",
}

export enum SortBy {
    UPDATED_AT = "updatedAt",
    AMOUNT = "amount",
}

export enum SortType {
    SortTypeASC = "asc",
    SortTypeDESC = "desc",
}

export enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    REQUEST = "request",
}

export enum UserType {
    WALLET = "wallet",
    EMAIL = "email",
}

export enum CollectionStatus {
    REQUEST = "request",
    LISTED = "listed",
    DELISTED = "delisted",
}

export enum CollectionType {
    GENERAL = "general",
    RANDOM = "random",
    COMPOSITE = "composite",
}

export enum CollectionSyncStatus {
    SYNCED = "synced",
    SYNCING = "syncing",
}

export enum NftStatus {
    LISTED = "listed",
    SALE = "sale",
    AUCTION = "auction",
    LOOTBOX = "lootbox",
    CENSORED = "censored",
}

export enum NftOffChainType {
    DRAFT= 'draft',
    CUSTOMIZED = 'customized',
    MINTED = 'minted',
}

export enum BannerStatus {
    ACTIVE = "active",
    INACTIVE = "in-active",
}

export enum OnchainStatus {
    CONFIRMING = "confirming",
    CONFIRMED = "confirmed",
}


export enum SubscribePremiumPackStatus {
    CONFIRMING = "confirming",
    CONFIRMED = "confirmed",
}

export enum ConfigObjectType {
    NFT = "nft",
    AUCTION = "auction",
    LOOTBOX = "lootbox",
}

export enum AuctionStatus {
    NEW = "new",
    INPROGRESS = "inprogress",
    END_SUCCESS = "end_success",
    END_NO_BID = "end_no_bid",
    CANCELED = "canceled",
    RE_CLAIMED = "reclaimed",
    CLAIMED = "claimed",
}

export enum LootBoxType {
    GENERAL = "general",
    WHITELISTED = "whitelisted",
}

export enum LootBoxStatus {
    ACTIVE = 1,
    CANCELED = 0,
}

export enum LootBoxDisplayStatus {
    DRAFT = 'draft',
    NEW = 'new',
    ACTIVE = 'active',
    CANCELED = 'canceled',
    EXPIRED = 'expired',
    OUT_OF_NFT = 'out_of_nft',
}

export enum AdminType {
    ADMIN = 1,
    PARTNERSHIP = 2,
}

export enum AdminStatus {
    ACTIVE = 1,
    FREEZED = 2,
}

export enum RarityNftOnchainStatus {
    SYNCED = 1,
    NOT_SYNCED = 0,
}

export const TOKEN_PATH = join(process.cwd(), 'ipfs');