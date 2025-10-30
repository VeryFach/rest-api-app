import { IsString, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class UpdatePostDto {
    @IsString()
    @IsOptional()
    @MinLength(3)
    title?: string;

    @IsString()
    @IsOptional()
    @MinLength(10)
    content?: string;

    @IsBoolean()
    @IsOptional()
    published?: boolean;
}