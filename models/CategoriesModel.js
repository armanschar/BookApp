import mongoose from "mongoose";

const categoriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, //haciendo referencia al objecto mediante su campo objectId unico de mongo
      ref: "Users", //referenciando el modelo con el que se relaciona
      required: true,
    },
  },
  { timestamps: true, collection: "Categories" }
); //esquema creado especificando los campos created y updated at y diciendo en que coleccion colocar los documentos

const Categories = mongoose.model("Categories", categoriesSchema); //creando el modelo segun el esquema

export default Categories;
