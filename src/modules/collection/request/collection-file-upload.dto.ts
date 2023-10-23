import { FileUploadBaseRequest } from '../../../shared/Request/fileUploadBase.dto';
import { ApiProperty } from '@nestjs/swagger';
import {IsIn, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import {Causes} from "../../../config/exception/causes";
import {Transform} from "class-transformer";

export class FileCollectionUploadRequest extends FileUploadBaseRequest {
    @ApiProperty({
        type: 'string',
        example: 'ABC'
    })
    @IsString({message: JSON.stringify(Causes.COLLECTION_NAME_STRING)})
    @IsNotEmpty({message: JSON.stringify(Causes.COLLECTION_NAME_EMPTY)})
    name: string;

    @ApiProperty({
        type: 'string',
        example: 'ABCXYZ'
    })
    @IsString({message: JSON.stringify(Causes.COLLECTION_NAME_STRING)})
    @IsNotEmpty({message: JSON.stringify(Causes.COLLECTION_NAME_EMPTY)})
    @IsOptional()
    symbol: string;

    @ApiProperty({
        type: Number,
        example: 'price',
        required: false,
    })
    @IsNumber({},{message: JSON.stringify(Causes.PRICE_NUMBER)})
    @IsNotEmpty()
    @IsOptional()
    @Transform(({value}) => Number(value))
    price: number;

    @ApiProperty({
        type: String,
        example: 'general || random || composite',
    })
    @IsString({message: JSON.stringify(Causes.COLLECTION_TYPE_STRING)})
    @IsIn(['general', 'random', 'composite'])
    @IsOptional()
    @IsNotEmpty()
    type: string;

    @ApiProperty({
        type: Number,
        example: 123456789,
        required: false
    })
    @IsNumber({},{message: JSON.stringify(Causes.COLLECTION_START_MINT_TIME)})
    @Transform(({value}) => Number(value))
    @IsOptional()
    @IsNotEmpty()
    startMintTime: number;

    @ApiProperty({
        type: Number,
        example: 123456789,
        required: false
    })
    @IsNumber({},{message: JSON.stringify(Causes.COLLECTION_END_MINT_TIME)})
    @Transform(({value}) => Number(value))
    @IsOptional()
    @IsNotEmpty()
    endMintTime: number;

    @ApiProperty({
        type: 'string',
        example: 'GameTokenBurnable',
        required: false
    })
    @IsString({message: JSON.stringify(Causes.DESCRIPTION_STRING)})
    @IsNotEmpty({message: JSON.stringify(Causes.DESCRIPTION_EMPTY)})
    @IsOptional()
    description: string;

    @ApiProperty({
        type: 'string',
        example: '0x400EBf02D1DA76Ee500b368Ce8B5305761b51D33',
        required: false
    })
    @IsString({message: JSON.stringify(Causes.COLLECTION_ADDRESS_STRING)})
    @IsOptional()
    address: string;

    @ApiProperty({
        type: 'string',
        example: '80001'
    })
    @IsString({message: JSON.stringify(Causes.CHAIN_ID_STRING)})
    @IsNotEmpty({message: JSON.stringify(Causes.CHAIN_ID_EMPTY)})
    @IsOptional()
    chainId: string;

    @ApiProperty({
        type: String,
        example: 'payment token'
    })
    @IsString({message: JSON.stringify(Causes.PAYMENT_TOKEN_STRING)})
    @IsOptional()
    paymentToken: string;
 
    @ApiProperty({
        type: String,
        example: 'totalNfts',
        required: false
    })
    @IsNumber({},{message: JSON.stringify(Causes.TOTALNFTS)})
    @Transform(({value}) => Number(value))
    @IsOptional()
    totalNfts: number;

    @ApiProperty({
        type: String,
        example: 'numberLayers',
        required: false
    })
    @IsNumber({},{message: JSON.stringify(Causes.NUMBER_LAYERS)})
    @Transform(({value}) => Number(value))
    @IsOptional()
    numberLayers: number;

    @ApiProperty({
        type: "string",
        format: "binary",
        required: false
    })
    @IsOptional()
    image: any;

    @ApiProperty({
        type: "string",
        format: "binary",
        required: false
    })
    @IsOptional()
    banner: any;

    
    @ApiProperty({
        type: 'string',
        example: 'MATIC',
        required: false
    })
    @IsOptional()
    currency: string;
}