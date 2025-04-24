const request = require('supertest');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const User = require('./user-model');

const correctUser = {
  username: 'testuser',
  password: 'Password123',
};

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  app = require('./user-service');
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  app.close();
  await mongoServer.stop();
});

describe('User Service', () => {
  it('should add a new user on POST /adduser', async () => {
    const response = await request(app).post('/adduser').send(correctUser);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', 'testuser');

    // Check if the user is inserted into the database
    const userInDb = await User.findOne({ username: 'testuser' });

    // Assert that the user exists in the database
    expect(userInDb).not.toBeNull();
    expect(userInDb.username).toBe('testuser');

    // Assert that the password is encrypted
    const isPasswordValid = await bcrypt.compare('Password123', userInDb.password);
    expect(isPasswordValid).toBe(true);
  });

  it('should response with an error 400 because password is not secure on POST /adduser', async () => {
    const newUser = {
      username: 'testuser',
      password: 'password',
    };

    const response = await request(app).post('/adduser').send(newUser);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Password error content: password');
  });

  it('should response with an error 409 because username already exists on POST /adduser', async () => {
    // Same user with another password
    const existingUser = {
      username: 'testuser',
      password: 'Password12345',
    };
    await request(app).post('/adduser').send(correctUser); // Add the user first
    const response = await request(app).post('/adduser').send(existingUser); // Try to add the same user again
    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error', 'Username already exists');
  });

  it('should response with an error 400 because required fields are missing on POST /adduser', async () => {
    const newUser = {
      password: 'Password123',
    };
    const response = await request(app).post('/adduser').send(newUser);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Missing required field: username');
  });

  it('should change password on POST /editUser', async () => {    
    // Adds the user to the database
    const newUser = await request(app).post('/adduser').send(correctUser);
    const newUserId = newUser.body._id;

    const requestData = {
      currentPassword: correctUser.password,
      newPassword: 'NewPassword123',
      user: {
        userId: newUserId
      }
    }

    // Sends the request to edit the user
    const response = await request(app).post('/editUser').send(requestData);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  })

  it('should response with an error 400 because new password is not secure on POST /editUser', async () => {    
    // Adds the user to the database
    const newUser = await request(app).post('/adduser').send(correctUser);
    const newUserId = newUser.body._id;

    const requestData = {
      currentPassword: correctUser.password,
      newPassword: 'notsecurepassword',
      user: {
        userId: newUserId
      }
    }

    // Sends the request to edit the user
    const response = await request(app).post('/editUser').send(requestData);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Password error content: ', requestData.newPassword);
  })

  it('should response with an error 401 because current password does not match on POST /editUser', async () => {    
    // Adds the user to the database
    const newUser = await request(app).post('/adduser').send(correctUser);
    const newUserId = newUser.body._id;

    const requestData = {
      currentPassword: "notMatchingPassword",
      newPassword: 'NewPassword123',
      user: {
        userId: newUserId
      }
    }

    // Sends the request to edit the user
    const response = await request(app).post('/editUser').send(requestData);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Incorrect current password');
  })

  it('should response with an error 404 because the id is not from a user in db on POST /editUser', async () => {    

    const requestData = {
      currentPassword: "Password123",
      newPassword: 'NewPassword123',
      user: {
        userId: new ObjectId('123456789012345678901234') // This ID does not exist in the database
      }
    }

    // Sends the request to edit the user
    const response = await request(app).post('/editUser').send(requestData);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'User not found');
  })
});
