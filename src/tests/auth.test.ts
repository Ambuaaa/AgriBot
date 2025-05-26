import request from 'supertest';
import { app } from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Authentication Flow', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'Test@123456',
    name: 'Test User'
  };

  let authToken: string;

  beforeAll(async () => {
    // Clean up test user if exists
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
    await prisma.$disconnect();
  });

  describe('Registration', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should not register with existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      authToken = res.body.token;
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Protected Routes', () => {
    it('should access protected route with token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should not access protected route without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Password Reset', () => {
    let resetToken: string;

    it('should request password reset', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Get reset token from database for testing
      const user = await prisma.user.findUnique({
        where: { email: testUser.email }
      });
      resetToken = user?.resetToken || '';
    });

    it('should reset password with valid token', async () => {
      const newPassword = 'NewTest@123456';
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Try logging in with new password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: newPassword
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
    });
  });
}); 