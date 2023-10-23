import {HttpStatus} from '@nestjs/common';
import {JsonException} from './exception.dto';

export class Causes {
    public static USER_DONT_HAVE_PERMISSION = new JsonException(
        "You don't have permission to access",
        HttpStatus.UNAUTHORIZED,
        'USER_DONT_HAVE_PERMISSION'
    );

    public static JWT_EXPIRED = new JsonException(
        'jwt expired',
        HttpStatus.UNAUTHORIZED,
        'JWT_EXPIRED'
    );

    public static INTERNAL_ERROR = new JsonException(
        'Server internal error',
        HttpStatus.INTERNAL_SERVER_ERROR,
        'INTERNAL_ERROR'
    );
    public static EMAIL_OR_PASSWORD_INVALID = new JsonException(
        'Email or Password is invalid',
        HttpStatus.UNAUTHORIZED,
        'EMAIL_OR_PASSWORD_INVALID'
    );
    public static NON_RECORDED_USERNAME = new JsonException(
        'This user is not registered, please register.',
        HttpStatus.UNAUTHORIZED,
        'NON_RECORDED_USERNAME'
    );
    public static USER_IN_BLACKLIST = new JsonException(
        'Your account has been locked. Please contact email support.verdant@gmail.com for inquiries!',
        HttpStatus.BAD_REQUEST,
        'USER_IN_BLACKLIST'
    );
    public static ADMIN_IS_NOT_ACTIVE = new JsonException(
        'Your account has been locked!',
        HttpStatus.BAD_REQUEST,
        'ADMIN_IS_NOT_ACTIVE'
    );
    public static TWOFA_INVALID = new JsonException(
        'TwoFactorAuthentication code is invalid',
        HttpStatus.BAD_REQUEST,
        'TWOFA_INVALID'
    );
    public static EMAIL_CODE_INVALID = new JsonException(
        'Email code is invalid',
        HttpStatus.BAD_REQUEST,
        'EMAIL_CODE_INVALID'
    );

    public static CODE_RESET_PASS_INVALID = new JsonException(
        'Code to reset password invalid',
        HttpStatus.BAD_REQUEST,
        'CODE_RESET_PASS_INVALID'
    );

    public static USER_DOES_NOT_EXIST_WITH_THIS_EMAIL = new JsonException(
        'User does not exist with this email',
        HttpStatus.BAD_REQUEST,
        'USER_DOES_NOT_EXIST_WITH_THIS_EMAIL')

    public static DUPLICATED_EMAIL_OR_USERNAME = new JsonException(
        'Email or username or Wallet was registered',
        HttpStatus.CONFLICT,
        'DUPLICATED_EMAIL_OR_USERNAME'
    );
    public static DUPLICATED_EMAIL = new JsonException(
        'This email already registered, please check',
        HttpStatus.CONFLICT,
        'DUPLICATED_EMAIL'
    );
    public static DUPLICATED_USERNAME = new JsonException(
        'This username already in use, please use other username',
        HttpStatus.CONFLICT,
        'DUPLICATED_USERNAME'
    );
    public static DUPLICATED_WALLET = new JsonException(
        'This wallet was registered, please check',
        HttpStatus.CONFLICT,
        'DUPLICATED_WALLET'
    );
    public static DUPLICATED_COMMISSION = new JsonException(
        'Commission already exist',
        HttpStatus.CONFLICT,
        'DUPLICATED_COMMISSION'
    );
    public static DUPLICATED_ACCOUNT = new JsonException(
        'Email or username or wallet was registered',
        HttpStatus.CONFLICT,
        'DUPLICATED_ACCOUNT'
    );

    public static DUPLICATED_CLIENT_ID = new JsonException(
        'Client id exists',
        HttpStatus.CONFLICT,
        'DUPLICATED_CLIENT_ID'
    );

    public static ERROR_SSO = new JsonException(
        'Some error happen is sso server',
        HttpStatus.CONFLICT,
        'ERROR_SSO'
    );

    public static ERROR_S3 = new JsonException(
        'Some error happen with s3',
        HttpStatus.BAD_REQUEST,
        'ERROR_S3'
    );

    public static ERROR_IPFS = new JsonException(
        'Some error happen with ipfs',
        HttpStatus.BAD_REQUEST,
        'ERROR_IPFS'
    );


    public static ERROR_DATA_NFTS = new JsonException(
        `The same nft can't be minted`,
        HttpStatus.BAD_REQUEST,
        'ERROR_DATA_NFTS'
    );

    public static ERROR_DATA_DRAFT_NFTS = new JsonException(
        `The same draft or customized nft can't be created`,
        HttpStatus.BAD_REQUEST,
        'ERROR_DATA_DRAFT_NFTS'
    );

    public static NFT_OFFCHAIN_DOES_NOT_EXIST = new JsonException(
        `Nft offchain does not exist`,
        HttpStatus.BAD_REQUEST,
        'NFT_OFFCHAIN_DOES_NOT_EXIST'
    );

    public static NFT_CREATE_FAILED = new JsonException(
        `Failed to create NFT`,
        HttpStatus.BAD_REQUEST,
        'NFT_CREATE_FAILED'
    );

    public static NFT_OFFCHAIN_CREATE_FAILED = new JsonException(
        `Failed to create NFT offchain`,
        HttpStatus.BAD_REQUEST,
        'NFT_OFFCHAIN_CREATE_FAILED'
    );

    public static NFT_OFFCHAIN_UPDATE_FAILED = new JsonException(
        `Failed to update NFT offchain`,
        HttpStatus.BAD_REQUEST,
        'NFT_OFFCHAIN_UPDATE_FAILED'
    );

    public static NFT_DOES_NOT_EXIST = new JsonException(
        `Nft does not exist`,
        HttpStatus.BAD_REQUEST,
        'NFT_DOES_NOT_EXIST'
    );

    public static INVALID_SIGNATURE_WALLET = new JsonException(
        'Signature is not valid',
        HttpStatus.CONFLICT,
        'INVALID_SIGNATURE_WALLET'
    );
    public static NOT_ACCESS_CREATE_USER = new JsonException(
        'You cant access create new user',
        HttpStatus.CONFLICT,
        'NOT_ACCESS_CREATE_USER'
    );
    public static USER_NOT_ACCESS = new JsonException(
        'You can not access',
        HttpStatus.UNAUTHORIZED,
        'USER_NOT_ACCESS'
    );

    public static COLLECTION_CREATE_FAILED = new JsonException(
        "Failed to create Collection",
        HttpStatus.BAD_REQUEST,
        "COLLECTION_CREATE_FAILED"
    );

    public static COLLECTION_UPDATE_FAILED = new JsonException(
        "Failed to update Collection",
        HttpStatus.BAD_REQUEST,
        "COLLECTION_UPDATE_FAILED"
    );

    public static LAYER_CREATE_FAILED = new JsonException(
        "Failed to create layer",
        HttpStatus.BAD_REQUEST,
        "LAYER_CREATE_FAILED"
    );

    public static LAYER_UPDATE_FAILED = new JsonException(
        "Failed to create layer",
        HttpStatus.BAD_REQUEST,
        "LAYER_UPDATE_FAILED"
    );

    public static IMAGE_CREATE_FAILED = new JsonException(
        "Failed to create image",
        HttpStatus.BAD_REQUEST,
        "IMAGE_CREATE_FAILED"
    );

    public static TOKEN_INVALID = new JsonException(
        'Token invalid',
        HttpStatus.UNAUTHORIZED,
        'TOKEN_INVALID'
    );
    public static IPAGINATION_OPTIONS_INVALID = new JsonException(
        'Page and limit have to greater than 0.',
        HttpStatus.BAD_REQUEST,
        'IPAGINATION_OPTIONS_INVALID'
    );
    public static QUERY_OPTIONS_INVALID = new JsonException(
        'Query options is not valid',
        HttpStatus.BAD_REQUEST,
        'QUERY_OPTIONS_INVALID'
    );
    public static CURRENCY_INVALID = new JsonException(
        'Currency is not valid in system',
        HttpStatus.BAD_REQUEST,
        'CURRENCY_INVALID'
    );

    public static DATA_INVALID = new JsonException(
        'Data is not valid in system',
        HttpStatus.BAD_REQUEST,
        'DATA_INVALID'
    );

    public static IMAGE_IDS_IS_EMPTY = new JsonException(
        'Image ids is empty',
        HttpStatus.BAD_REQUEST,
        'IMAGE_IDS_IS_EMPTY'
    );

    public static IMAGE_IDS_FORMAT_IS_INVALID = new JsonException(
        'Image ids format is invalid',
        HttpStatus.BAD_REQUEST,
        'IMAGE_IDS_FORMAT_IS_INVALID'
    );

    public static IMAGE_IS_NOT_ENOUGH = ((id) => new JsonException(
        `Image with ${id} does not have any copies`,
        HttpStatus.BAD_REQUEST,
        'DATA_INVALID'
    ));

    public static PASSWORD_IS_FALSE = new JsonException(
        "The password you entered didn't match our record",
        HttpStatus.BAD_REQUEST,
        'PASSWORD_IS_FALSE'
    );

    public static NO_CHANGE_PASS = new JsonException(
        "Password can't be changed because the account is registered with Metamask wallet account",
        HttpStatus.BAD_REQUEST,
        'NO_CHANGE_PASS'
    );

    public static NO_USER_BY_WALLET = new JsonException(
        "Can't find account by wallet",
        HttpStatus.BAD_REQUEST,
        'NO_USER_BY_WALLET'
    );

    public static USER_IS_BLACKLIST = new JsonException(
        "This account has been added to the blacklist before",
        HttpStatus.BAD_REQUEST,
        'USER_IS_BLACKLIST'
    );

    public static DATA_DUPLICATE = new JsonException(
        'Data cannot be the same as the old Data',
        HttpStatus.BAD_REQUEST,
        'DATA_DUPLICATE'
    );

    public static FILE_SIZE_OVER = new JsonException(
        'Upload file size exceeds the allowed limit',
        HttpStatus.BAD_REQUEST,
        'FILE_SIZE_OVER'
    );

    public static FILE_TYPE_INVALID = new JsonException(
        'File type upload invalid',
        HttpStatus.BAD_REQUEST,
        'FILE_TYPE_INVALID'
    );

    public static PHONE_INVALID = new JsonException(
        'Phone is not valid',
        HttpStatus.BAD_REQUEST,
        'PHONE_INVALID'
    );

    public static DUPLICATE_PASSWORD = new JsonException(
        'The new password cannot be the same as the old password',
        HttpStatus.BAD_REQUEST,
        'DUPLICATE_PASSWORD'
    );

    public static DUPLICATE_SECRET = new JsonException(
        'The new client secret cannot be the same as the old client secret',
        HttpStatus.BAD_REQUEST,
        'DUPLICATE_SECRET'
    );


    public static UPDATE_PASSWORD_FAIL = new JsonException(
        'Update password failed',
        HttpStatus.BAD_REQUEST,
        'UPDATE_PASSWORD_FAIL'
    );

    public static USER_ERROR = new JsonException(
        "User does not exist or User has been't activated",
        HttpStatus.BAD_REQUEST,
        'USER_ERROR'
    );

    public static CURRENCY_INIT_FAIL = new JsonException(
        'Currency init process was failed',
        HttpStatus.BAD_REQUEST,
        'CURRENCY_INIT_FAIL'
    );
    /**
     * address
     */
    public static ADDRESS_NOT_FOUND = new JsonException('Address not found', HttpStatus.NOT_FOUND, 'ADDRESS_NOT_FOUND');
    public static ADDRESS_NOT_BELONG_TO_WALLET = new JsonException(
        'Address does not belong to wallet',
        HttpStatus.BAD_REQUEST,
        'ADDRESS_NOT_BELONG_TO_WALLET'
    );
    public static CREATE_ADDRESS_FAILED = new JsonException(
        'Create address failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
        'CREATE_ADDRESS_FAILED'
    );
    public static ENCRYPT_PRIVATE_KEY_ERROR = new JsonException(
        'Encrypted private key invalid',
        HttpStatus.INTERNAL_SERVER_ERROR,
        'ENCRYPT_PRIVATE_KEY_ERROR'
    );
    public static ADDRESS_INSIDE_SYSTEM = new JsonException(
        'Address is inside the system',
        HttpStatus.BAD_REQUEST,
        'ADDRESS_INSIDE_SYSTEM'
    );
    public static ADDRESS_INVALID = new JsonException('Address invalid', HttpStatus.BAD_REQUEST, 'ADDRESS_INVALID');
    public static ADDRESS_NEED_MEMO = new JsonException(
        'Memo is required for the address',
        HttpStatus.BAD_REQUEST,
        'ADDRESS_NEED_MEMO'
    );

    /**
     * wallet
     */
    public static WALLET_NOT_FOUND = new JsonException('Wallet not found', HttpStatus.NOT_FOUND, 'WALLET_NOT_FOUND');
    public static MISMATCH_WALLET_COIN_TYPE = new JsonException(
        'msg_coin_type_incorrect',
        HttpStatus.BAD_REQUEST,
        'MISMATCH_WALLET_COIN_TYPE'
    );
    public static WALLET_WITH_CURRENCY_EXISTED = new JsonException(
        'Wallet with currency existed',
        HttpStatus.BAD_REQUEST,
        'WALLET_WITH_CURRENCY_EXISTED'
    );
    public static WALLET_WITH_CURRENCY_NOT_CREATED = new JsonException(
        'Wallet with currency was not created',
        HttpStatus.BAD_REQUEST,
        'WALLET_WITH_CURRENCY_NOT_CREATED'
    );
    /**
     * hot wallet
     */
    public static HOT_WALLET_NOT_FOUND = new JsonException(
        'Hot wallet not found',
        HttpStatus.NOT_FOUND, 'HOT_WALLET_NOT_FOUND',
    );
    public static HOT_WALLET_EXISTED = new JsonException(
        'Hot wallet of user existed',
        HttpStatus.BAD_REQUEST,
        'HOT_WALLET_EXISTED'
    );
    public static HOT_WALLET_TYPE_INVALID = new JsonException(
        'Hot wallet type is not invalid',
        HttpStatus.BAD_REQUEST,
        'HOT_WALLET_TYPE_INVALID'
    );
    public static LOWER_THRESHOLD_MUST_BE_GREATER_THAN_0 = new JsonException(
        'Lower threshold must be greater than 0',
        HttpStatus.BAD_REQUEST,
        'LOWER_THRESHOLD_MUST_BE_GREATER_THAN_0'
    );
    public static LOWER_THRESHOLD_MUST_BE_LESS_THAN_UPPER_MIDDLE = new JsonException(
        'Lower threshold must be less than upper threshold and middle threshold',
        HttpStatus.BAD_REQUEST,
        'LOWER_THRESHOLD_MUST_BE_LESS_THAN_UPPER_MIDDLE'
    );
    public static MIDDLE_THRESHOLD_MUST_BE_LESS_THAN_UPPER = new JsonException(
        'Middle threshold must be less than upper threshold',
        HttpStatus.BAD_REQUEST,
        'MIDDLE_THRESHOLD_MUST_BE_LESS_THAN_UPPER'
    );
    /**
     * kms
     **/
    public static KMS_DATA_KEY_NOT_FOUND = new JsonException(
        'msg_kms_data_key_not_found',
        HttpStatus.NOT_FOUND, 'KMS_DATA_KEY_NOT_FOUND',
    );
    public static KMS_CMK_NOT_FOUND = new JsonException(
        'msg_kms_cmk_not_found',
        HttpStatus.NOT_FOUND, 'KMS_CMK_NOT_FOUND',
    );
    public static KMS_CMK_INVALID = new JsonException(
        'msg_kms_cmk_invalid',
        HttpStatus.INTERNAL_SERVER_ERROR,
        'KMS_CMK_INVALID'
    );
    public static ONLY_SUPPORT_STRING = new JsonException(
        'msg_only_support_encrypt_string',
        HttpStatus.BAD_REQUEST,
        'ONLY_SUPPORT_STRING'
    );

    /**
     * blockchain
     */
    public static GET_BALANCE_FAIL = new JsonException(
        'Get balance fail',
        HttpStatus.INTERNAL_SERVER_ERROR,
        'GET_BALANCE_FAIL'
    );

    /**
     * deposit
     */
    public static DEPOSIT_AMOUNT_GREATER_THAN_BALANCE = new JsonException(
        'Deposit amount is greater than address balance',
        HttpStatus.BAD_REQUEST,
        'DEPOSIT_AMOUNT_GREATER_THAN_BALANCE'
    );
    public static DEPOSIT_NOT_FOUND = new JsonException('Deposit not found', HttpStatus.NOT_FOUND, 'DEPOSIT_NOT_FOUND');
    public static LOCAL_TX_NOT_INSERTED_AFTER_COLLECTING = new JsonException(
        'Local tx not inserted after collecting',
        HttpStatus.INTERNAL_SERVER_ERROR,
        'LOCAL_TX_NOT_INSERTED_AFTER_COLLECTING'
    );

    /**
     * withdrawals
     */
    public static WITHDRAW_FROM_INTERNAL_ADDRESS = new JsonException(
        'Cannot withdraw to an address inside the system',
        HttpStatus.BAD_REQUEST,
        'WITHDRAW_FROM_INTERNAL_ADDRESS'
    );
    public static WALLET_BALANCE_NOT_FOUND_COIN = new JsonException(
        'Wallet balance not found, hot wallet need platform coin to send token.',
        HttpStatus.NOT_FOUND, 'WALLET_BALANCE_NOT_FOUND_COIN',
    );
    public static WITHDRAWAL_AMOUNT_MUST_GREATER_THAN_ZERO = new JsonException(
        'Withdrawal amount must greater than 0',
        HttpStatus.BAD_REQUEST,
        'WITHDRAWAL_AMOUNT_MUST_GREATER_THAN_ZERO'
    );

    public static MISSING_PARAMS_WHEN_GENERATING_SIGNATURE = new JsonException(
        'Missing params when generating signature',
        HttpStatus.BAD_REQUEST,
        'MISSING_PARAMS_WHEN_GENERATING_SIGNATURE'
    );

    /**
     * webhook
     **/
    public static WEBHOOK_NOT_FOUND = new JsonException('Webhook not found.', HttpStatus.NOT_FOUND, 'WEBHOOK_NOT_FOUND');
    public static WEBHOOK_ALREADY_EXIST = new JsonException(
        'Webhook already exist.',
        HttpStatus.BAD_REQUEST,
        'WEBHOOK_ALREADY_EXIST'
    );
    public static CURRENCY_NOT_SUPPORT = new JsonException(
        'Currency not support',
        HttpStatus.BAD_REQUEST,
        'CURRENCY_NOT_SUPPORT'
    );
    public static METHOD_NOT_SUPPORT = new JsonException(
        'Method not support',
        HttpStatus.BAD_REQUEST,
        'METHOD_NOT_SUPPORT'
    );

    public static COLLECTION_NAME_EXISTS = new JsonException(
        'Collection name exists, please use another name',
        HttpStatus.BAD_REQUEST,
        'COLLECTION_NAME_EXISTS'
    );

    public static COLLECTION_ID_EMPTY = new JsonException(
        'Collection id can not be empty',
        HttpStatus.BAD_REQUEST,
        'COLLECTION_ID_EMPTY'
    )

    public static COLLECTION_NOT_EXISTS = new JsonException(
        'Collection does not exist',
        HttpStatus.BAD_REQUEST,
        'COLLECTION_NOT_EXISTS'
    );

    public static COLLECTION_START_END_TIME_INVALID = new JsonException(
        'It\'s not on mint time, cann\'t create NFT',
        HttpStatus.BAD_REQUEST,
        'COLLECTION_START_END_TIME_INVALID'
    );

    public static COLLECTION_CONTAINS_NO_LAYER = new JsonException(
        'Collection contains no layer',
        HttpStatus.BAD_REQUEST,
        'COLLECTION_CONTAINS_NO_LAYER'
    )

    public static LAYER_NOT_EXISTS = new JsonException(
        'Layer does not exist',
        HttpStatus.BAD_REQUEST,
        'LAYER_NOT_EXISTS'
    );

    public static LAYER_HAS_MINTED_NFT = new JsonException(
        'Layer has at least one minted nft',
        HttpStatus.BAD_REQUEST,
        'LAYER_HAS_MINTED_NFT'
    );

    public static COLLECTION_ADDRESS_EXISTS = new JsonException(
        'Collection address exists, please use another address',
        HttpStatus.BAD_REQUEST,
        'COLLECTION_ADDRESS_EXISTS');

    public static CHAIN_ID_NOT_EXISTS = new JsonException(
        'Chain id does not exists',
        HttpStatus.BAD_REQUEST,
        'CHAIN_ID_NOT_EXISTS');

    public static CANNOT_GENERATE_NEW_NFT = new JsonException(
        'Cannot generate new nft, sold out!!!',
        HttpStatus.BAD_REQUEST,
        'CANNOT_GENERATE_NEW_NFT');

    public static COLLECTION_END_MINT_TIME = new JsonException(
        "End mint time muse be a number",
        HttpStatus.BAD_REQUEST,
        'COLLECTION_END_MINT_TIME'
    );



    /** DTO */
        // USER MODULES
    public static USERNAME_STRING = {
        message: "Username must be string",
        error_code: "USERNAME_STRING",
    }

    public static USERNAME_EMPTY = {
        message: "Username must not be empty",
        error_code: "USERNAME_EMPTY",
    }

    public static USERNAME_MIN_LENGTH = {
        message: "Username too short, please use another user name (within 3 ~ 256 characters)",
        error_code: "USERNAME_MIN_LENGTH",
    }

    public static USERNAME_MAX_LENGTH = {
        message: "Username too long, please use another user name (within 3 ~ 256 characters)",
        error_code: "USERNAME_MAX_LENGTH",
    }

    public static USERNAME_MATCH_PATTERN = {
        message: "Username invalid",
        error_code: "USERNAME_MATCH_PATTERN",
    }

    public static EMAIL_EMPTY = {
        message: "Email must not be empty",
        error_code: "EMAIL_EMPTY",
    }

    public static EMAIL_INVALID = {
        message: "Please enter valid email address!",
        error_code: "EMAIL_INVALID",
    }

    public static EMAIL_TOO_SHORT = {
        message: "Email is too short, no shorter than 6 characters",
        error_code: "EMAIL_TOO_LONG",
    }

    public static EMAIL_TOO_LONG = {
        message: "Email is too long, no longer than 256 characters",
        error_code: "EMAIL_TOO_LONG",
    }

    public static PASSWORD_EMPTY = {
        message: "Password must not be empty",
        error_code: "PASSWORD_EMPTY",
    }

    public static PASSWORD_STRING = {
        message: "Password must not be a string",
        error_code: "PASSWORD_STRING",
    }

    public static PASSWORD_MIN_LENGTH = {
        message: "Password is too short, at least 8 characters",
        error_code: "PASSWORD_MIN_LENGTH",
    }

    public static PASSWORD_MAX_LENGTH = {
        message: "Password is too long, no longer then 20 characters",
        error_code: "PASSWORD_MAX_LENGTH",
    }

    public static PASSWORD_MATCH_PATTERN = {
        message: "Please follow the guideline to create your own password, at least: \n- 1 Capital letter \n- 1 Small case letter \n- 1 Symbol \n- Within 8 ~ 20 characters",
        error_code: "PASSWORD_MATCH_PATTERN"
    }

    public static WALLET_STRING = {
        message: "Wallet address must be a string",
        error_code: "WALLET_STRING"
    }

    public static WALLET_EMPTY = {
        message: "Wallet address must not be empty",
        error_code: "WALLET_EMPTY"
    }

    public static WALLET_MIN_LENGTH = {
        message: "Wallet address's length must be higher than 6 characters",
        error_code: "WALLET_MIN_LENGTH"
    }

    public static WALLET_MAX_LENGTH = {
        message: "Wallet address's length must be lower than 100 characters",
        error_code: "WALLET_MAX_LENGTH"
    }

    public static SIGNATURE_EMPTY = {
        message: "Signature must not be empty",
        error_code: "SIGNATURE_STRING"
    }

    public static SIGNATURE_STRING = {
        message: "Signature must be a string",
        error_code: "SIGNATURE_STRING"
    }

    public static SIGNATURE_MIN_LENGTH = {
        message: "Signature's length must be higher than 6 characters",
        error_code: "SIGNATURE_MIN_LENGTH"
    }

    public static SIGNATURE_MAX_LENGTH = {
        message: "Signature's length must be lower than 600 characters",
        error_code: "SIGNATURE_MAX_LENGTH"
    }

    public static REFRESH_TOKEN_STRING = {
        message: "Refresh token must be a string",
        error_code: "REFRESH_TOKEN_STRING"
    }

    public static CODE_STRING = {
        message: "Code must be a string",
        error_code: "CODE_STRING"
    }

    public static BIO_STRING = {
        message: "Bio must be a string",
        error_code: "BIO_STRING"
    }

    public static BIO_TOO_LONG = {
        message: "Bio is too long, no longer than 1000 characters",
        error_code: "BIO_TOO_LONG",
    }

    // ADMIN MODULES
    public static FULL_NAME_STING = {
        message: "Full name must be a string",
        error_code: "FULL_NAME_STING"
    }

    public static FULL_NAME_MIN_LENGTH = {
        message: "Full name is too short, at least 4 characters",
        error_code: "FULL_NAME_MIN_LENGTH",
    }

    public static FULL_NAME_MAX_LENGTH = {
        message: "Full name is too long, no longer then 64 characters",
        error_code: "FULL_NAME_MAX_LENGTH",
    }

    public static TYPE_NUMBER = {
        message: "Type must be a number",
        error_code: "TYPE_NUMBER"
    }

    public static TYPE_STRICT = {
        message: "Type must be 1 or 2",
        error_code: "TYPE_STRICT"
    }

    public static CLIENT_ID_STRING = {
        message: "Client id must be a string",
        error_code: "CLIENT_ID_STRING"
    }

    public static CLIENT_ID_MIN_LENGTH = {
        message: "Client id is too short, at least 3 characters",
        error_code: "CLIENT_ID_MIN_LENGTH",
    }

    public static CLIENT_ID_MAX_LENGTH = {
        message: "Client id is too long, no longer then 40 characters",
        error_code: "CLIENT_ID_MAX_LENGTH",
    }

    public static CLIENT_ID_MATCH_PATTERN = {
        message: "Client id too weak",
        error_code: "CLIENT_ID_MATCH_PATTERN",
    }

    public static CLIENT_SECRET_STRING = {
        message: "Client secret must be a string",
        error_code: "CLIENT_SECRET_STRING"
    }

    public static CLIENT_SECRET_MIN_LENGTH = {
        message: "Client secret is too short, at least 20 characters",
        error_code: "CLIENT_SECRET_MIN_LENGTH",
    }

    public static CLIENT_SECRET_MAX_LENGTH = {
        message: "Client secret is too long, no longer then 255 characters",
        error_code: "CLIENT_SECRET_MAX_LENGTH",
    }

    public static CLIENT_SECRET_MATCH_PATTERN = {
        message: "Client secret too weak",
        error_code: "CLIENT_SECRET_MATCH_PATTERN",
    }

    public static STATUS_EMPTY = {
        message: "Status must not be empty",
        error_code: "STATUS_EMPTY"
    }

    public static STATUS_NUMBER = {
        message: "Status must be a number",
        error_code: "STATUS_NUMBER"
    }

    public static STATUS_STRICT = {
        message: "Status must be 1 or 2",
        error_code: "STATUS_STRICT"
    }

    public static REASON_STRING = {
        message: "Reason must be a string",
        error_code: "REASON_STRING"
    }

    public static ADMIN_STATUS_STRING = {
        message: "Status must be a string",
        error_code: "ADMIN_STATUS_STRING"
    }

    public static ADMIN_STATUS_STRICT = {
        message: "Status must be active or inactive",
        error_code: "ADMIN_STATUS_STRICT"
    }

    // COLLECTION MODULE
    public static COLLECTION_NAME_STRING = {
        message: "Collection name must be a string",
        error_code: "COLLECTION_NAME_STRING"
    }

    public static COLLECTION_NAME_EMPTY = {
        message: "Collection name must not be empty",
        error_code: "COLLECTION_NAME_EMPTY"
    }

    
    public static COLLECTION_SYMBOL_STRING = {
        message: "Collection symbol must be a string",
        error_code: "COLLECTION_NAME_STRING"
    }

    public static COLLECTION_SYMBOL_EMPTY = {
        message: "Collection symbol must not be empty",
        error_code: "COLLECTION_NAME_EMPTY"
    }

    public static COLLECTION_ADDRESS_EMPTY = {
        message: "Collection address must not be empty",
        error_code: "COLLECTION_ADDRESS_EMPTY"
    }

    public static COLLECTION_ADDRESS_STRING = {
        message: "Collection address must be a string",
        error_code: "COLLECTION_ADDRESS_STRING"
    }

    public static CHAIN_ID_STRING = {
        message: "Chain id must be a string",
        error_code: "CHAIN_ID_STRING"
    }

    public static CHAIN_ID_EMPTY = {
        message: "Chain id must not be empty",
        error_code: "CHAIN_ID_EMPTY"
    }

    public static COLLECTION_TYPE_STRING = {
        message: "Collection type must be a string",
        error_code: "COLLECTION_TYPE_STRING"
    }

    public static COLLECTION_TYPE_EMPTY = {
        message: "Collection type must not be empty",
        error_code: "COLLECTION_TYPE_EMPTY"
    }

    public static COLLECTION_STATUS_EMPTY = {
        message: "Collection status must not be empty",
        error_code: "COLLECTION_STATUS_EMPTY"
    }

    public static COLLECTION_STATUS_STRING = {
        message: "Collection status must be a string",
        error_code: "COLLECTION_STATUS_STRING"
    }

    public static COLLECTION_STATUS_STRICT = {
        message: "Collection status must be request or listed",
        error_code: "COLLECTION_STATUS_STRICT"
    }

    public static COLLECTION_UPDATE_STATUS_STRICT = {
        message: "Collection status must be delisted or listed",
        error_code: "COLLECTION_UPDATE_STATUS_STRICT"
    }

    public static INVALID_CODE_NAME = {
        message: "Invalid code name , please use another code name (within 3 ~ 20 characters)",
        error_code: "INVALID_CODE_NAME"
    }

    public static INVALID_NUMBER = {
        message: "Please input valid number",
        error_code: "INVALID_NUMBER"
    }

    public static QUESTION_EMPTY = {
        message: "Do you have any question",
        error_code: "QUESTION_EMPTY"
    }

    public static ANSWER_EMPTY = {
        message: "Do you have any answer",
        error_code: "ANSWER_EMPTY"
    }

    public static OBJECT_TYPE_EMPTY = {
        message: "Object type must not be empty",
        error_code: "OBJECT_TYPE_EMPTY"
    }

    public static OBJECT_TYPE_MAX_LENGTH = {
        message: "Object type is too long, no longer then 10 characters",
        error_code: "OBJECT_TYPE_MAX_LENGTH",
    }

    public static OBJECT_TYPE_STRING = {
        message: "Object type must be a string",
        error_code: "OBJECT_TYPE_STRING"
    }

    public static OBJECT_TYPE_INVALID = {
        message: "Object type must be either nft, auction or lootbox",
        error_code: "OBJECT_TYPE_INVALID"
    }

    public static OBJECT_IDS_ARRAY = {
        message: "Object ids must be an array",
        error_code: "OBJECT_IDS_ARRAY"
    }

    public static DESCRIPTION_EMPTY = {
        message: "Description must not be empty",
        error_code: "DESCRIPTION_EMPTY"
    }

    public static PAYMENT_TOKEN_STRING = {
        message: "Payment token must be a string",
        error_code: "PAYMENT_TOKEN_STRING"
    }


    public static PRICE_NUMBER = {
        message: "Price must be a number",
        error_code: "PRICE_NUMBER"
    }


    public static NEXT_TOKEN_ID_NUMBER = {
        message: "Next token id must be a number",
        error_code: "NEXT_TOKEN_ID_NUMBER"
    }


    public static NUMBER_LAYERS = {
        message: "numberLayers muse be a number",
        error_code: "NUMBER_LAYERS"
    }


    public static TOTALNFTS = {
        message: "totalNfts muse be a number",
        error_code: "TOTALNFTS_STRING"
    }

    public static COLLECTION_START_MINT_TIME = {
        message: "Start mint time muse be a number",
        error_code: "COLLECTION_START_MINT_TIME"
    }

    public static DESCRIPTION_STRING = {
        message: "Description must be a string",
        error_code: "DESCRIPTION_STRING"
    }

    public static DESCRIPTION_MAX_LENGTH = {
        message: "Description is too long, no longer then 200 characters",
        error_code: "DESCRIPTION_MAX_LENGTH",
    }

}
