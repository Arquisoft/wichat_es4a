//libreria para trabajar con MongoDB
// Importar mongoose
const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;



//esquema para bd de pregunta
const questionSchema = new Schema({
    question: { type: String, required: true },
   
    topics: [{
        type: String,
        required: true
    }],
    
    answer: { type: String, required: true }, 
    options: { type: [String], required: true },
    imageUrl: { type: String, required: true },
    questionAnswered: { type: Boolean, required: false },
    useranswer: { type: String, required: false },
    time :{
        type: Number,
        required: false
    }
});


//se crea el modelo a partir del esquema que se definió previamente
const Question = model("Question", questionSchema);

//sirve para representar lo que se exportará desde el archivo actual -> el modelo de Pregunta
// Exportación en ES Module
module.exports =  Question;
