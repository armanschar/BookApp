import CategoriesModel from "../models/CategoriesModel.js";
import BooksModel from "../models/BooksModel.js";

export async function GetIndex(req, res) {
  try {
    const result = await CategoriesModel.find({
      userId: req.user.id, // Assuming you want to filter by the logged-in user
    })
      .sort({ createdAt: -1 })
      .lean(); // Sort by createdAt in descending order
    //for ascending order use 1

    // Add book count to each category
    const categories = await Promise.all(
      result.map(async (category) => {
        const bookCount = await BooksModel.countDocuments({
          categoryId: category._id,
          userId: req.user.id, // Filter by userId to ensure only books of the logged-in user are counted
        });

        return {
          ...category,
          id: category._id, // Add id field for compatibility
          bookCount: bookCount,
        };
      })
    );

    res.render("categories", {
      categoriesList: categories,
      hasCategories: categories.length > 0,
      "page-title": "Mantenimiento de Categorias",
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.render("categories", {
      categoriesList: [],
      hasCategories: false,
      error: "Error al cargar las categorías",
      "page-title": "Mantenimiento de Categorias",
    });
  }
}

export function GetCreate(req, res) {
  res.render("categories/save", {
    editMode: false,
    "page-title": "Crear Nueva Categoria",
  });
}

export async function PostCreate(req, res) {
  const { name, description } = req.body;

  try {
    await CategoriesModel.create({
      name: name,
      description: description,
      userId: req.user.id, // Assuming you want to associate the category with the logged-in user
    });
    return res.redirect("/categories");
  } catch (error) {
    console.error("Error creating category: ", error);
    res.render("categories/save", {
      editMode: false,
      error: "Error al crear la categoría",
      formData: { Name: name, Description: description },
      "page-title": "Crear Nueva Categoria",
    });
  }
}

export async function GetEdit(req, res, next) {
  const id = req.params.categoryId;

  try {
    const result = await CategoriesModel.findOne({
      _id: id,
      userId: req.user.id, // Ensure the category belongs to the logged-in user
    }).lean(); //convert to plain js object
    if (!result) {
      return res.redirect("/categories");
    }
    res.render("categories/save", {
      editMode: true,
      category: result,
      "page-title": `Editar categoría: ${result.name}`,
    });
  } catch (error) {
    console.error("Error fetching categories for edit:", error);
    res.redirect("/categories");
  }
}

export async function PostEdit(req, res, next) {
  const { name, description, categoryId } = req.body;

  try {
    const result = await CategoriesModel.findOne({
      _id: categoryId,
      userId: req.user.id, // Ensure the category belongs to the logged-in user
    });
    if (!result) {
      return res.redirect("/categories");
    }
    await CategoriesModel.findByIdAndUpdate(categoryId, {
      name: name,
      description: description,
      userId: req.user.id,
    });
    res.redirect("/categories");
  } catch (error) {
    console.error("Error fetching category for edit: ", error);
    res.redirect("/categories");
  }
}

export async function GetDelete(req, res, next) {
  const id = req.params.categoryId;

  try {
    const result = await CategoriesModel.findOne({
      _id: id,
      userId: req.user.id,
    }).lean(); // Ensure the category belongs to the logged-in user
    if (!result) {
      return res.redirect("/categories");
    }

    const bookCount = await BooksModel.countDocuments({
      categoryId: id,
      userId: req.user.id, // Ensure the book count is for the logged-in user
    });

    res.render("categories/delete", {
      category: result,
      bookCount: bookCount,
      "page-title": `Eliminar Categoría: ${result.name}`,
    });
  } catch (error) {
    console.error("Error fetching category for delete:", error);
    res.redirect("/categories");
  }
}

export async function PostDelete(req, res, next) {
  const id = req.body.categoryId;

  try {
    const bookCount = await BooksModel.countDocuments({
      categoryId: id,
      userId: req.user.id, // Ensure the book count is for the logged-in user
    });

    if (bookCount > 0) {
      const result = await CategoriesModel.findOne({
        _id: id,
        userId: req.user.id,
      }); // Ensure the category belongs to the logged-in user

      return res.render("categories/delete", {
        category: result,
        bookCount: bookCount,
        error: `No se puede eliminar esta categoría porque tiene ${bookCount} libro(s) asociado(s).`,
        "page-title": `Eliminar Categoría: ${result.name}`,
      });
    }

    await CategoriesModel.deleteOne({
      _id: id,
      userId: req.user.id,
    });
    return res.redirect("/categories");
  } catch (error) {
    console.error("Error deleting category:", error);
    res.redirect("/categories");
  }
}
