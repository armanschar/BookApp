import { where } from "sequelize";
import context from "../context/AppContext.js";

export async function GetIndex(req, res) {
  try {
    const authorsResult = await context.AuthorsModel.findAll({
      where: { userId: req.user.id }, // Assuming you want to filter by the logged-in user
      order: [["name", "ASC"]],
    });

    const authors = await Promise.all(
      authorsResult.map(async (author) => {
        const bookCount = await context.BooksModel.count({
          where: { authorId: author.id, userId: req.user.id }, // Filter by userId to ensure only books of the logged-in user are counted
        });

        return {
          ...author.dataValues,
          bookCount: bookCount,
        };
      })
    );

    res.render("authors", {
      authorsList: authors,
      hasAuthors: authors.length > 0,
      "page-title": "Mantenimiento de Autores",
    });
  } catch (error) {
    console.error("Error fetching authors:", error);
    res.render("authors", {
      authorsList: [],
      hasAuthors: false,
      error: "Error al cargar los autores",
      "page-title": "Mantenimiento de Autores",
    });
  }
}

export function GetCreate(req, res) {
  res.render("authors/save", {
    editMode: false,
    "page-title": "Crear Nuevo Autor",
  });
}

export async function PostCreate(req, res) {
  const name = req.body.Name;
  const email = req.body.Email;

  try {
    await context.AuthorsModel.create({
      name: name,
      email: email,
      userId: req.user.id, // Assuming you want to associate the author with the logged-in user
    });
    req.flash("success", "Autor creado exitosamente.");
    return res.redirect("/authors");
  } catch (error) {
    console.error("Error creating author: ", error);
    res.render("authors/save", {
      editMode: false,
      error:
        "Error al crear el autor. Verifique que el email sea válido y único.",
      formData: { Name: name, Email: email },
      "page-title": "Crear Nuevo Autor",
    });
  }
}

export async function GetEdit(req, res, next) {
  const id = req.params.authorId;

  try {
    const result = await context.AuthorsModel.findOne({
      where: { id: id, userId: req.user.id }, // Ensure the author belongs to the logged-in user,
    });
    if (!result) {
      return res.redirect("/authors");
    }
    const author = result.dataValues;
    res.render("authors/save", {
      editMode: true,
      author: author,
      "page-title": `Editar Autor: ${author.name}`,
    });
  } catch (error) {
    console.error("Error fetching authors for edit:", error);
    res.redirect("/authors");
  }
}

export async function PostEdit(req, res, next) {
  const name = req.body.Name;
  const email = req.body.Email;
  const id = req.body.authorId;

  try {
    const result = await context.AuthorsModel.findOne({
      where: { id: id, userId: req.user.id }, // Ensure the author belongs to the logged-in user,
    });
    if (!result) {
      return res.redirect("/authors");
    }
    await context.AuthorsModel.update(
      { name: name, email: email, userId: req.user.id },
      { where: { id: id } }
    );
    req.flash("success", "Autor actualizado exitosamente.");
    res.redirect("/authors");
  } catch (error) {
    console.error("Error fetching author for edit: ", error);
    res.redirect("/authors");
  }
}

export async function GetDelete(req, res, next) {
  const id = req.params.authorId;

  try {
    const result = await context.AuthorsModel.findOne({
      where: { id: id, userId: req.user.id },
    }); // Ensure the author belongs to the logged-in user
    if (!result) {
      return res.redirect("/authors");
    }

    const bookCount = await context.BooksModel.count({
      where: { authorId: id, userId: req.user.id }, // Filter by userId to ensure only books of the logged-in user are counted
    });

    const author = result.dataValues;
    res.render("authors/delete", {
      author: author,
      bookCount: bookCount,
      "page-title": `Eliminar Autor: ${author.name}`,
    });
  } catch (error) {
    console.error("Error fetching author for delete:", error);
    res.redirect("/authors");
  }
}

export async function PostDelete(req, res, next) {
  const id = req.body.authorId;

  try {
    const bookCount = await context.BooksModel.count({
      where: { authorId: id, userId: req.user.id }, // Filter by userId to ensure only books of the logged-in user are counted
    });

    if (bookCount > 0) {
      const result = await context.AuthorsModel.findOne({
        where: { id: id, userId: req.user.id },
      }); // Ensure the author belongs to the logged-in user
      const author = result.dataValues;

      return res.render("authors/delete", {
        author: author,
        bookCount: bookCount,
        error: `No se puede eliminar este autor porque tiene ${bookCount} libro(s) asociado(s).`,
        "page-title": `Eliminar Autor: ${author.name}`,
      });
    }

    await context.AuthorsModel.destroy({
      where: { id: id, userId: req.user.id },
    });
    req.flash("success", "Autor eliminado exitosamente.");
    return res.redirect("/authors");
  } catch (error) {
    console.error("Error deleting author:", error);
    res.redirect("/authors");
  }
}
