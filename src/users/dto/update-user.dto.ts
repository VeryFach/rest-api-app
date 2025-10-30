import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    @MinLength(3)
    name?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    @MinLength(6)
    password?: string;
}