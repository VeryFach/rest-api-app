import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('PostsModule (e2e)', () => {
    let app: INestApplication;
    let authToken: string;
    let postId: number;
    let userId: number;

    const userPayload = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );
        await app.init();

        // Login untuk mendapatkan token
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: userPayload.email,
                password: userPayload.password,
            })
            .expect(200);

        authToken = loginResponse.body?.data?.access_token || loginResponse.body?.access_token;

        // Dapatkan userId dari profile endpoint
        const profileRes = await request(app.getHttpServer())
            .get('/auth/profile')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        userId = profileRes.body.data.id;
    });

    afterAll(async () => {
        if (app) await app.close();
    });

    it('/posts (POST) → should create a post', async () => {
        const newPost = {
            title: 'Test Post Title',
            content: 'This is test post content',
            userId: userId,
        };

        const res = await request(app.getHttpServer())
            .post('/posts')
            .set('Authorization', `Bearer ${authToken}`)
            .send(newPost)
            .expect(201);

        expect(res.body).toHaveProperty('message', 'Post created successfully');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('title', newPost.title);
        expect(res.body.data).toHaveProperty('content', newPost.content);
        postId = res.body.data.id;
    });

    it('/posts (GET) → should get all posts', async () => {
        const res = await request(app.getHttpServer())
            .get('/posts')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(res.body).toHaveProperty('message', 'Posts retrieved successfully');
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('/posts?userId= (GET) → should get posts by userId', async () => {
        const res = await request(app.getHttpServer())
            .get(`/posts?userId=${userId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(res.body).toHaveProperty('message', 'Posts retrieved successfully');
        expect(Array.isArray(res.body.data)).toBe(true);
        if (res.body.data.length > 0) {
            expect(res.body.data[0]).toHaveProperty('user_id', userId);
        }
    });

    it('/posts/:id (GET) → should get post by id', async () => {
        const res = await request(app.getHttpServer())
            .get(`/posts/${postId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(res.body).toHaveProperty('message', 'Post retrieved successfully');
        expect(res.body.data.id).toBe(postId);
    });

    it('/posts/:id (PATCH) → should update post', async () => {
        const update = { 
            title: 'Updated Post Title', 
            content: 'Updated post content' 
        };

        const res = await request(app.getHttpServer())
            .patch(`/posts/${postId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(update)
            .expect(200);

        expect(res.body).toHaveProperty('message', 'Post updated successfully');
        expect(res.body.data.title).toBe(update.title);
        expect(res.body.data.content).toBe(update.content);
    });

    it('/posts/:id (DELETE) → should delete post', async () => {
        // Buat post baru untuk dihapus
        const postToDelete = {
            title: 'Post To Delete',
            content: 'This post will be deleted',
            userId: userId,
        };

        const createRes = await request(app.getHttpServer())
            .post('/posts')
            .set('Authorization', `Bearer ${authToken}`)
            .send(postToDelete)
            .expect(201);

        const deletePostId = createRes.body.data.id;

        const res = await request(app.getHttpServer())
            .delete(`/posts/${deletePostId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(res.body).toHaveProperty('message', 'Post deleted successfully');
    });
});