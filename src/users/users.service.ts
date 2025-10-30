import {
    Injectable,
    NotFoundException,
    ConflictException,
    Inject,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class UsersService {
        constructor(
        @Inject('SUPABASE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }
    
    async findByEmail(email: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !data) return null;
        return data;
    }

    async create(createUserDto: CreateUserDto): Promise<User | null> {
        const { data: existingUser, error: findError } = await this.supabase
            .from('users')
            .select('*')
            .eq('email', createUserDto.email)
            .maybeSingle();

        if (findError) throw new Error(findError.message);
        if (existingUser) throw new ConflictException('Email already exists');

        const { data, error } = await this.supabase
            .from('users')
            .insert([createUserDto])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.sanitizeUser(data);
    }

    async findAll(): Promise<(User | null)[]> {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data.map((user) => this.sanitizeUser(user));
    }

    async findOne(id: number): Promise<User | null> {
        const { data, error } = await this.supabase
            .from('users')
            .select('*, posts(*)')
            .eq('id', id)
            .maybeSingle();

        if (error) throw new Error(error.message);
        if (!data) throw new NotFoundException(`User with ID ${id} not found`);

        return this.sanitizeUser(data);
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
        const { data: user, error: findError } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (findError) throw new Error(findError.message);
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);

        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const { data: existingUser } = await this.supabase
                .from('users')
                .select('id')
                .eq('email', updateUserDto.email)
                .maybeSingle();

            if (existingUser) throw new ConflictException('Email already exists');
        }

        const { data, error } = await this.supabase
            .from('users')
            .update(updateUserDto)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.sanitizeUser(data);
    }

    async remove(id: number): Promise<void> {
        const { data, error } = await this.supabase
            .from('users')
            .delete()
            .eq('id', id)
            .select()
            .maybeSingle();

        if (error) throw new Error(error.message);
        if (!data) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }

    private sanitizeUser(user: User | null | undefined): User | null {
        if (!user) return null;
        const { password, ...safeUser } = user;
        return safeUser as User;
    }
}