import { ApiProperty } from "@nestjs/swagger";
import {IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength} from 'class-validator';
import {Causes} from "../../../config/exception/causes";

export class AdminResetPassword {

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