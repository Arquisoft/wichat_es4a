const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connect = async () => {
  
  try {
    console.log("Connecting to MongoDB...");
    const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/bd";
   

    await mongoose.connect(dbUrl);
  } catch (error) {
    throw error;
  }
};

const disconnect = async () => {
  
  try {
    await mongoose.disconnect();
  } catch (error) {
    throw error;
  }
};

module.exports = { connect, disconnect };
