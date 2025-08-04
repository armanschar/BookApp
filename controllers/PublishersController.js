import { where } from "sequelize";
import context from "../context/AppContext.js";

export async function GetIndex(req, res) {
  try {
    const publishersResult = await context.PublishersModel.findAll({
      where: { userId: req.user.id }, // Assuming you want to filter by the logged-in user
      order: [["name", "ASC"]],
    });

    const publishers = await Promise.all(
      publishersResult.map(async (publisher) => {
        const bookCount = await context.BooksModel.count({
          where: { publisherId: publisher.id, userId: req.user.id }, // Filter by userId to ensure only books of the logged-in user are counted
        });

        return {
          ...publisher.dataValues,
          bookCount: bookCount,
        };
      })
    );

    res.render("publishers", {
      publishersList: publishers,
      hasPublishers: publishers.length > 0,
      "page-title": "Mantenimiento de Editoriales",
    });
  } catch (error) {
    console.error("Error fetching publishers:", error);
    res.render("publishers", {
      publishersList: [],
      hasPublishers: false,
      error: "Error al cargar las editoriales",
      "page-title": "Mantenimiento de Editoriales",
    });
  }
}

export function GetCreate(req, res) {
  res.render("publishers/save", {
    editMode: false,
    "page-title": "Crear Nueva Editorial",
  });
}

export async function PostCreate(req, res) {
  const name = req.body.Name;
  const phone = req.body.Phone;
  const country = req.body.Country;

  try {
    await context.PublishersModel.create({
      name: name,
      phone: phone,
      country: country,
      userId: req.user.id, // Assuming you want to associate the publisher with the logged-in user
    });
    return res.redirect("/publishers");
  } catch (error) {
    console.error("Error creating publisher: ", error);
    res.render("publishers/save", {
      editMode: false,
      error: "Error al crear la editorial. Por favor, intente nuevamente.",
      formData: { Name: name, Phone: phone, Country: country },
      "page-title": "Crear Nueva Editorial",
    });
  }
}

export async function GetEdit(req, res, next) {
  const id = req.params.publisherId;

  try {
    const result = await context.PublishersModel.findOne({
      where: { id: id, userId: req.user.id }, // Ensure the publisher belongs to the logged-in user
    });
    if (!result) {
      return res.redirect("/publishers");
    }
    const publisher = result.dataValues;
    res.render("publishers/save", {
      editMode: true,
      publisher: publisher,
      "page-title": `Editar editorial: ${publisher.name}`,
    });
  } catch (error) {
    console.error("Error fetching publishers for edit:", error);
    res.redirect("/publishers");
  }
}

export async function PostEdit(req, res, next) {
  const name = req.body.Name;
  const phone = req.body.Phone;
  const country = req.body.Country;
  const id = req.body.publisherId;

  try {
    const result = await context.PublishersModel.findOne({
      where: { id: id, userId: req.user.id }, // Ensure the publisher belongs to the logged-in user,
    });
    if (!result) {
      return res.redirect("/publishers");
    }
    await context.PublishersModel.update(
      { name: name, phone: phone, country: country, userId: req.user.id },
      { where: { id: id } }
    );
    res.redirect("/publishers");
  } catch (error) {
    console.error("Error fetching publisher for edit: ", error);
    res.redirect("/publishers");
  }
}

export async function GetDelete(req, res, next) {
  const id = req.params.publisherId;

  try {
    const result = await context.PublishersModel.findOne({
      where: { id: id, userId: req.user.id },
    }); // Ensure the publisher belongs to the logged-in user
    if (!result) {
      return res.redirect("/publishers");
    }

    const bookCount = await context.BooksModel.count({
      where: { publisherId: id, userId: req.user.id }, // Ensure the book count is for the logged-in user
    });

    const publisher = result.dataValues;
    res.render("publishers/delete", {
      publisher: publisher,
      bookCount: bookCount,
      "page-title": `Eliminar Editorial: ${publisher.name}`,
    });
  } catch (error) {
    console.error("Error fetching publisher for delete:", error);
    res.redirect("/publishers");
  }
}

export async function PostDelete(req, res, next) {
  const id = req.body.publisherId;

  try {
    const bookCount = await context.BooksModel.count({
      where: { publisherId: id, userId: req.user.id }, // Ensure the book count is for the logged-in user
    });

    if (bookCount > 0) {
      const result = await context.PublishersModel.findOne({
        where: { id: id, userId: req.user.id },
      }); // Ensure the publisher belongs to the logged-in user
      const publisher = result.dataValues;

      return res.render("publishers/delete", {
        publisher: publisher,
        bookCount: bookCount,
        error: `No se puede eliminar esta editorial porque tiene ${bookCount} libro(s) asociado(s).`,
        "page-title": `Eliminar Editorial: ${publisher.name}`,
      });
    }

    await context.PublishersModel.destroy({
      where: { id: id, userId: req.user.id },
    });
    return res.redirect("/publishers");
  } catch (error) {
    console.error("Error deleting publisher:", error);
    res.redirect("/publishers");
  }
}
