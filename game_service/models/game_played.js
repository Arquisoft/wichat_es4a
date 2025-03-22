// Importar mongoose
const mongoose = require("mongoose");

const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

// Esquema para Partida Jugada
const gamePlayedSchema = new Schema({
  user: {
    type: ObjectId,
    ref: "User",
    required: true
  },
  modality: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  topics: [
    {
      type: String,
      required: true
    }
  ],
  questionsPlayed: [
    {
      type: ObjectId,
      ref: "Question"
    }
  ],
    isActive: 
      {
      type: Boolean,
      default: false 
    }
  
});

// Crear modelo
const GamePlayed = model("GamePlayed", gamePlayedSchema);

// Exportación en ES Module
module.exports =  GamePlayed;
