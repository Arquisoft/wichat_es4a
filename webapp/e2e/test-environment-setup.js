const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoserver;
let userservice;
let authservice;
let llmservice;
let questionservice;
let gameservice;
let gatewayservice;


async function startServer() {
    console.log('Starting MongoDB memory server...');
    mongoserver = await MongoMemoryServer.create();
    const mongoUri = mongoserver.getUri();
    process.env.MONGODB_URI = mongoUri;

    // Load API KEY from .env file
    require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

    userservice = await require("../../users/userservice/user-service");
    authservice = await require("../../users/authservice/auth-service");
    llmservice = await require("../../llmservice/llm-service");
    gatewayservice = await require("../../gatewayservice/gateway-service");
    questionservice = await require("../../questionservice/question-service");
    gameservice = await require("../../gameservice/game-service");
}

startServer();
