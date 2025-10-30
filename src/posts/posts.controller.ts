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
    HttpStatus,
    Query
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createPostDto: CreatePostDto) {
        const data = await this.postsService.create(createPostDto);
        return {
            message: 'Post created successfully',
            data
        };
    }

    @Get()
    async findAll(@Query('userId') userId?: string) {
        const data = userId
            ? await this.postsService.findByUserId(parseInt(userId))
            : await this.postsService.findAll();

        return {
            message: 'Posts retrieved successfully',
            data
        };
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.postsService.findOne(id);
        return {
            message: 'Post retrieved successfully',
            data
        };
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePostDto: UpdatePostDto
    ) {
        const data = await this.postsService.update(id, updatePostDto);
        return {
            message: 'Post updated successfully',
            data
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.postsService.remove(id);
        return {
            message: 'Post deleted successfully'
        };
    }
}