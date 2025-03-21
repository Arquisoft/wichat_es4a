const mongoose = require("mongoose");
const { MongoMemoryServer } = require('mongodb-memory-server');

//async -> asegura que el código no se bloquee mientras espera que MongoDB se conecte.
const connect = async() => {
    try {
        if (process.env.DB_URL) {
            await mongoose.connect('mongodb://mongodb:27017/MODIFICARCONNUESTRAURL') 
            console.log("MongoDB URL server")
        } else {
            const mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri)

            console.log("MongoDB memory server")
        }

        console.log('MongoDB connected');

    } catch(error) {
        console.log(error);
        throw new Error('Error to connect with MongoDB');
    }
}


module.exports = connect;