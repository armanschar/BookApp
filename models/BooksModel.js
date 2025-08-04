import connection from "../utils/DbConnection.js";
import { DataTypes } from "sequelize";

const Books = connection.define(
  "Books",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    publicationYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1450,
        max: new Date().getFullYear() + 10,
      },
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Categories",
        key: "id",
      },
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Authors",
        key: "id",
      },
    },
    publisherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Publishers",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    tableName: "Books",
  }
);

export default Books;
