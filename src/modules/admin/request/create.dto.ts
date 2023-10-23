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

export class CreateAdmin {
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
    @IsNotEmpty({message: JSON.stringify(Causes.EMAIL_EMPTY)})
    @IsEmail({},{message: JSON.stringify(Causes.EMAIL_INVALID)})
    @MaxLength(256, {message: JSON.stringify(Causes.EMAIL_TOO_LONG)})
    email: string;


    @ApiProperty({
        type: String,
        example: 'full_name'
    })
    @IsString({message: JSON.stringify(Causes.FULL_NAME_STING)})
    @MinLength(4, {message: JSON.stringify(Causes.FULL_NAME_MIN_LENGTH)})
    @MaxLength(64, {message: JSON.stringify(Causes.FULL_NAME_MAX_LENGTH)})
    fullName: string;

    @ApiProperty({
        type: Number,
        example: 1
    })
    @IsNumber({}, {message: JSON.stringify(Causes.TYPE_NUMBER)})
    @IsIn([1, 2], {message: JSON.stringify(Causes.TYPE_STRICT)})
    @Transform(({value}) => Number(value))
    type: number;

    @ApiProperty({
        type: String,
        example: 'password'
    })
    @IsNotEmpty({message: JSON.stringify(Causes.PASSWORD_EMPTY)})
    @IsString({message: JSON.stringify(Causes.PASSWORD_STRING)})
    @MinLength(8, {message: JSON.stringify(Causes.PASSWORD_MIN_LENGTH)})
    @MaxLength(20, {message: JSON.stringify(Causes.PASSWORD_MAX_LENGTH)})
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: JSON.stringify(Causes.PASSWORD_MATCH_PATTERN)})
    password: string;
}