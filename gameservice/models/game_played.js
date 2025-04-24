
/**
 * Mongoose schema for storing data about a completed game session.
 * 
 * Fields:
 * - userId: Reference to the user who played the game.
 * - numberOfQuestions: Total number of questions in the game.
 * - numberOfCorrectAnswers: Total number of correct answers given by the user.
 * - gameMode: Mode or type of the game.
 * - points: Points earned in the game.
 * - questions: List of questions presented in the game.
 * - topics: Topics or categories associated with the game.
 * - gameDate: Date when the game was played, formatted as DD-MM-YYYY.
 */

const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

// Define the schema for GamePlayed

const gamePlayedSchema = new Schema({
  userId: {
    type: ObjectId,
    ref: "User",
    required: false
  },
  numberOfQuestions: {
    type: Number,
    required: false
  },
  numberOfCorrectAnswers: {
    type: Number,
    required: false
  },
  gameMode: {
    type: String,
    required: false
  },
  points: {
    type: Number,
    default: 0
  },

  questionsPlayed: [
    {
      type: ObjectId,
      ref: "Question"

    }
  ],
  topics: [
    {
      type: String,
      required: false
    }
  ],

  gameDate: {
    type: String,
    default: () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0'); // Months go from 0 to 11
      const year = now.getFullYear();
      return `${day}-${month}-${year}`;
    }
  }
});

const GamePlayed = model("GamePlayed", gamePlayedSchema);

module.exports = { GamePlayed };


