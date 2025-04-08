const request = require('supertest');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const app = require('./gateway-service');

const privateKey = "your-secret-key";

afterAll(async () => {
  app.close();
});

// Se simula axios.post para cada endpoint llamado por el Gateway
jest.mock('axios');

describe('Gateway Service', () => {
  beforeAll(() => {
    axios.post.mockImplementation((url, data, config) => {
      if (url.includes('/login')) {
        return Promise.resolve({ data: { token: 'mockedToken' } });
      } else if (url.includes('/adduser')) {
        return Promise.resolve({ data: { userId: 'mockedUserId' } });
      } else if (url.includes('/ask') && !url.includes('/askllm')) {
        return Promise.resolve({ data: { answer: 'llmanswer' } });
      } else if (url.includes('/api/question/generate')) {
        return Promise.resolve({ data: { question: 'generatedQuestion' } });
      } else if (url.includes('/editUser')) {
        return Promise.resolve({ data: { result: 'userEdited' } });
      } else if (url.includes('/api/connectMongo')) {
        return Promise.resolve({ data: { connected: true } });
      } else if (url.includes('/api/game/new')) {
        return Promise.resolve({ data: { gameStarted: true } });
      } else if (url.includes('/api/game/next')) {
        return Promise.resolve({ data: { question: 'nextQuestion' } });
      } else if (url.includes('/api/game/endAndSaveGame')) {
        return Promise.resolve({ data: { gameEnded: true } });
      } else if (url.includes('/api/game/history/gameList')) {
        return Promise.resolve({ data: { history: ['game1', 'game2'] } });
      } else if (url.includes('/api/game/history/gameQuestions')) {
        return Promise.resolve({ data: { questions: ['q1', 'q2'] } });
      } else if (url.includes('/askllm/clue')) {
        return Promise.resolve({ data: { answer: 'llmanswer' } });
      } else if (url.includes('/askllm/welcome')) {
        return Promise.resolve({ data: { answer: 'llmanswer' } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it('should return health status', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  it('should forward login request to auth service', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'testpassword' });
    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBe('mockedToken');
  });

  it('should forward question generation request to question service', async () => {
    const response = await request(app)
      .post('/api/question/new')
      .send({ someData: 'value' });
    expect(response.statusCode).toBe(200);
    expect(response.body.question).toBe('generatedQuestion');
  });

  it('should forward add user request to user service', async () => {
    const response = await request(app)
      .post('/adduser')
      .send({ username: 'newuser', password: 'newpassword' });
    expect(response.statusCode).toBe(200);
    expect(response.body.userId).toBe('mockedUserId');
  });

  it('should forward edit user request to user service with valid token', async () => {
    const token = jwt.sign({ userId: 'testUser' }, privateKey);
    const response = await request(app)
      .post('/api/user/editUser')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'edituser' });
    expect(response.statusCode).toBe(200);
    expect(response.body.result).toBe('userEdited');
  });

  it('should forward askllm request to the llm service', async () => {
    const response = await request(app)
      .post('/askllm')
      .send({ question: 'question', model: 'gemini' });
    expect(response.statusCode).toBe(200);
    expect(response.body.answer).toBe('llmanswer');
  });

  it('should forward askllm clue request to the llm service', async () => {
    const response = await request(app)
      .post('/askllm/clue')
      .send({ correctAnswer: 'answer', question: 'question', context: [], language: 'es' });
    expect(response.statusCode).toBe(200);
    expect(response.body.answer).toBe('llmanswer');
  });

  it('should forward askllm welcome request to the llm service', async () => {
    const response = await request(app)
      .post('/askllm/welcome')
      .send({ username: 'username', language: 'es' });
    expect(response.statusCode).toBe(200);
    expect(response.body.answer).toBe('llmanswer');
  });

  it('should start a new game and return a cacheId', async () => {
    const response = await request(app)
      .post('/api/game/new')
      .send({ someGameData: 'value' });
    expect(response.statusCode).toBe(200);
    expect(response.body.cacheId).toBeDefined();
    expect(typeof response.body.cacheId).toBe('number');
  });

  it('should return next game question', async () => {
    const response = await request(app)
      .post('/api/game/question')
      .send({ gameId: 'game1' });
    expect(response.statusCode).toBe(200);
    expect(response.body.question).toBe('nextQuestion');
  });

  it('should end and save game with valid token', async () => {
    const token = jwt.sign({ userId: 'testUser' }, privateKey);
    const response = await request(app)
      .post('/api/game/endAndSaveGame')
      .set('Authorization', `Bearer ${token}`)
      .send({ gameId: 'game1', score: 100 });
    expect(response.statusCode).toBe(200);
    expect(response.body.gameEnded).toBe(true);
  });

  it('should return game history list with valid token', async () => {
    const token = jwt.sign({ userId: 'testUser' }, privateKey);
    const response = await request(app)
      .get('/api/game/history/gameList')
      .set('Authorization', `Bearer ${token}`)
      .send({ gameId: 'game1' });
    expect(response.statusCode).toBe(200);
    expect(response.body.history).toEqual(['game1', 'game2']);
  });

  it('should return game questions history', async () => {
    const response = await request(app)
      .post('/api/game/history/gameQuestions')
      .send({ gameId: 'game1' });
    expect(response.statusCode).toBe(200);
    expect(response.body.questions).toEqual(['q1', 'q2']);
  });
});
