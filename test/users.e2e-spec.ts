import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users (e2e)', () => {
    let app: INestApplication;
    let token: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        const login = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'testuser@example.com', password: 'password123' });

        token = login.body?.access_token;
    });

    afterAll(async () => {
        if (app) await app.close();
    });

    it('should get all users with valid token', async () => {
        const res = await request(app.getHttpServer())
            .get('/users')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
