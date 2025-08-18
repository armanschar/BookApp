import { create } from "express-handlebars";
import BooksModel from "../models/BooksModel.js";
import PublishersModel from "../models/PublishersModel.js";

export async function GetIndex(req, res) {
  try {
    const result = await PublishersModel.find({
      userId: req.user.id, // Ensure the publishers belong to the logged-in user
    }).sort({ createdAt: -1 })
    .lean();

    const publishers = await Promise.all(
      result.map(async (publisher) => {
        const bookCount = await BooksModel.countDocuments({
          publisherId: publisher._id,
          userId: req.user.id // Filter by userId to ensure only books of the logged-in user are counted
        });

        return {
          ...publisher,
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

  const {name,phone, country} = req.body;

 
  try {
    await PublishersModel.create({
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
    const result = await PublishersModel.findOne({
      _id: id,
      userId: req.user.id,
    }).lean();
    if (!result) {
      return res.redirect("/publishers");
    }
    res.render("publishers/save", {
      editMode: true,
      publisher: result,
      "page-title": `Editar editorial: ${result.name}`,
    });
  } catch (error) {
    console.error("Error fetching publishers for edit:", error);
    res.redirect("/publishers");
  }
}

export async function PostEdit(req, res, next) {
  const { name, phone, country, publisherId } = req.body;

  

  try {
    const result = await PublishersModel.findOne({
      _id: publisherId,
      userId: req.user.id,
    });
    if (!result) {
      return res.redirect("/publishers");
    }
    await PublishersModel.findByIdAndUpdate(
      { _id: publisherId, userId: req.user.id },
      { name: name, phone: phone, country: country }
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
    const result = await PublishersModel.findOne({
      _id: id,
      userId: req.user.id,
    }).lean(); // Ensure the publisher belongs to the logged-in user
    if (!result) {
      return res.redirect("/publishers");
    }

    const bookCount = await BooksModel.countDocuments({
      publisherId: id,
      userId: req.user.id, // Ensure the book count is for the logged-in user
    });

    res.render("publishers/delete", {
      publisher: result,
      bookCount: bookCount,
      "page-title": `Eliminar Editorial: ${result.name}`,
    });
  } catch (error) {
    console.error("Error fetching publisher for delete:", error);
    res.redirect("/publishers");
  }
}

export async function PostDelete(req, res, next) {
  const id = req.body.publisherId;

  try {
    const bookCount = await BooksModel.countDocuments({
      publisherId: id,
      userId: req.user.id, // Ensure the book count is for the logged-in user
    });

    if (bookCount > 0) {
      const result = await PublishersModel.findOne({
        _id: id,
        userId: req.user.id,
      }); // Ensure the publisher belongs to the logged-in user

      return res.render("publishers/delete", {
        publisher: result,
        bookCount: bookCount,
        error: `No se puede eliminar esta editorial porque tiene ${bookCount} libro(s) asociado(s).`,
        "page-title": `Eliminar Editorial: ${result.name}`,
      });
    }

    await PublishersModel.deleteOne({
      _id: id,
      userId: req.user.id,
    }); // Ensure the publisher belongs to the logged-in user
    return res.redirect("/publishers");
  } catch (error) {
    console.error("Error deleting publisher:", error);
    res.redirect("/publishers");
  }
}
