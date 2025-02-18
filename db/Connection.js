const mongoose = require("mongoose");
const { MongoMemoryServer } = require('mongodb-memory-server');

//async -> asegura que el código no se bloquee mientras espera que MongoDB se conecte.
const connect = async() => {
    try {
        //comprobamos si la variable de entorno DB_URL está definida
        if (process.env.DB_URL) {
            //si es asi -> nos conectamos a un servidor externo con nuestra URL personal
            await mongoose.connect('mongodb://mongodb:27017/MODIFICARCONNUESTRAURL') 
            console.log("MongoDB URL server")
        } else {
            //si no hay una variable de entorno DB_URL, creamos un servidor de MongoDB en memoria usando MongoMemoryServer
            const mongoServer = await MongoMemoryServer.create();  //se crea un servidor de bd en memoria
            const mongoUri = mongoServer.getUri();  //obtenemos la URL del servidor en memoria
            await mongoose.connect(mongoUri)  //nos conectamos a mongoDB

            console.log("MongoDB memory server")
        }

        console.log('MongoDB connected');

    } catch(error) {
        console.log(error);
        throw new Error('Error to connect with MongoDB');
    }
}


module.exports = connect;