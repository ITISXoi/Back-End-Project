import {ApiProperty} from "@nestjs/swagger";
import {IsIn, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import {Causes} from "../../../config/exception/causes";
import {Transform} from "class-transformer";
export class UpdateOffchain {
    @ApiProperty({
        type: String,
        example: [1, 2, 3],
        required: false
    })
    @IsOptional()
    imageIds: number[];

    @ApiProperty({
        type: String,
        example: 'name',
        required: false
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
        example: 1,
        required: false
    })
    @IsNumber({},{message: JSON.stringify(Causes.PRICE_NUMBER)})
    @Transform(({value}) => Number(value))
    price: number;

    @ApiProperty({
        type: "string",
        format: "binary",
        required: false
    })
    @IsOptional()
    images: any;
}