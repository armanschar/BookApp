import mongoose from "mongoose";

const booksSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    publicationYear: {
      type: Number,
      required: true,
      min: 1450,
      max: new Date().getFullYear() + 10,
    },
    coverImage: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId, //haciendo referencia al objecto mediante su campo objectId unico de mongo
      ref: "Categories", //referenciando el modelo con el que se relaciona
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Authors",
      required: true,
    },
    publisherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Publishers",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
  },
  { timestamps: true, collection: "Books" }
);

const Books = mongoose.model("Books", booksSchema); //creando el modelo segun el esquema

export default Books;
