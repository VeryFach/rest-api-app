import { IsString, IsNotEmpty, IsInt, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    content: string;

    @IsInt()
    @IsNotEmpty()
    userId: number;

    @IsBoolean()
    @IsOptional()
    published?: boolean = false;
}