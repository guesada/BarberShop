const request = require('supertest');
const app = require('../server');

describe('User Endpoints', () => {
  let authToken;
  let userId;

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123!',
        userType: 'cliente'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.name).toBe(userData.name);
      
      userId = response.body.data.id;
    });

    it('should not register user with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'TestPass123!',
        userType: 'cliente'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should not register user with weak password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test2@example.com',
        password: '123',
        userType: 'cliente'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should not register user with duplicate email', async () => {
      const userData = {
        name: 'Test User 2',
        email: 'test@example.com', // Email já usado no primeiro teste
        password: 'TestPass123!',
        userType: 'cliente'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('já cadastrado');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(loginData.email);
      
      authToken = response.body.data.token;
    });

    it('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('inválidas');
    });

    it('should not login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('inválidas');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id when authenticated', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('should not get user without authentication', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token');
    });

    it('should not get non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('não encontrado');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user successfully', async () => {
      const updateData = {
        name: 'Updated Test User',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('atualizado');
    });

    it('should not update user without authentication', async () => {
      const updateData = {
        name: 'Updated Test User',
        email: 'updated2@example.com'
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

describe('Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('funcionando');
    expect(response.body).toHaveProperty('timestamp');
  });
});

describe('API Info', () => {
  it('should return API information', async () => {
    const response = await request(app)
      .get('/api')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Elite Barber API');
    expect(response.body).toHaveProperty('endpoints');
    expect(response.body.endpoints).toHaveProperty('users');
    expect(response.body.endpoints).toHaveProperty('appointments');
    expect(response.body.endpoints).toHaveProperty('services');
  });
});
