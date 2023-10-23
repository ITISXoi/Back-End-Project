import {ApiProperty} from "@nestjs/swagger";
import {IsIn, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString} from "class-validator";
import {Causes} from "../../../config/exception/causes";
import {Transform} from "class-transformer";
export class Create {
    @ApiProperty({
        type: Number,
        example: 0
    })
    @IsNotEmpty({message: JSON.stringify(Causes.COLLECTION_ID_EMPTY)})
    collectionId: number;

    @ApiProperty({
        type: String,
        example: 0
    })
    @IsNotEmpty({message: JSON.stringify(Causes.CHAIN_ID_EMPTY)})
    chainId: string;

    @ApiProperty({
        type: String,
        example: [1, 2, 3]
    })
    @IsNotEmpty({each: true})
    imageIds: number[];

    @ApiProperty({
        type: String,
        example: 'name'
    })
    @IsString()
    @IsOptional()
    name: string;

    @ApiProperty({
        type: String,
        example: 'description',
        required: false,
    })
    @IsOptional()
    @IsString()
    description: string;


    @ApiProperty({
        type: String,
        example: 'note',
        required: false,
    })
    @IsOptional()
    @IsString()
    note: string;


    @ApiProperty({
        type: String,
        example: 'draft',
        required: false,
    })
    @IsOptional()
    @IsString()
    type: string;


    @ApiProperty({
        type: String,
        example: 1
    })
    @IsNumber({},{message: JSON.stringify(Causes.PRICE_NUMBER)})
    @Transform(({value}) => {
        return Number(value)
    })
    price: number;


    @ApiProperty({
        type: String,
        example: 1
    })
    @IsNumber({},{message: JSON.stringify(Causes.NEXT_TOKEN_ID_NUMBER)})
    @Transform(({value}) => {
        return Number(value)
    })
    @IsNotEmpty()
    nextTokenId: number;
 
    @ApiProperty({
        type: String,
        example: 'wallet'
    })
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    wallet: string;

    @ApiProperty({
        type: "string",
        format: "binary",
        required: false
    })
    @IsOptional()
    images: any;
}