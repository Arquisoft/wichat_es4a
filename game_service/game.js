// External libs
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const mongodb = require('./db/mongo/Connection');

// Libraries required for OpenAPI-Swagger
const swaggerUi = require('swagger-ui-express'); 
const fs = require("fs");
const YAML = require('yaml');

// My own libs
const {  newGame,
  next,
  answer,
  getNumberOfQuestionsPlayed,
  getQuestion,
  getCurrentGame,
  endGame } = require("./game/GameService");
const { saveQuestionsInDB, deleteOlderQuestions, loadInitialQuestions } = require('./game/questionService');

const port = 8040;
const app = express();

// Prometheus configuration
const promBundle = require('express-prom-bundle');
const { getCurrentQuestion } = require("./game/QuestionAsk");
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

// Middleware 
app.use(bodyParser.json()); // Parse the request into JSON
app.use(cors()); // This API is listening on a different port from the frontend

// API endpoints
app.post('/api/game/new', (req, res) => {
  console.log('Iniciando un nuevo juego...');
  newGame(req, res); // Ejecutar la función cuando se haga la solicitud
});

app.post('/api/game/next', (req, res) => {
  console.log('Obteniendo la siguiente pregunta...');
  next(req, res); // Ejecutar la función cuando se haga la solicitud
});

app.post('/api/game/answer', (req, res) => {
  console.log('Respondiendo a la pregunta...');
  answer(req, res); // Ejecutar la función cuando se haga la solicitud
});

app.post('/api/game/endGame', (req, res) => {
  console.log('Obteniendo la pregunta actual...');
  endGame(req, res); // Ejecutar la función cuando se haga la solicitud
});
// Leer el archivo OpenAPI YAML de forma síncrona
const openapiPath = './openapi.yaml';
if (fs.existsSync(openapiPath)) {
  const file = fs.readFileSync(openapiPath, 'utf8');

  // Parsear el contenido YAML a un objeto JavaScript que represente el documento Swagger
  const swaggerDocument = YAML.parse(file);

  // Servir la documentación Swagger UI en el endpoint '/api-doc'
  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.log("No se ha configurado OpenAPI. El archivo de configuración no está presente.");
}

// Conectar con MongoDB cuando se haga la primera solicitud (y no antes)
app.post('/api/connectMongo', (req, res) => {
  mongodb(); // Conexión a MongoDB solo cuando se hace esta solicitud
  res.status(200).send('Conexión a MongoDB establecida.');
});

// Función para guardar las preguntas en la base de datos, solo cuando se llame explícitamente
app.post('/api/game/save-questions', async (req, res) => {
  console.log('Guardando preguntas...');
  await saveQuestionsInDB(); // Solo se ejecuta cuando se hace la solicitud
  res.status(200).send('Preguntas guardadas');
});

// Función para eliminar preguntas antiguas, solo cuando se llame explícitamente
app.post('/api/game/delete-old-questions', async (req, res) => {
  console.log('Eliminando preguntas antiguas...');
  await deleteOlderQuestions(); // Solo se ejecuta cuando se hace la solicitud
  res.status(200).send('Preguntas antiguas eliminadas');
});

// Empezar el servidor
const server = app.listen(port, () => {
  console.log(`Game service listening at http://localhost:${port}`);
});

module.exports = server;
