import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString, Matches, MaxLength, MinLength} from "class-validator";

export class SendMailResetPassword {
    @ApiProperty({
        type: String,
        example: 'email'
    })
    email: string;

}