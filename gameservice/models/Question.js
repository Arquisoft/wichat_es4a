/**
 * @fileoverview Defines the Mongoose model for a Question entity.
 * This schema represents questions used in a quiz game, including 
 * the question text, possible answers, user selection, and result.
 */


const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;


/**
 * Mongoose schema for a question.
 * Each question includes the text, an image, possible answers,
 * and optionally user response data.
 */
const questionSchema = new Schema({
    text: { 
        type: String, 
        required: false 
    }, // The question text

    imageUrl: { 
        type: String, 
        required: true 
    }, // URL of the image associated with the question

    wasUserCorrect: { 
        type: Boolean, 
        required: false 
    }, // Whether the user answered the question correctly

    selectedAnswer: { 
        type: String, 
        required: false 
    }, // The answer selected by the user

    answers: [
        {
            text: { 
                type: String, 
                required: false 
            }, // Text of the answer option

            isCorrect: { 
                type: Boolean, 
                required: false 
            } // Indicates whether the option is the correct answer
        }
    ],
    topics: [
        {
          type: String,
          required: false
        }
      ]
});

/**
 * Mongoose model for the Question collection.
 */
const Question = model("Question", questionSchema);

/**
 * Exports the Question model for use in other modules.
 */
module.exports = {Question};

