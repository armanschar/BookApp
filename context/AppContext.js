import connection from "../utils/DbConnection.js";
import PublishersModel from "../models/PublishersModel.js"
import CategoriesModel from "../models/CategoriesModel.js";
import AuthorsModel from "../models/AuthorsModel.js";
import BooksModel from "../models/BooksModel.js";
import UserModel from "../models/UserModel.js";

try {
    await connection.authenticate();
    console.log("Database connection established successfully.");
}catch (error) {
    console.error("Unable to connect to the database:", error);
}

CategoriesModel.hasMany(BooksModel, {
    foreignKey: "categoryId",
});
BooksModel.belongsTo(CategoriesModel, {
    foreignKey: "categoryId",
});

AuthorsModel.hasMany(BooksModel, {
    foreignKey: "authorId",
});
BooksModel.belongsTo(AuthorsModel, {
    foreignKey: "authorId",
});

PublishersModel.hasMany(BooksModel, {
    foreignKey: "publisherId",
});
BooksModel.belongsTo(PublishersModel, {
    foreignKey: "publisherId",
});

// User-Books relationship

UserModel.hasMany(BooksModel, {
    foreignKey: "userId",
});
BooksModel.belongsTo(UserModel, {
    foreignKey: "userId",
});

UserModel.hasMany(PublishersModel, {
    foreignKey: "userId",
});
PublishersModel.belongsTo(UserModel, {
    foreignKey: "userId",
});

UserModel.hasMany(AuthorsModel, {
    foreignKey: "userId",
});
AuthorsModel.belongsTo(UserModel, {
    foreignKey: "userId",
});

UserModel.hasMany(CategoriesModel, {
    foreignKey: "userId",
});
CategoriesModel.belongsTo(UserModel, {
    foreignKey: "userId",
});



export default {
    Sequelize: connection,
    PublishersModel,
    CategoriesModel,
    AuthorsModel,
    BooksModel,
    UserModel
};