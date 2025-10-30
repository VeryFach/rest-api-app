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
    create(@Body() createPostDto: CreatePostDto) {
        return {
            message: 'Post created successfully',
            data: this.postsService.create(createPostDto)
        };
    }

    @Get()
    findAll(@Query('userId', ParseIntPipe) userId?: number) {
        const data = userId
            ? this.postsService.findByUserId(userId)
            : this.postsService.findAll();

        return {
            message: 'Posts retrieved successfully',
            data
        };
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return {
            message: 'Post retrieved successfully',
            data: this.postsService.findOne(id)
        };
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePostDto: UpdatePostDto
    ) {
        return {
            message: 'Post updated successfully',
            data: this.postsService.update(id, updatePostDto)
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    remove(@Param('id', ParseIntPipe) id: number) {
        this.postsService.remove(id);
        return {
            message: 'Post deleted successfully'
        };
    }
}