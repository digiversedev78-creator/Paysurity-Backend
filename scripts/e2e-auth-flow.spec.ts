import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid'; // Required for generating unique identifiers for test emails

// Assuming the PaySurity application is running on localhost:3000 during E2E tests.
// This URL should ideally be configurable via environment variables in a real CI/CD setup.
const app = 'http://localhost:3000';

describe('Auth Flow E2E', () => {
  let token: string;
  let userEmail: string;
  const userPassword = 'password123';
  const userFirstName = 'Test';
  const userLastName = 'User';

  beforeAll(() => {
    // Generate a unique email for each test run.
    // This prevents conflicts if tests are run against a persistent database
    // that isn't completely reset between test suite executions.
    userEmail = `testuser_${uuidv4()}@example.com`;
  });

  it('POST /auth/register creates user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: userEmail,
        password: userPassword,
        firstName: userFirstName,
        lastName: userLastName,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toBeDefined();
    // Assert that the API returns key details of the newly created user
    expect(res.body.id).toBeDefined();
    expect(res.body.email).toEqual(userEmail);
    expect(res.body.firstName).toEqual(userFirstName);
    expect(res.body.lastName).toEqual(userLastName);
    // Ensure sensitive information like password is not returned
    expect(res.body.password).toBeUndefined();
  });

  it('POST /auth/login returns JWT', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: userEmail,
        password: userPassword,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeDefined();
    expect(res.body.accessToken).toBeDefined();
    expect(typeof res.body.accessToken).toBe('string');
    // Store the obtained JWT for subsequent authenticated requests
    token = res.body.accessToken;
  });

  it('GET /auth/me returns user from token', async () => {
    // Ensure that a token has been successfully acquired from the login step
    expect(token).toBeDefined();

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`); // Attach the JWT to the Authorization header

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeDefined();
    // Verify that the user details returned by /auth/me match the registered user
    expect(res.body.id).toBeDefined();
    expect(res.body.email).toEqual(userEmail);
    expect(res.body.firstName).toEqual(userFirstName);
    expect(res.body.lastName).toEqual(userLastName);
    // Again, ensure no password or other sensitive data is exposed
    expect(res.body.password).toBeUndefined();
  });

  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeDefined();
    expect(res.body.status).toBe('ok');
  });
});