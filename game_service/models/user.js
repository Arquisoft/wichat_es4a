const mongoose = require("mongoose");
const { Schema, model } = mongoose;  

// Definir el esquema de usuario
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  friendCode: {
    type: String,
    unique: true,
    required: false
  },
  password: {
    type: String,
    required: true
  }
});

// Función que genera un número entre 100000 y 999999 en formato String.
function generarCodigoAmigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Antes de guardar, se genera y asigna un friendCode único.
// Usamos `this.constructor` para buscar dentro del mismo modelo, ya que "User"
// aún no está definido en el momento de crear el hook.
userSchema.pre("save", async function (next) {
  const user = this;
  let codigoValido = false;
  let codigoAleatorio;

  while (!codigoValido) {
    codigoAleatorio = generarCodigoAmigo();

    // Verifica si ya existe otro usuario con este friendCode
    const existe = await this.constructor.findOne({ friendCode: codigoAleatorio });
    if (!existe) {
      codigoValido = true;
    }
  }

  user.friendCode = codigoAleatorio;
  next();
});

// Crear el modelo a partir del esquema
const User = model("User", userSchema);
module.exports =  User;
