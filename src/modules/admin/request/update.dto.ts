import { ApiProperty } from "@nestjs/swagger";
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    MaxLength,
    Matches,
    IsOptional,
    IsNumber,
    IsIn
} from "class-validator";
import {Causes} from "../../../config/exception/causes";
import {Transform} from "class-transformer";

export class UpdateAdmin {
    @ApiProperty({
        type: "string",
        format: "binary",
        required: false
    })
    @IsOptional()
    image: any;

    @ApiProperty({
        type: String,
        example: 'example@gmail.com'
    })
    @IsOptional()
    @IsEmail({},{message: JSON.stringify(Causes.EMAIL_INVALID)})
    @MaxLength(256, {message: JSON.stringify(Causes.EMAIL_TOO_LONG)})
    email: string;

    @ApiProperty({
        type: String,
        example: 'full_name'
    })
    @IsOptional()
    @IsString({message: JSON.stringify(Causes.FULL_NAME_STING)})
    @MinLength(4, {message: JSON.stringify(Causes.FULL_NAME_MIN_LENGTH)})
    @MaxLength(64, {message: JSON.stringify(Causes.FULL_NAME_MAX_LENGTH)})
    fullName: string;

    @ApiProperty({
        type: Number,
        example: 1
    })
    @IsOptional()
    @IsNumber({}, {message: JSON.stringify(Causes.TYPE_NUMBER)})
    @IsIn([1, 2], {message: JSON.stringify(Causes.TYPE_STRICT)})
    @Transform(({value}) => Number(value))
    type: number;
}


export class subscribePremiumPackData{
    // @ApiProperty({
    //     type: 'string',
    //     example: '200000000000000000',
    //     required: false
    // })
    // @IsNumber()
    // @IsNotEmpty()
    // @Transform(({value}) => Number(value))
    // price: number;


    // @ApiProperty({
    //     type: 'string',
    //     example: '1',
    //     required: false
    // })
    // @IsNumber()
    // @IsNotEmpty()
    // @Transform(({value}) => Number(value))
    // pack: number;


    @ApiProperty({
        type: 'string',
        example: '0x0bB31e84F420e7f33CEa3b4bA8e643163A3b4d18',
        required: false
    })
    @IsString()
    wallet: string;


}