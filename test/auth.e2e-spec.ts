import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthModule (e2e)', () => {
    let app: INestApplication;
    const user = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
    };
    let token: string;

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
        await app.close();
    });

    it('/auth/register (POST) → should register a new user', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/register')
            .send(user)
            .expect(201);

        expect(res.body).toHaveProperty('message', 'Registration successful');
        expect(res.body.data).toHaveProperty('access_token');
    });

    it('/auth/login (POST) → should login user and return JWT token', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: user.email,
                password: user.password,
            })
            .expect(200);

        expect(res.body).toHaveProperty('message', 'Login successful');
        expect(res.body.data).toHaveProperty('access_token');
        token = res.body.data.access_token;
    });

    it('/auth/profile (GET) → should reject without token', async () => {
        await request(app.getHttpServer())
            .get('/auth/profile')
            .expect(401);
    });

    it('/auth/profile (GET) → should access with valid token', async () => {
        const res = await request(app.getHttpServer())
            .get('/auth/profile')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body).toHaveProperty('message', 'Profile retrieved successfully');
        expect(res.body.data).toHaveProperty('email', user.email);
    });
});