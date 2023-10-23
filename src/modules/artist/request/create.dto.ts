import {ApiProperty} from "@nestjs/swagger";
import {IsOptional, IsString} from "class-validator";

export class Create {
    @ApiProperty({
        type: Number,
        example: 0
    })
    @IsOptional()
    collectionId: number;

    @ApiProperty({
        type: String,
        example: 'name'
    })
    @IsString()
    @IsOptional()
    name: string;


    @ApiProperty({
        type: String,
        example: 'description'
    })
    @IsOptional()
    @IsString()
    description: string;


    @ApiProperty({
        type: String,
        example: 'note'
    })
    @IsOptional()
    @IsString()
    note: string;


    @ApiProperty({
        type: String,
        example: '1, 2, 3',
        required: false
    })
    properties: string;
}