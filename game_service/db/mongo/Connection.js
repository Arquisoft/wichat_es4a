const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connect = async () => {
  try {
    const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/bd";
    console.log("🚀 Conectando a MongoDB en:", dbUrl);

    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Conexión exitosa con MongoDB.");
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB:", error);
    throw new Error("Error al conectar con MongoDB");
  }
};

module.exports = connect; // ✅ Exportar correctamente
