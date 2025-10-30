import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    Inject,
    InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { SupabaseClient } from '@supabase/supabase-js';

interface User {
    id: string;
    email: string;
    password?: string;
    [key: string]: any;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
    ) { }

    async register(registerDto: RegisterDto) {
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new ConflictException('Email is already registered');
        }

        try {
            const user = await this.usersService.create({
                ...registerDto,
                password: hashedPassword,
            });

            if (!user) {
                throw new InternalServerErrorException('User creation failed');
            }

            const payload = { email: user.email, sub: user.id };
            const access_token = this.jwtService.sign(payload);

            return {
                user,
                access_token,
            };
        } catch (error) {
            console.error('Register error:', error);
            throw new InternalServerErrorException('Failed to register user');
        }
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password ?? '');
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: user.email, sub: user.id };
        const access_token = this.jwtService.sign(payload);

        const { password, ...result } = user;

        return {
            user: result,
            access_token,
        };
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.usersService.findByEmail(email);

        if (user && user.password && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }

        return null;
    }
}
