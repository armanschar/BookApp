import mongoose from "mongoose";

const publishersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, //haciendo referencia al objecto mediante su campo objectId unico de mongo
      ref: "Users", //referenciando el modelo con el que se relaciona
      required: true,
    },
  },
  { timestamps: true, collection: "Publishers" } //esquema creado especificando los campos created y updated at y diciendo en que coleccion colocar los documentos
);

const Publishers = mongoose.model("Publishers", publishersSchema); //creando el modelo segun el esquema

export default Publishers;
