import {ApiProperty} from "@nestjs/swagger";
import {IsIn, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import {Causes} from "../../../config/exception/causes";

export class CreateLayerImages {
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
        type: Number,
        example: 0
    })
    @IsOptional()
    collectionId: number;


    @ApiProperty({
        type: Number,
        example: 0
    })
    @IsOptional()
    layerIndex: number;


    @ApiProperty({
        type: "string",
        format: "binary",
        required: false
    })
    @IsOptional()
    images: any;


    @ApiProperty({
        type: String,
        example: `[ {"name":"sss","description":"2","quantity":2,"price":3,"percent":33}, {"name":"sss","description":"2","quantity":2,"price":3,"percent":33}]`
    })
    @IsOptional()
    imagesDescription: string;


}


export class UpdateLayerImages {


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
        type: Number,
        example: 0
    })
    @IsOptional()
    collectionId: number;


    @ApiProperty({
        type: Number,
        example: 0
    })
    @IsOptional()
    layerIndex: number;


    @ApiProperty({
        type: "string",
        format: "binary",
        required: false
    })
    @IsOptional()
    images: any;


    @ApiProperty({
        type: String,
        example: `[ {"name":"sss","description":"2","quantity":2,"price":3,"percent":33}, {"name":"sss","description":"2","quantity":2,"price":3,"percent":33}]`
    })
    @IsOptional()
    imagesDescription: string;

    @ApiProperty({
        type: String,
        example: `[ {"id":1,"imageUrl";"XXXXXXXXXX","name":"sss","description":"2","quantity":2,"price":3,"percent":33}, {"id":1,"imageUrl";"XXXXXXXXXX","name":"sss","description":"2","quantity":2,"price":3,"percent":33}]`
    })
    @IsOptional()
    dataUpdate: string;
}