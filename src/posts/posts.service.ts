import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
    private posts: Post[] = [];
    private currentId = 1;

    constructor(private readonly usersService: UsersService) { }

    create(createPostDto: CreatePostDto): Post {
        // Validate user exists
        this.usersService.findOne(createPostDto.userId);

        const post: Post = {
            id: this.currentId++,
            ...createPostDto,
            published: createPostDto.published ?? false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.posts.push(post);
        return post;
    }

    findAll(): Post[] {
        return this.posts;
    }

    findByUserId(userId: number): Post[] {
        // Validate user exists
        this.usersService.findOne(userId);
        return this.posts.filter(post => post.userId === userId);
    }

    findOne(id: number): Post {
        const post = this.posts.find(p => p.id === id);
        if (!post) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }
        return post;
    }

    update(id: number, updatePostDto: UpdatePostDto): Post {
        const postIndex = this.posts.findIndex(p => p.id === id);
        if (postIndex === -1) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        this.posts[postIndex] = {
            ...this.posts[postIndex],
            ...updatePostDto,
            updatedAt: new Date(),
        };

        return this.posts[postIndex];
    }

    remove(id: number): void {
        const postIndex = this.posts.findIndex(p => p.id === id);
        if (postIndex === -1) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }
        this.posts.splice(postIndex, 1);
    }
}