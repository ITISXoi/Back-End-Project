import {ApiProperty} from "@nestjs/swagger";
import {IsIn, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import {Causes} from "../../../config/exception/causes";
import {Transform} from "class-transformer";

export class FileImageUploadRequest {
    @ApiProperty({
        type: 'string',
        example: 'ABC'
    })
    @IsString({message: JSON.stringify(Causes.COLLECTION_NAME_STRING)})
    @IsNotEmpty({message: JSON.stringify(Causes.COLLECTION_NAME_EMPTY)})
    name: string;

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
        type: 'number',
        example: 'GameTokenBurnable',
        required: false
    })
    @IsNumber()
    @IsNotEmpty()
    @Transform(({value}) => Number(value))
    quantity: number;

    @ApiProperty({
        type: "string",
        format: "binary",
        required: false
    })
    @IsOptional()
    image: any;
}



export class FileImageUploadS3Request {


    @ApiProperty({
        type: "string",
        format: "binary",
        required: false
    })
    @IsOptional()
    image: any;
}