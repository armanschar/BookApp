import context from "../context/AppContext.js";
import { sendEmail } from "../services/EmailServices.js";
import path from "path";
import fs from "fs";
import { projectRoot } from "../utils/Paths.js";
import { where } from "sequelize";

export async function GetIndex(req, res, next) {
  try {
    const booksResult = await context.BooksModel.findAll({
      where: { userId: req.user.id }, // Assuming you want to filter by the logged-in user
      include: [
        { model: context.AuthorsModel },
        { model: context.CategoriesModel },
        { model: context.PublishersModel },
      ],
    });
    const authorsResult = await context.AuthorsModel.findAll({
      where: { userId: req.user.id },
    });
    const categoriesResult = await context.CategoriesModel.findAll({
      where: { userId: req.user.id },
    });
    const publishersResult = await context.PublishersModel.findAll({
      where: { userId: req.user.id },
    });

    const books = booksResult.map((result) => result.dataValues);
    const authors = authorsResult.map((a) => a.dataValues);
    const categories = categoriesResult.map((c) => c.dataValues);
    const publishers = publishersResult.map((p) => p.dataValues);

    res.render("books", {
      booksList: books,
      authorsList: authors,
      categoriesList: categories,
      publishersList: publishers,
      hasBooks: books.length > 0,
      "page-title": "Mantenimiento de Libros",
    });
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

export async function GetCreate(req, res, next) {
  try {
    const authorsResult = await context.AuthorsModel.findAll({
      where: { userId: req.user.id },
    });
    const categoriesResult = await context.CategoriesModel.findAll({
      where: { userId: req.user.id },
    });
    const publishersResult = await context.PublishersModel.findAll({
      where: { userId: req.user.id },
    });

    const authors = authorsResult.map((a) => a.dataValues);
    const categories = categoriesResult.map((c) => c.dataValues);
    const publishers = publishersResult.map((p) => p.dataValues);

    res.render("books/save", {
      editMode: false,
      authorsList: authors,
      hasAuthors: authors.length > 0,
      categoriesList: categories,
      hasCategories: categories.length > 0,
      publishersList: publishers,
      hasPublishers: publishers.length > 0,
      "page-title": "Crear Nuevo Libro",
    });
  } catch (error) {
    console.error("Error fetching data for book creation:", error);
  }
}

export async function PostCreate(req, res, next) {
  const { Title, PublicationYear, AuthorId, CategoryId, PublisherId } =
    req.body;
  const coverImage = req.file;

  try {
    const coverImagePath = coverImage
      ? "\\" + path.relative("public", coverImage.path)
      : null;

    await context.BooksModel.create({
      title: Title,
      publicationYear: PublicationYear,
      coverImage: coverImagePath,
      authorId: AuthorId,
      categoryId: CategoryId,
      publisherId: PublisherId,
      userId: req.user.id,
    });

    const author = await context.AuthorsModel.findOne({
      where: { id: AuthorId, userId: req.user.id },
    });

    if (author && author.email) {
      try {
        await sendEmail({
          to: author.email,
          subject: "Nuevo Libro Publicado",
          html: `
            <h2>¡Felicidades ${author.name}!</h2>
            <p>Se ha publicado un nuevo libro de su autoría:</p>
            <h3>"${Title}"</h3>
            <p><strong>Año de publicación:</strong> ${PublicationYear}</p>
            <p>Gracias por su contribución a nuestra biblioteca.</p>
            <hr>
            <p><em>BookApp - Sistema de Gestión de Libros</em></p>
          `,
        });
        console.log(
          `Email enviado exitosamente a ${author.email} para el libro "${Title}"`
        );
      } catch (emailError) {
        console.error("Error enviando email:", emailError);
      }
    } else {
      console.warn("No se pudo enviar email: autor no encontrado o sin email");
    }

    return res.redirect("/books");
  } catch (error) {
    console.error("Error creating book:", error);

    const authorsResult = await context.AuthorsModel.findAll({
      where: { userId: req.user.id },
    });
    const categoriesResult = await context.CategoriesModel.findAll({
      where: { userId: req.user.id },
    });
    const publishersResult = await context.PublishersModel.findAll({
      where: { userId: req.user.id },
    });

    const authors = authorsResult.map((a) => a.dataValues);
    const categories = categoriesResult.map((c) => c.dataValues);
    const publishers = publishersResult.map((p) => p.dataValues);

    res.render("books/save", {
      editMode: false,
      authorsList: authors,
      hasAuthors: authors.length > 0,
      categoriesList: categories,
      hasCategories: categories.length > 0,
      publishersList: publishers,
      hasPublishers: publishers.length > 0,
      formData: req.body,
      error: "Error al crear el libro. Por favor, intente nuevamente.",
      "page-title": "Crear Nuevo Libro",
    });
  }
}

export async function GetEdit(req, res, next) {
  const id = req.params.bookId;

  try {
    const bookResult = await context.BooksModel.findOne({
      where: { id: id, userId: req.user.id }, // Ensure the book belongs to the logged-in user
      include: [
        { model: context.AuthorsModel },
        { model: context.CategoriesModel },
        { model: context.PublishersModel },
      ],
    });

    if (!bookResult) {
      return res.redirect("/books");
    }

    const book = bookResult.dataValues;
    const authorsResult = await context.AuthorsModel.findAll({
      where: { userId: req.user.id },
    });
    const categoriesResult = await context.CategoriesModel.findAll({
      where: { userId: req.user.id },
    });
    const publishersResult = await context.PublishersModel.findAll({
      where: { userId: req.user.id },
    });

    const authors = authorsResult.map((a) => a.dataValues);
    const categories = categoriesResult.map((c) => c.dataValues);
    const publishers = publishersResult.map((p) => p.dataValues);

    res.render("books/save", {
      editMode: true,
      book: book,
      authorsList: authors,
      hasAuthors: authors.length > 0,
      categoriesList: categories,
      hasCategories: categories.length > 0,
      publishersList: publishers,
      hasPublishers: publishers.length > 0,
      "page-title": `Editar Libro: ${book.title}`,
    });
  } catch (error) {
    console.error("Error fetching book for edit:", error);
  }
}

export async function PostEdit(req, res, next) {
  const { Title, PublicationYear, AuthorId, CategoryId, PublisherId } =
    req.body;
  const coverImage = req.file;
  let coverImagePath = null;
  const id = req.body.BookId;

  try {
    const result = await context.BooksModel.findOne({
      where: { id: id, userId: req.user.id },
    });

    if (!result) {
      return res.redirect("/books");
    }

    if (coverImage) {
      coverImagePath = "\\" + path.relative("public", coverImage.path);
    } else {
      coverImagePath = result.coverImage;
    }

    await context.BooksModel.update(
      {
        title: Title,
        publicationYear: PublicationYear,
        coverImage: coverImagePath,
        authorId: AuthorId,
        categoryId: CategoryId,
        publisherId: PublisherId,
        userId: req.user.id,
      },
      { where: { id: id } }
    );
    res.redirect("/books");
  } catch (error) {
    console.error("Error editing book:", error);
  }
}

export async function GetDelete(req, res, next) {
  const id = req.params.bookId;

  try {
    const result = await context.BooksModel.findOne({
      where: { id: id, userId: req.user.id },
    });

    if (!result) {
      return res.redirect("/books");
    }

    const authorsResult = await context.AuthorsModel.findAll({
      where: { userId: req.user.id },
    });
    const categoriesResult = await context.CategoriesModel.findAll({
      where: { userId: req.user.id },
    });
    const publishersResult = await context.PublishersModel.findAll({
      where: { userId: req.user.id },
    });
    const authors = authorsResult.map((a) => a.dataValues);
    const categories = categoriesResult.map((c) => c.dataValues);
    const publishers = publishersResult.map((p) => p.dataValues);

    const book = result.dataValues;
    res.render("books/delete", {
      book: book,
      authorsList: authors,
      hasAuthors: authors.length > 0,
      categoriesList: categories,
      hasCategories: categories.length > 0,
      publishersList: publishers,
      hasPublishers: publishers.length > 0,
      "page-title": `Eliminar Libro: ${book.title}`,
    });
  } catch (error) {
    console.error("Error fetching book for delete:", error);
  }
}

export async function PostDelete(req, res, next) {
  const id = req.body.BookId;

  try {
    const result = await context.BooksModel.findOne({
      where: { id: id, userId: req.user.id },
    });

    if (!result) {
      return res.redirect("/books");
    }

    const coverImagePath = path.join(projectRoot, "public", result.coverImage);
    if (fs.existsSync(coverImagePath)) {
      fs.unlinkSync(coverImagePath);
    }

    await context.BooksModel.destroy({ where: { id: id } });
    res.redirect("/books");
  } catch (error) {
    console.error("Error deleting book:", error);
  }
}

export async function GetDetails(req, res, next) {
  const id = req.params.bookId;

  try {
    const bookResult = await context.BooksModel.findOne({
      where: { id: id, userId: req.user.id }, // Ensure the book belongs to the logged-in user
      include: [
        {
          model: context.AuthorsModel,
          attributes: ["id", "name", "email"],
        },
        {
          model: context.CategoriesModel,
          attributes: ["id", "name", "description"],
        },
        {
          model: context.PublishersModel,
          attributes: ["id", "name", "country", "phone"],
        },
      ],
    });

    if (!bookResult) {
      return res.status(404).render("404", {
        "page-title": "Libro no encontrado",
      });
    }

    const categoriesResult = await context.CategoriesModel.findAll({
      where: { userId: req.user.id },
      attributes: ["id", "name"],
    });
    const authorsResult = await context.AuthorsModel.findAll({
      where: { userId: req.user.id },
      attributes: ["id", "name"],
    });
    const publishersResult = await context.PublishersModel.findAll({
      where: { userId: req.user.id },
      attributes: ["id", "name", "country", "phone"],
    });

    const book = bookResult.dataValues;
    const categories = categoriesResult.map((c) => c.dataValues);
    const authors = authorsResult.map((a) => a.dataValues);
    const publishers = publishersResult.map((p) => p.dataValues);

    res.render("books/details", {
      book: book,
      categoriesList: categories,
      authorsList: authors,
      publishersList: publishers,
      "page-title": `Detalles: ${book.title}`,
    });
  } catch (error) {
    console.error("Error fetching book details:", error);
    res.status(500).render("error", {
      error: "Error al cargar los detalles del libro",
      "page-title": "Error",
    });
  }
}
