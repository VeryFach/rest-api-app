import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersModule (e2e)', () => {
    let app: INestApplication;
    let userId: number;
    let authToken: string;

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

        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: userPayload.email,
                password: userPayload.password,
            })
            .expect(200);

        authToken = loginResponse.body?.data?.access_token || loginResponse.body?.access_token;

        const profileRes = await request(app.getHttpServer())
            .get('/auth/profile')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        userId = profileRes.body.data.id;
    });

    afterAll(async () => {
        if (app) await app.close();
    });

    it('/users (POST) → should create a user', async () => {
        const newUser = {
            name: 'New Test User',
            email: `newuser${Date.now()}@example.com`,
            password: 'password123',
        };

        const res = await request(app.getHttpServer())
            .post('/users')
            .set('Authorization', `Bearer ${authToken}`)
            .send(newUser)
            .expect(201);

        expect(res.body).toHaveProperty('message', 'User created successfully');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('email', newUser.email);
    });

    it('/users (GET) → should get all users', async () => {
        const res = await request(app.getHttpServer())
            .get('/users')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(res.body).toHaveProperty('message', 'Users retrieved successfully');
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('/users/:id (GET) → should get user by id', async () => {
        const res = await request(app.getHttpServer())
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(res.body).toHaveProperty('message', 'User retrieved successfully');
        expect(res.body.data.id).toBe(userId);
    });

    it('/users/:id (PATCH) → should update user', async () => {
        const update = { name: 'Updated User E2E' };

        const res = await request(app.getHttpServer())
            .patch(`/users/${userId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(update)
            .expect(200);

        expect(res.body).toHaveProperty('message', 'User updated successfully');
        expect(res.body.data.name).toBe(update.name);
    });

    it('/users/:id (DELETE) → should delete user', async () => {
        const userToDelete = {
            name: 'User To Delete',
            email: `delete${Date.now()}@example.com`,
            password: 'password123',
        };

        const createRes = await request(app.getHttpServer())
            .post('/users')
            .set('Authorization', `Bearer ${authToken}`)
            .send(userToDelete)
            .expect(201);

        const deleteUserId = createRes.body.data.id;

        const res = await request(app.getHttpServer())
            .delete(`/users/${deleteUserId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(res.body).toHaveProperty('message', 'User deleted successfully');
    });
});