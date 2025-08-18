import mongoose from "mongoose";

const usersSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: true,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiration: {
      type: Date,
      default: null,
    },
    activateToken: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true, collection: "Users" }
); //esquema creado especificando los campos created y updated at y diciendo en que coleccion colocar los documentos

const Users = mongoose.model("Users", usersSchema); //creando el modelo segun el esquema

export default Users;
