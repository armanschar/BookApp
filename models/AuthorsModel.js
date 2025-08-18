import mongoose from "mongoose";

const authorsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, //haciendo referencia al objecto mediante su campo objectId unico de mongo
      ref: "Users", //referenciando el modelo con el que se relaciona
      required: true,
    },
  },
  { timestamps: true, collection: "Authors" }
); //esquema creado especificando los campos created y updated at y diciendo en que coleccion colocar los documentos

const Authors = mongoose.model("Authors", authorsSchema); //creando el modelo segun el esquema

export default Authors;
