import context from "../context/AppContext.js";
import { Op, where } from "sequelize";

export async function GetIndex(req, res) {
  try {
    const categoriesResult = await context.CategoriesModel.findAll({
      where: { userId: req.user.id }, // Assuming you want to filter by the logged-in user
      order: [['name', 'ASC']]
    });

    const categories = await Promise.all(
      categoriesResult.map(async (category) => {
        const bookCount = await context.BooksModel.count({
          where: { categoryId: category.id, userId: req.user.id } // Filter by userId to ensure only books of the logged-in user are counted
        });
        
        return {
          ...category.dataValues,
          bookCount: bookCount
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
  const name = req.body.Name;
  const description = req.body.Description;

  try {
    await context.CategoriesModel.create({
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
    const result = await context.CategoriesModel.findOne({
      where: { id: id, userId: req.user.id }, // Ensure the category belongs to the logged-in user
    });
    if (!result) {
      return res.redirect("/categories");
    }
    const category = result.dataValues;
    res.render("categories/save", {
      editMode: true,
      category: category,
      "page-title": `Editar categoría: ${category.name}`,
    });
  } catch (error) {
    console.error("Error fetching categories for edit:", error);
    res.redirect("/categories");
  }
}

export async function PostEdit(req, res, next){
  const name = req.body.Name;
  const description = req.body.Description
  const id = req.body.categoryId

  try{
    const result = await context.CategoriesModel.findOne({
      where: {id: id, userId: req.user.id} // Ensure the category belongs to the logged-in user,
    });
    if (!result){
      return res.redirect("/categories");
    }
    await context.CategoriesModel.update({name:name, description:description, userId:req.user.id}, {where: {id:id}});
    res.redirect("/categories")
  }catch(error){
    console.error("Error fetching category for edit: ", error)
    res.redirect("/categories");
  }
}

export async function GetDelete(req, res, next) {
  const id = req.params.categoryId

  try{
    const result = await context.CategoriesModel.findOne({where: {id:id, userId: req.user.id}}); // Ensure the category belongs to the logged-in user
    if (!result){
      return res.redirect("/categories");
    }
    
    const bookCount = await context.BooksModel.count({
      where: { categoryId: id, userId: req.user.id } // Ensure the book count is for the logged-in user
    });
    
    const category = result.dataValues;
    res.render("categories/delete",{
      category: category,
      bookCount: bookCount,
      "page-title": `Eliminar Categoría: ${category.name}`,
    });
  }catch(error){
    console.error("Error fetching category for delete:", error);
    res.redirect("/categories");
  }
}

export async function PostDelete(req, res, next) {
  const id = req.body.categoryId;

  try{
    const bookCount = await context.BooksModel.count({
      where: { categoryId: id, userId: req.user.id } // Ensure the book count is for the logged-in user
    });
    
    if (bookCount > 0) {
      const result = await context.CategoriesModel.findOne({where: {id:id, userId: req.user.id}}); // Ensure the category belongs to the logged-in user
      const category = result.dataValues;
      
      return res.render("categories/delete", {
        category: category,
        bookCount: bookCount,
        error: `No se puede eliminar esta categoría porque tiene ${bookCount} libro(s) asociado(s).`,
        "page-title": `Eliminar Categoría: ${category.name}`,
      });
    }
    
    await context.CategoriesModel.destroy({ where: { id: id, userId:req.user.id } });
    return res.redirect("/categories");
  }catch (error) {
    console.error("Error deleting category:", error);
    res.redirect("/categories");
  }
}