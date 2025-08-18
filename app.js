import "./utils/LoadEnvConfig.js";
import connectDB from "./utils/MongooseConnection.js";
import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import { projectRoot } from "./utils/Paths.js";
import homeRoutes from "./routes/home-router.js";
import categoriesRoutes from "./routes/categories-router.js";
import authorsRoutes from "./routes/authors-router.js";
import publishersRoutes from "./routes/publishers-router.js";
import booksRoutes from "./routes/books-router.js";
import authRoutes from "./routes/auth.js";
import multer from "multer";
import flash from "connect-flash";
import { v4 as uuidv4 } from "uuid";
import { GetAuthorName } from "./utils/helpers/hbs/GetAuthorName.js";
import { GetCategoryName } from "./utils/helpers/hbs/GetCategoryName.js";
import { GetPublisherName } from "./utils/helpers/hbs/GetPublisherName.js";
import { Equals } from "./utils/helpers/hbs/Equal.js";
import { GetSection } from "./utils/helpers/hbs/Section.js";
import { GetPhone } from "./utils/helpers/hbs/GetPhone.js";
import { GetCountry } from "./utils/helpers/hbs/GetCountry.js";
import session from "express-session";
import MongoStore from "connect-mongo";

const app = express();

app.engine(
  "hbs",
  engine({
    layoutsDir: "views/layouts",
    defaultLayout: "main",
    extname: ".hbs",
    helpers: {
      getAuthorName: GetAuthorName,
      getCategoryName: GetCategoryName,
      getPublisherName: GetPublisherName,
      eq: Equals,
      section: GetSection,
      getPhone: GetPhone,
      getCountry: GetCountry,
    },
  })
);

app.set("view engine", "hbs");
app.set("views", "views");

const storageForBook = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(projectRoot, "public", "images", "books"));
  },
  filename: (req, file, cb) => {
    const fileName = `${uuidv4()}-${file.originalname}`;
    cb(null, fileName);
  },
});

app.use(multer({ storage: storageForBook }).single("CoverImage"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
  })
);

app.use(flash());

app.use((req, res, next) => {
  if (!req.session) {
    return next();
  }
  if (!req.session.user) {
    return next();
  }
  if (!req.session.isAuthenticated) {
    return next();
  }
  req.user = req.session.user;
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.user || false;
  res.locals.hasUser = !!req.user;
  res.locals.isAuthenticated = req.session.isAuthenticated || false;
  const errors = req.flash("errors");
  res.locals.errors = errors;
  res.locals.hasErrors = errors.length > 0;
  res.locals.success = req.flash("success");
  res.locals.hasSuccess = res.locals.success.length > 0;
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(projectRoot, "public")));

// Login route as the main entry point
app.use("/", authRoutes);
app.use("/home", homeRoutes);
app.use("/categories", categoriesRoutes);
app.use("/authors", authorsRoutes);
app.use("/publishers", publishersRoutes);
app.use("/books", booksRoutes);

app.use((req, res, next) => {
  if (req.session.isAuthenticated && req.session.user) {
    return res.status(404).render("404", { "page-title": "Page Not Found" });
  }

  return res
    .status(404)
    .render("404", { "page-title": "Page Not Found", layout: "login" });
});

try {
  await connectDB();
  app.listen(process.env.PORT);
  console.log(`Server is running on port ${process.env.PORT}`);
} catch (error) {
  console.error("Error connecting to the database:", error);
}
