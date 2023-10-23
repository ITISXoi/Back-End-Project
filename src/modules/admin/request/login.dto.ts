import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsNotEmpty} from 'class-validator';

export class LoginAdmin {
    @ApiProperty({
        type: String,
        example: 'tutheblue@gmail.com'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        type: String,
        example: 'Tu@theblue123'
    })
    @IsNotEmpty()
    password: string;
}