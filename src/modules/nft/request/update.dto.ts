import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class Update {
    @ApiProperty({
        type: Number,
        example: 0
    })
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ApiProperty({
        type: String,
        example: 'payment token'
    })
    @IsString()
    paymentToken: string;

    @ApiProperty({
        type: Number,
        example: 0
    })
    price: number;
}