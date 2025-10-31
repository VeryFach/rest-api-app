import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Posts (e2e)', () => {
    let app: INestApplication;
    let userId: number;
    let postId: number;
    const user = {
        name: 'Post E2E User',
        email: `post-e2e-${Date.now()}@example.com`,
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
    });

    afterAll(async () => {
        if (app) await app.close();
    });

    it('/auth/register (POST) → should register a user', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/register')
            .send(user)
            .expect(201);

        expect(res.body).toHaveProperty('message', 'Registration successful');
        expect(res.body.data).toHaveProperty('access_token');
        expect(res.body.data).toHaveProperty('user');
        // user id may come as string or number depending on DB/provider
        userId = Number(res.body.data.user.id);
        expect(Number.isFinite(userId)).toBe(true);
    });

    it('/posts (POST) → should create a post for the user', async () => {
        const payload = {
            title: 'E2E Test Post',
            content: 'This is the content for the E2E test post. It has enough length.',
            userId,
        };

        const res = await request(app.getHttpServer())
            .post('/posts')
            .send(payload)
            .expect(201);

        expect(res.body).toHaveProperty('message', 'Post created successfully');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('title', payload.title);
        postId = Number(res.body.data.id);
        expect(Number.isFinite(postId)).toBe(true);
    });

    it('/posts (GET) → should retrieve all posts', async () => {
        const res = await request(app.getHttpServer()).get('/posts').expect(200);

        expect(res.body).toHaveProperty('message', 'Posts retrieved successfully');
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('/posts?userId= (GET) → should retrieve posts for the user', async () => {
        const res = await request(app.getHttpServer())
            .get('/posts')
            .query({ userId })
            .expect(200);

        expect(res.body).toHaveProperty('message', 'Posts retrieved successfully');
        expect(Array.isArray(res.body.data)).toBe(true);
        // if posts exist for the user, at least one should belong to that user
        if (res.body.data.length > 0) {
            const belongs = res.body.data.some((p: any) => Number(p.user_id ?? p.user?.id ?? p.user_id) === userId || Number(p.user?.id) === userId);
            // one of the posts should belong to the created user (best-effort check)
            expect(belongs).toBe(true);
        }
    });

    it('/posts/:id (GET) → should retrieve a single post by id', async () => {
        const res = await request(app.getHttpServer()).get(`/posts/${postId}`).expect(200);

        expect(res.body).toHaveProperty('message', 'Post retrieved successfully');
        expect(res.body).toHaveProperty('data');
        expect(Number(res.body.data.id)).toBe(postId);
    });

    it('/posts/:id (PATCH) → should update the post', async () => {
        const payload = { title: 'Updated E2E Title', content: 'Updated content for the post.' };
        const res = await request(app.getHttpServer()).patch(`/posts/${postId}`).send(payload).expect(200);

        expect(res.body).toHaveProperty('message', 'Post updated successfully');
        expect(res.body.data).toHaveProperty('title', payload.title);
    });

    it('/posts/:id (DELETE) → should delete the post', async () => {
        const res = await request(app.getHttpServer()).delete(`/posts/${postId}`).expect(200);
        expect(res.body).toHaveProperty('message', 'Post deleted successfully');
    });
});
