import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
    constructor(
        @Inject('SUPABASE_CLIENT')
        private readonly supabase: SupabaseClient,
        private readonly usersService: UsersService,
    ) { }

    async create(createPostDto: CreatePostDto) {
        // Pastikan user yang dimaksud ada
        await this.usersService.findOne(createPostDto.userId);

        const { data, error } = await this.supabase
            .from('posts')
            .insert([
                {
                    title: createPostDto.title,
                    content: createPostDto.content,
                    user_id: createPostDto.userId, // pastikan kolom di DB sesuai
                },
            ])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async findAll() {
        const { data, error } = await this.supabase
            .from('posts')
            .select('*, users(*)')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

    async findByUserId(userId: number) {
        await this.usersService.findOne(userId);

        const { data, error } = await this.supabase
            .from('posts')
            .select('*, users(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

    async findOne(id: number) {
        const { data, error } = await this.supabase
            .from('posts')
            .select('*, users(*)')
            .eq('id', id)
            .maybeSingle();

        if (error) throw new Error(error.message);
        if (!data) throw new NotFoundException(`Post with ID ${id} not found`);
        return data;
    }

    async update(id: number, updatePostDto: UpdatePostDto) {
        const { data, error } = await this.supabase
            .from('posts')
            .update({
                title: updatePostDto.title,
                content: updatePostDto.content,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        if (!data) throw new NotFoundException(`Post with ID ${id} not found`);
        return data;
    }

    async remove(id: number): Promise<void> {
        const { error } = await this.supabase.from('posts').delete().eq('id', id);
        if (error) throw new Error(error.message);
    }
}