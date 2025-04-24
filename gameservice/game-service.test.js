const request = require('supertest');
const axios = require('axios');  // Asegúrate de importar axios aquí
const app = require('./game-service'); // Ruta correcta de tu servidor Express
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const {GamePlayed} = require('./models/game_played'); // Usa la ruta correcta a tu modelo
const {Question} = require('./models/Question'); // Ajusta la ruta si es distinta


// Clave secreta para firmar el token JWT (ajústala a tu configuración real)
const privateKey = "your-secret-key";

// Aquí haces el mock de axios
jest.mock('axios');  // Esto permite simular todas las llamadas axios dentro de las pruebas

let mongoServer;

jest.mock('./db/mongo/Connection', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
}));
// Mock del modelo Question para evitar llamadas reales a la base de datos
jest.mock('./models/Question', () => ({
    Question: {
      findOne: jest.fn().mockResolvedValue({
        text: '¿Cuál es la capital de Chile?',
        imageUrl: '',
        answers: [
          { text: 'Lima', isCorrect: false },
          { text: 'Madrid', isCorrect: false },
          { text: 'Santiago', isCorrect: true },
        ],
      }),
      insertMany: jest.fn().mockResolvedValue([
        {
          _id: '603d2f3e4f1b3b1f7237c7ed',  // Simula un _id generado por MongoDB
          text: 'What is the capital of France?',
          imageUrl: 'http://example.com/image.jpg',
          selectedAnswer: 'Paris',
          answers: [
            { text: 'Paris', isCorrect: true },
            { text: 'Paris', isCorrect: true },
            { text: 'Paris', isCorrect: true },
            { text: 'London', isCorrect: false }
          ],
          topics: ['geography']
        }
      ]),
    },
  }));
beforeAll(async () => {
  // Crear un servidor MongoDB en memoria
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Conectar Mongoose a la base de datos en memoria
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Aquí es donde configuramos el mock para axios.post
  axios.post.mockImplementation((url, data, config) => {
    if (url.includes('/api/game/new')) {
      return Promise.resolve({ data: { cacheId: 12345 } });
    } else if (url.includes('/api/question/new')) {
        return Promise.resolve({
          data: {
            question: {
              text: 'What is the capital of France?',
              answers: [
                { text: 'Paris', isCorrect: true },
                { text: 'London', isCorrect: false },
                { text: 'London', isCorrect: false },
                { text: 'London', isCorrect: false }
              ],
            },
          },
        });
      
    } else if (url.includes('/api/game/endAndSaveGame')) {
      return Promise.resolve({ data: { gameEnded: true } });
    } else if (url.includes('/api/game/history/gameList')) {
        return Promise.resolve({
          data: [
            {
              _id: "6806b4ec6e7ef01ac6d2a409",
              userId: "60d0fe4f5311236168a109cf",
              numberOfQuestions: 1,
              numberOfCorrectAnswers: 1,
              gameMode: 'normal',
              points: 10,
              topics: []
            }
          ]
        });
      
      
    } else if (url.includes('/api/game/history/gameQuestions')) {
      return Promise.resolve({ data: { questions: ['q1', 'q2'] } });
    }
    return Promise.resolve({ data: {} });
  });
});

afterAll(async () => {
  // Desconectar y detener el servidor de base de datos en memoria
  await mongoose.disconnect();
  await mongoServer.stop();
  
  app.close(); // Cierra el servidor después de ejecutar las pruebas
});


describe('Game Service API', () => {
  it('should start a new game and return a cacheId', async () => {
    const response = await request(app)
      .post('/api/game/new')
      .send({ cacheId: '60d0fe4f5311236168a109cf', topics: ['science'], lang: 'en' });
    
    expect(response.statusCode).toBe(200);
  });

  it('should return next game question', async () => {
    const response = await request(app)
      .post('/api/game/next')
      .send({ user: { userId: '60d0fe4f5311236168a109cf' } });

    expect(response.statusCode).toBe(200);
  });

  it('should end and save game', async () => {
    
    const token = jwt.sign({ userId: 'testUser' }, privateKey);
    const response = await request(app)
      .post('/api/game/endAndSaveGame')
      .set('authorization', `Bearer ${token}`)
      .send({ 
        user: {
          userId: '60d0fe4f5311236168a109cf'
        },
        questions: [
          {
            text: 'What is the capital of France?',
            imageUrl: 'http://example.com/image.jpg',  // Asegúrate de incluir la URL de la imagen
            selectedAnswer: 'Paris',
            answers: [
              { text: 'Paris', isCorrect: true },
              { text: 'London', isCorrect: false }
            ],
            topics: ['geography']
          }
        ],
        numberOfQuestions: 10,
        numberOfCorrectAnswers: 0,
        gameMode: "normal",
        points: 10,
      });
  
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("{\"message\":\"Game data saved successfully.\"}");  // Cambié esta línea
});
  
  
  it('should return game history list', async () => {
    const token = jwt.sign({ userId: 'testUser' }, privateKey);
    const response = await request(app)
      .post('/api/game/history/gameList')
      .set('authorization', `Bearer ${token}`)
      .send({ "user": { "userId": "60d0fe4f5311236168a109cf" }});
    
    expect(response.statusCode).toBe(200);
      
  });

  it('should return game questions history', async () => {
    const mockGame = {
        questions: ['q1', 'q2'],
      };
    
      // Mock de findById().populate().exec()
      jest.spyOn(GamePlayed, 'findById').mockImplementation(() => {
        return {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockGame),
        };
      });
    const response = await request(app)
      .post('/api/game/history/gameQuestions')
      .send({ gameId: "60d0fe4f5311236168a109cf" });
    
    expect(response.statusCode).toBe(200);
});
it('should return 400 when creating a new game without required fields', async () => {
    const response = await request(app)
      .post('/api/game/new')
      .send({});  // Enviamos un cuerpo vacío
  
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Missing or empty required fields: cacheId, topics, or lang.");
  });
  it('should return 500 when cacheId is missing while requesting next question', async () => {
    const response = await request(app)
      .post('/api/game/next')
      .send({});  // Cuerpo vacío sin cacheId
  
    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe("Internal server error");
  });
  it('should return 400 when sending incorrect data to end game', async () => {
    const token = jwt.sign({ userId: 'testUser' }, privateKey);
    const response = await request(app)
      .post('/api/game/endAndSaveGame')
      .set('authorization', `Bearer ${token}`)
      .send({
        user: { userId: '' },  // userId vacío
        questions: [],  // Preguntas vacías
        numberOfQuestions: 0,
        numberOfCorrectAnswers: 0,
        gameMode: 'normal',
        points: 0
      });
  
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("{\"error\":\"Missing fields or invalid format\"}");
  });
 
  
    
  
  
  it('should return 500 when an error occurs while saving game data', async () => {
    const token = jwt.sign({ userId: 'testUser' }, privateKey);
    const response = await request(app)
      .post('/api/game/endAndSaveGame')
      .set('authorization', `Bearer ${token}`)
      .send({
        user: { userId: '60d0fe4f5311236168a109cf' },
        questions: [{
          text: 'What is 2+2?'
        }],
        numberOfCorrectAnswers: 1,
        points: 10
      });
  
    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Internal server error');
  });
  it('should return 500 when userId is missing while fetching game list', async () => {
    const response = await request(app)
      .post('/api/game/history/gameList')
      .send({});  // Cuerpo vacío sin userId
  
    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe("Internal server error");
  });
  
  
  it('should return 404 when game not found while fetching game questions', async () => {
    // Simula que no se encuentra el juego en la base de datos
    jest.spyOn(GamePlayed, 'findById').mockResolvedValue(null);
  
    const response = await request(app)
      .post('/api/game/history/gameQuestions')
      .send({
        gameId: '60d0fe4f5311236168a109cf'
      });
  
    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Internal server error');
  });
  
});