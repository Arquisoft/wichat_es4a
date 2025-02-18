//libreria para trabajar con MongoDB
const { Schema, model, Types } = require("mongoose");
const { ObjectId } = Types;

//esquema para bd de partida jugada
const gamePLayedSchema = new Schema({
    // Referencia al usuario que jugó
  user: {
    type: ObjectId,
    ref: "User",
    required: true
  },
  // Modalidad de juego.
  modality: {
    type: String,
    required: true
  },
  // Puntuación obtenida
  score: {
    type: Number,
    default: 0
  },
  // Array con las preguntas jugadas en esta partida
  questionsPlayed: [questionPlayedSchema],
  //Array para los topics
  topicsPlayed : [topicsPlayedSchema]
});


//se crea el modelo a partir del esquema que se definió previamente
const GamePlayed = model("GamePlayed", gamePLayedSchema);

//sirve para representar lo que se exportará desde el archivo actual -> el modelo de Pregunta
module.exports = GamePlayed;
