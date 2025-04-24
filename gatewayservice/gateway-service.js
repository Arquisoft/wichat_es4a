const express = require('express');
const axios = require('axios');
const cors = require('cors');
const promBundle = require('express-prom-bundle');

// OpenAPI-Swagger Libraries
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const YAML = require('yaml');

// JWT Authentication library
const jwt = require('jsonwebtoken');
const privateKey = "your-secret-key"; // Secret key for JWT verification

const app = express();
const port = 8000;

// URLs for microservices
const llmServiceUrl = process.env.LLM_SERVICE_URL || 'http://localhost:8003';
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:8002';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';
const gameServiceUrl = process.env.GAME_SERVICE_URL || 'http://localhost:8005';
const questionServiceUrl = process.env.QUESTION_SERVICE_URL || 'http://localhost:8004';

app.use(cors());
app.use(express.json());

// Prometheus metrics middleware
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

/**
 * Middleware to verify JWT token for authentication.
 * If the token is not provided, assigns a guest user. If the token is valid, decodes the user information and attaches it to the request body.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The callback function to move to the next middleware or route handler.
 */
const verifyToken = (req, res, next) => {
  if (!req.headers["authorization"]) {
    req.body.userId = "guest" + Date.now() ;
    next();
  } else {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token wasn't provided properly" });
    }
    jwt.verify(token, privateKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      console.log(decoded);
      req.body.userId = decoded.userId;
      next();
    });
  }
};

const generateCacheId = (req, res, next) => {
  const min = 10 ** 15; // Número mínimo de 16 dígitos
  const max = 10 ** 16 - 1; // Número máximo de 16 dígitos

  req.body.cacheId = Math.floor(Math.random() * (max - min + 1)) + min;
  next();
}


/**
 * Health check endpoint to verify if the service is running.
 *
 * @route {GET} /health
 * @returns {Object} 200 status with a message indicating the service is OK.
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/validateToken', async (req, res) => {
  try {
    const token = req.body.token;
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }
    jwt.verify(token, privateKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      res.status(200).json({ message: 'Token is valid', userId: decoded.userId });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint to handle user login by forwarding the request to the authentication service.
 *
 * @route {POST} /login
 * @param {Object} req.body - The login credentials provided by the user.
 * @returns {Object} The authentication response from the auth service.
 */
app.post('/login', async (req, res) => {
  try {
    const authResponse = await axios.post(authServiceUrl + '/login', req.body);
    res.json(authResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

/**
 * Endpoint to generate a new question, forwarding the request to the question service.
 *
 * @route {POST} /api/question/new
 * @param {Object} req.body - The data required to generate a new question.
 * @returns {Object} The generated question from the question service.
 */
app.post('/api/question/new', async (req, res) => {
  try {

    const endResponse = await axios.post(`${questionServiceUrl}/api/question/generate`, req.body);
    res.json(endResponse.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Error generating question',
      details: error.response?.data || {}
    });
  }
});

/**
 * Endpoint to add a new user by forwarding the request to the user service.
 *
 * @route {POST} /adduser
 * @param {Object} req.body - The data required to create a new user.
 * @returns {Object} The response from the user service.
 */
app.post('/adduser', async (req, res) => {
  try {
    const userResponse = await axios.post(userServiceUrl + '/adduser', req.body);
    res.json(userResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

/**
 * Endpoint to edit an existing user's details.
 * Requires JWT token verification for user authentication.
 *
 * @route {POST} /api/user/editUser
 * @param {Object} req.body - The data required to update the user's details.
 * @param {Object} req.body.userId - The authenticated user's information.
 * @returns {Object} The response from the user service.
 */
app.post('/api/user/editUser', verifyToken, async (req, res) => {
  try {
    const editResponse = await axios.post(userServiceUrl + '/editUser', req.body);
    res.json(editResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

/**
 * Endpoint to start a new game by forwarding the request to the game service.
 *
 * @route {POST} /api/game/new
 * @param {Object} req.body - The data required to start a new game.
 * @returns {Object} The response from the game service, including a cache ID.
 */
app.post('/api/game/new', generateCacheId, async (req, res) => {
  try {

    await axios.post(`${gameServiceUrl}/api/game/new`, req.body);
    res.json({ cacheId: req.body.cacheId });
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error starting game' });
  }
});

/**
 * Endpoint to fetch the next question in the game.
 *
 * @route {POST} /api/game/question
 * @param {Object} req.body - The data required to retrieve the next question.
 * @returns {Object} The next question from the game service.
 */
app.post('/api/game/question', async (req, res) => {
  try {
    const questionResponse = await axios.post(`${gameServiceUrl}/api/game/next`, req.body);
    res.json(questionResponse.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error fetching question' });
  }
});

/**
 * Endpoint to end and save the game.
 * Requires JWT token verification for user authentication.
 *
 * @route {POST} /api/game/endAndSaveGame
 * @param {Object} req.body - The data required to end and save the game.
 * @param {Object} req.body.userId - The authenticated user's information.
 * @returns {Object} The response from the game service after ending and saving the game.
 */
app.post('/api/game/endAndSaveGame', verifyToken, async (req, res) => {
  try {
    if (!req.body.userId) {
      return res.status(401).json({ error: "Unauthorized: User ID is missing" });
    }

    const endResponse = await axios.post(`${gameServiceUrl}/api/game/endAndSaveGame`, req.body);

    res.json(endResponse.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error ending and saving game' });
  }
});


/**
 * Endpoint to fetch the history of games for the user.
 * Requires JWT token verification for user authentication.
 *
 * @route {GET} /api/game/history/gameList
 * @param {Object} req.body.user - The authenticated user’s information.
 * @returns {Object} The game history list from the game service.
 */
app.get('/api/game/history/gameList', verifyToken, async (req, res) => {
  try {
    // Verifica si req.body.userId tiene el userId
    if (!req.body.userId) {
      return res.status(401).json({ error: "Unauthorized: User ID is missing" });
    }

    const historyResponse = await axios.post(`${gameServiceUrl}/api/game/history/gameList`, req.body);
    res.json(historyResponse.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Internal server error" });
  }
});

/**
 * Endpoint to fetch the history of questions for a specific game.
 *
 * @route {POST} /api/game/history/gameQuestions
 * @param {Object} req.body - The data required to fetch game question history.
 * @returns {Object} The question history from the game service.
 */
app.post('/api/game/history/gameQuestions', async (req, res) => {
  try {
    const questionHistoryResponse = await axios.post(`${gameServiceUrl}/api/game/history/gameQuestions`, req.body);
    res.json(questionHistoryResponse.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: "Internal server error" });
  }
});

/**
 * Endpoint to get a clue from the LLM service based on the user’s question.
 *
 * @route {POST} /askllm/clue
 * @param {Object} req.body - The data required to get a clue from LLM.
 * @returns {Object} The clue generated by the LLM service.
 */
app.post('/askllm/clue', async (req, res) => {
  try {
    const llmResponse = await axios.post(llmServiceUrl + '/askllm/clue', req.body);
    res.json(llmResponse.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error generating clue' });
  }
});

/**
 * Endpoint to get a welcome message from the LLM service.
 *
 * @route {POST} /askllm/welcome
 * @param {Object} req.body - The data required to generate a welcome message.
 * @returns {Object} The welcome message generated by the LLM service.
 */
app.post('/askllm/welcome', async (req, res) => {
  try {
    const llmResponse = await axios.post(llmServiceUrl + '/askllm/welcome', req.body);
    res.json(llmResponse.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error generating welcome message' });
  }
});

// OpenAPI-Swagger documentation configuration
const openapiPath = './openapi.yaml';
if (fs.existsSync(openapiPath)) {
  const file = fs.readFileSync(openapiPath, 'utf8');
  const swaggerDocument = YAML.parse(file);
  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Start the gateway service
const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});

module.exports = server;