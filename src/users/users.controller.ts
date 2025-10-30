import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createUserDto: CreateUserDto) {
        const data = await this.usersService.create(createUserDto);
        return {
            message: 'User created successfully',
            data
        };
    }

    @Get()
    async findAll() {
        const data = await this.usersService.findAll();
        return {
            message: 'Users retrieved successfully',
            data
        };
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.usersService.findOne(id);
        return {
            message: 'User retrieved successfully',
            data
        };
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto
    ) {
        const data = await this.usersService.update(id, updateUserDto);
        return {
            message: 'User updated successfully',
            data
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.usersService.remove(id);
        return {
            message: 'User deleted successfully'
        };
    }
}