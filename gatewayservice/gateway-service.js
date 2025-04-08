const express = require('express');
const axios = require('axios');
const cors = require('cors');
const promBundle = require('express-prom-bundle');

// Libraries required for OpenAPI-Swagger
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const YAML = require('yaml');

// Convertir "import jwt from 'jsonwebtoken'" a require
const jwt = require('jsonwebtoken');
const privateKey = "your-secret-key";

const app = express();
const port = 8000;

const llmServiceUrl = process.env.LLM_SERVICE_URL || 'http://localhost:8003';
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:8002';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';
const gameServiceUrl = process.env.GAME_SERVICE_URL || 'http://localhost:8005';
const questionServiceUrl = process.env.QUESTION_SERVICE_URL || 'http://localhost:8004';


app.use(cors());
app.use(express.json());

//Prometheus configuration
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

// Middleware para verificar el token
const verifyToken = (req, res, next) => {

  // If there's no token provided, assign a guest user
  if (!req.headers["authorization"]) {
    req.body.user = { userId: "guest" + Date.now() }; // If there's no token, assign a guest user
    next();
  }
  // If there's a token, verify it
  else {
    const token = req.headers["authorization"]?.split(" ")[1]; // Obtener el token del encabezado de autorización
    if (!token) {
      return res.status(401).json({ message: "Token wasn't provided properly" });
    }
    jwt.verify(token, privateKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.body.user = decoded; // Guardar la información del usuario decodificada en la solicitud
      next(); // Continuar con la siguiente función de middleware o ruta
    });
  }
};

const generateCacheId = (req, res, next) => {
  const min = 10 ** 15; // Número mínimo de 16 dígitos
  const max = 10 ** 16 - 1; // Número máximo de 16 dígitos
  
  req.body.cacheId = Math.floor(Math.random() * (max - min + 1)) + min;
  next();
}


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/login', async (req, res) => {
  try {
    // Forward the login request to the authentication service
    const authResponse = await axios.post(authServiceUrl + '/login', req.body);
    res.json(authResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.post('/adduser', async (req, res) => {
  try {
    // Forward the add user request to the user service
    const userResponse = await axios.post(userServiceUrl + '/adduser', req.body);
    console.log(userResponse)
    res.json(userResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.post('/api/user/editUser', verifyToken, async (req, res) => {
  try {
    const editResponse = await axios.post(userServiceUrl + '/editUser', req.body);
    res.json(editResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.post('/askllm', async (req, res) => {
  try {
    // Forward the add user request to the user service
    const llmResponse = await axios.post(llmServiceUrl + '/ask', req.body);
    res.json(llmResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

// **Iniciar una nueva partida**
app.post('/api/game/new', generateCacheId, async (req, res) => {
  console.log("Estoy en gateway-service.js");
  try {
    console.log("Llamando a:", `${gameServiceUrl}/api/connectMongo`);
    console.log("Iniciando una nueva partida...");
    await axios.post(`${gameServiceUrl}/api/connectMongo`, req.body);

    console.log("Llamando a:", `${gameServiceUrl}/api/game/new`);
    await axios.post(`${gameServiceUrl}/api/game/new`, req.body);

    res.json({ cacheId: req.body.cacheId });
  } catch (error) {
    console.error("Error al iniciar el juego:", error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error iniciando juego' });
  }
});

// **Generar la pregunta de cara a que la use GameService**
app.post('/api/question/new', async (req, res) => {
  try {
    console.log("Estoy en gateway-service.js y el apiEndpoint es: " + questionServiceUrl + '/api/question/generate');
    console.log("Generando pregunta...")
    const endResponse = await axios.post(`${questionServiceUrl}/api/question/generate`, req.body);
    res.json(endResponse.data);
  } catch (error) {
    console.log("Error al generar la pregunta: ", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Error al generar la pregunta',
      details: error.response?.data || {}
    });
  }
});

// **Obtener la siguiente pregunta de la partida**
app.post('/api/game/question', async (req, res) => {
  console.log("Estoy en gateway-service.js y el apiEndpoint es: " + gameServiceUrl + '/api/game/question');
  try {
    console.log("Solicitando la siguiente pregunta...");
    const questionResponse = await axios.post(`${gameServiceUrl}/api/game/next`, req.body);
    res.json(questionResponse.data);
  } catch (error) {
    console.error("Error al obtener la siguiente pregunta:", error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error obteniendo la pregunta' });
  }
});

// **Finalizar el juego y guardar los datos**
app.post('/api/game/endAndSaveGame', verifyToken, async (req, res) => {
  try {
    console.log("Finalizando y guardando el juego...");
    const endResponse = await axios.post(`${gameServiceUrl}/api/game/endAndSaveGame`, req.body, {
      headers: { Authorization: req.headers["authorization"] }
    });
    res.json(endResponse.data);
  } catch (error) {
    console.error("Error al finalizar el juego:", error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Error finalizando el juego' });
  }
});



// Información sobre la partida para el historial (con verificación de token)
app.get('/api/game/history/gameList', verifyToken, async (req, res) => {
  try {
    console.log("Generando histórico sobre partida");
    console.log("UserId:", req.body.user.userId);
    console.log("Llamando a:", `${gameServiceUrl}/api/game/history/gameList`);
    console.log("Body:", req.body);

    await axios.post(`${gameServiceUrl}/api/connectMongo`, req.body);

    const endResponse = await axios.post(`${gameServiceUrl}/api/game/history/gameList`, req.body);

    res.json(endResponse.data);
  } catch (error) {
    console.error("Error al generar el histórico de partida:", error.message);
    res.status(500).json({ message: "Internal server error" });

  }
});

// Información sobre las preguntas de una partida para el historial (con verificación de token)
app.post('/api/game/history/gameQuestions', async (req, res) => {
  try {
    console.log("Generando histórico sobre preguntas de una partida");

    await axios.post(`${gameServiceUrl}/api/connectMongo`, req.body);

    const endResponse = await axios.post(`${gameServiceUrl}/api/game/history/gameQuestions`, req.body)

    res.json(endResponse.data);
  } catch (error) {
    console.error("Error al generar el histórico de preguntas:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to get a clue from the LLM service
app.post('/askllm/clue', async (req, res) => {
  try {
    // Forward the add user request to the user service
    const llmResponse = await axios.post(llmServiceUrl + '/askllm/clue', req.body);
    res.json(llmResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

// Endpoint to get a welcome message from the LLM service
app.post('/askllm/welcome', async (req, res) => {
  try {
    // Forward the add user request to the user service
    const llmResponse = await axios.post(llmServiceUrl + '/askllm/welcome', req.body);
    res.json(llmResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

// Read the OpenAPI YAML file synchronously
const openapiPath = './openapi.yaml'
if (fs.existsSync(openapiPath)) {
  const file = fs.readFileSync(openapiPath, 'utf8');

  // Parse the YAML content into a JavaScript object representing the Swagger document
  const swaggerDocument = YAML.parse(file);

  // Serve the Swagger UI documentation at the '/api-doc' endpoint
  // This middleware serves the Swagger UI files and sets up the Swagger UI page
  // It takes the parsed Swagger document as input
  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.log("Not configuring OpenAPI. Configuration file not present.")
}


// Start the gateway service
const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});

module.exports = server;
