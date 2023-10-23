import {ApiProperty} from "@nestjs/swagger";
import {IsIn, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import {Causes} from "../../../config/exception/causes";
import {Transform} from "class-transformer";

export class UpdateCollection {
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
        example: 'ABC',
        required: false,
    })
    @IsString({message: JSON.stringify(Causes.COLLECTION_NAME_STRING)})
    @IsOptional()
    name: string;


    @ApiProperty({
        type: 'string',
        example: 'ABCXYZ'
    })
    @IsString({message: JSON.stringify(Causes.COLLECTION_NAME_STRING)})
    @IsOptional()
    symbol: string;


    @ApiProperty({
        type: 'string',
        example: 'GameTokenBurnable',
        required: false
    })
    @IsString({message: JSON.stringify(Causes.DESCRIPTION_STRING)})
    @IsOptional()
    description: string;

    @ApiProperty({
        type: Number,
        example: 'price',
        required: false,
    })
    @IsNumber({},{message: JSON.stringify(Causes.PRICE_NUMBER)})
    @IsOptional()
    @IsNotEmpty()
    @Transform(({value}) => Number(value))
    price: number;

    @ApiProperty({
        type: String,
        example: 'general || random || composite',
        required: false
    })
    @IsString({message: JSON.stringify(Causes.COLLECTION_TYPE_STRING)})
    @IsIn(['general', 'random', 'composite'])
    @IsNotEmpty()
    @IsOptional()
    type: string;

    @ApiProperty({
        type: Number,
        example: 123456789,
        required: false
    })
    @IsNumber({},{message: JSON.stringify(Causes.COLLECTION_START_MINT_TIME)})
    @Transform(({value}) => Number(value))
    @IsNotEmpty()
    @IsOptional()
    startMintTime: number;

    @ApiProperty({
        type: Number,
        example: 123456789,
        required: false
    })
    @IsNumber({},{message: JSON.stringify(Causes.COLLECTION_END_MINT_TIME)})
    @Transform(({value}) => Number(value))
    @IsNotEmpty()
    @IsOptional()
    endMintTime: number;

    @ApiProperty({
        type: String,
        example: 'totalNfts',
        required: false,
    })
    @IsNumber({},{message: JSON.stringify(Causes.TOTALNFTS)})
    @Transform(({value}) => Number(value))
    @IsOptional()
    totalNfts: number;


    @ApiProperty({
        type: String,
        example: 'numberLayers',
        required: false,
    })
    @IsNumber({},{message: JSON.stringify(Causes.NUMBER_LAYERS)})
    @Transform(({value}) => Number(value))
    @IsOptional()
    numberLayers: number;
}