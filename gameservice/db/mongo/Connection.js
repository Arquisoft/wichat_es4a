const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connect = async () => {
  if (process.env.NODE_ENV === "test") {
    return;  // Retorna sin hacer nada para evitar la conexión
  }
  try {
    const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/bd";
   

    await mongoose.connect(dbUrl);
  } catch (error) {
    throw error;
  }
};

const disconnect = async () => {
  if (process.env.NODE_ENV === "test") {
    return;  // Retorna sin hacer nada para evitar la conexión
  }
  try {
    await mongoose.disconnect();
  } catch (error) {
    throw error;
  }
};

module.exports = { connect, disconnect };
