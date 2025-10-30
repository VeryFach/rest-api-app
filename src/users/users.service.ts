import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    private users: User[] = [];
    private currentId = 1;

    create(createUserDto: CreateUserDto): User {
        const existingUser = this.users.find(u => u.email === createUserDto.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const user: User = {
            id: this.currentId++,
            ...createUserDto,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.users.push(user);
        return this.sanitizeUser(user);
    }

    findAll(): User[] {
        return this.users.map(user => this.sanitizeUser(user));
    }

    findOne(id: number): User {
        const user = this.users.find(u => u.id === id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return this.sanitizeUser(user);
    }

    update(id: number, updateUserDto: UpdateUserDto): User {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        if (updateUserDto.email) {
            const existingUser = this.users.find(u => u.email === updateUserDto.email && u.id !== id);
            if (existingUser) {
                throw new ConflictException('Email already exists');
            }
        }

        this.users[userIndex] = {
            ...this.users[userIndex],
            ...updateUserDto,
            updatedAt: new Date(),
        };

        return this.sanitizeUser(this.users[userIndex]);
    }

    remove(id: number): void {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        this.users.splice(userIndex, 1);
    }

    private sanitizeUser(user: User): User {
        const { password, ...result } = user;
        return result as User;
    }
}