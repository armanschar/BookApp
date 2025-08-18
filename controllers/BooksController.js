import BooksModel from "../models/BooksModel.js";
import CategoriesModel from "../models/CategoriesModel.js";
import AuthorsModel from "../models/AuthorsModel.js";
import PublishersModel from "../models/PublishersModel.js";
import { sendEmail } from "../services/EmailServices.js";
import path from "path";
import fs from "fs";
import { projectRoot } from "../utils/Paths.js";

export async function GetIndex(req, res, next) {
  try {
    const result = await BooksModel.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const authorsResult = await AuthorsModel.find({
      userId: req.user.id,
    }).lean();
    const categoriesResult = await CategoriesModel.find({
      userId: req.user.id,
    }).lean();
    const publishersResult = await PublishersModel.find({
      userId: req.user.id,
    }).lean();

    res.render("books", {
      booksList: result,
      authorsList: authorsResult,
      categoriesList: categoriesResult,
      publishersList: publishersResult,
      hasBooks: result.length > 0,
      "page-title": "Mantenimiento de Libros",
    });
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

export async function GetCreate(req, res, next) {
  try {
    const authorsResult = await AuthorsModel.find({
      userId: req.user.id,
    }).lean();
    const categoriesResult = await CategoriesModel.find({
      userId: req.user.id,
    }).lean();
    const publishersResult = await PublishersModel.find({
      userId: req.user.id,
    }).lean();

    res.render("books/save", {
      editMode: false,
      authorsList: authorsResult,
      hasAuthors: authorsResult.length > 0,
      categoriesList: categoriesResult,
      hasCategories: categoriesResult.length > 0,
      publishersList: publishersResult,
      hasPublishers: publishersResult.length > 0,
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

    await BooksModel.create({
      title: Title,
      publicationYear: PublicationYear,
      coverImage: coverImagePath,
      authorId: AuthorId,
      categoryId: CategoryId,
      publisherId: PublisherId,
      userId: req.user.id,
    });

    const author = await AuthorsModel.findOne({
      _id: AuthorId,
      userId: req.user.id,
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

    const authorsResult = await AuthorsModel.find({
      userId: req.user.id,
    }).lean();
    const categoriesResult = await CategoriesModel.find({
      userId: req.user.id,
    }).lean();
    const publishersResult = await PublishersModel.find({
      userId: req.user.id,
    }).lean();

    res.render("books/save", {
      editMode: false,
      authorsList: authorsResult,
      hasAuthors: authorsResult.length > 0,
      categoriesList: categoriesResult,
      hasCategories: categoriesResult.length > 0,
      publishersList: publishersResult,
      hasPublishers: publishersResult.length > 0,
      formData: req.body,
      error: "Error al crear el libro. Por favor, intente nuevamente.",
      "page-title": "Crear Nuevo Libro",
    });
  }
}

export async function GetEdit(req, res, next) {
  const id = req.params.bookId;

  try {
    const bookResult = await BooksModel.findOne({
      _id: id,
      userId: req.user.id,
    })
      .populate("authorId", "name email")
      .populate("categoryId", "name description")
      .populate("publisherId", "name country phone")
      .lean();

    if (!bookResult) {
      return res.redirect("/books");
    }
    const authorsResult = await AuthorsModel.find({
      userId: req.user.id,
    }).lean();
    const categoriesResult = await CategoriesModel.find({
      userId: req.user.id,
    }).lean();
    const publishersResult = await PublishersModel.find({
      userId: req.user.id,
    }).lean();

    res.render("books/save", {
      editMode: true,
      book: bookResult,
      authorsList: authorsResult,
      hasAuthors: authorsResult.length > 0,
      categoriesList: categoriesResult,
      hasCategories: categoriesResult.length > 0,
      publishersList: publishersResult,
      hasPublishers: publishersResult.length > 0,
      "page-title": `Editar Libro: ${bookResult.title}`,
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
    const result = await BooksModel.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!result) {
      return res.redirect("/books");
    }

    if (coverImage) {
      coverImagePath = "\\" + path.relative("public", coverImage.path);
    } else {
      coverImagePath = result.coverImage;
    }

    await BooksModel.findByIdAndUpdate(id, {
      title: Title,
      publicationYear: PublicationYear,
      coverImage: coverImagePath,
      authorId: AuthorId,
      categoryId: CategoryId,
      publisherId: PublisherId,
      userId: req.user.id,
    });
    res.redirect("/books");
  } catch (error) {
    console.error("Error editing book:", error);
  }
}

export async function GetDelete(req, res, next) {
  const id = req.params.bookId;

  try {
    const result = await BooksModel.findOne({
      _id: id,
      userId: req.user.id,
    }).lean();

    if (!result) {
      return res.redirect("/books");
    }

    const authorsResult = await AuthorsModel.find({
      userId: req.user.id,
    }).lean();
    const categoriesResult = await CategoriesModel.find({
      userId: req.user.id,
    }).lean();
    const publishersResult = await PublishersModel.find({
      userId: req.user.id,
    }).lean();

    res.render("books/delete", {
      book: result,
      authorsList: authorsResult,
      hasAuthors: authorsResult.length > 0,
      categoriesList: categoriesResult,
      hasCategories: categoriesResult.length > 0,
      publishersList: publishersResult,
      hasPublishers: publishersResult.length > 0,
      "page-title": `Eliminar Libro: ${result.title}`,
    });
  } catch (error) {
    console.error("Error fetching book for delete:", error);
  }
}

export async function PostDelete(req, res, next) {
  const id = req.body.BookId;

  try {
    const result = await BooksModel.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!result) {
      return res.redirect("/books");
    }

    const coverImagePath = path.join(projectRoot, "public", result.coverImage);
    if (fs.existsSync(coverImagePath)) {
      fs.unlinkSync(coverImagePath);
    }

    await BooksModel.deleteOne({ _id: id });
    res.redirect("/books");
  } catch (error) {
    console.error("Error deleting book:", error);
  }
}

export async function GetDetails(req, res, next) {
  const id = req.params.bookId;

  try {
    const bookResult = await BooksModel.findOne({
      _id: id,
      userId: req.user.id,
    })
      .populate('authorId', 'name email')
      .populate('categoryId', 'name description')
      .populate('publisherId', 'name country phone')
      .lean();

    if (!bookResult) {
      return res.status(404).render("404", {
        "page-title": "Libro no encontrado",
      });
    }

    const categoriesResult = await CategoriesModel.find({
      userId: req.user.id,
    }).select('name').lean();
    const authorsResult = await AuthorsModel.find({
      userId: req.user.id,
    }).select('name').lean();
    const publishersResult = await PublishersModel.find({
      userId: req.user.id,
    }).select('name country phone').lean();

    res.render("books/details", {
      book: bookResult,
      categoriesList: categoriesResult,
      authorsList: authorsResult,
      publishersList: publishersResult,
      "page-title": `Detalles: ${bookResult.title}`,
    });
  } catch (error) {
    console.error("Error fetching book details:", error);
    res.status(500).render("error", {
      error: "Error al cargar los detalles del libro",
      "page-title": "Error",
    });
  }
}
