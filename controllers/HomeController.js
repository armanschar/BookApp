
import context from "../context/AppContext.js";
import { Op, where } from "sequelize";

export async function GetHome(req, res, next) {
  try {
    const searchTerm = req.query.search || '';
    const selectedCategories = req.query.category ? 
      (Array.isArray(req.query.category) ? req.query.category : [req.query.category]) : [];
    
    let whereConditions = {};
    // Only show books created by the current user
    if (req.user && req.user.id) {
      whereConditions.userId = req.user.id;
    }
    if (searchTerm) {
      whereConditions.title = {
        [Op.like]: `%${searchTerm}%`
      };
    }
    if (selectedCategories.length > 0) {
      whereConditions.categoryId = {
        [Op.in]: selectedCategories
      };
    }

    const booksResult = await context.BooksModel.findAll({
      where: whereConditions,
      include: [
        { 
          model: context.AuthorsModel,
          attributes: ['id', 'name', 'email']
        },
        { 
          model: context.CategoriesModel,
          attributes: ['id', 'name', 'description']
        },
        { 
          model: context.PublishersModel,
          attributes: ['id', 'name', 'country', 'phone']
        },
      ],
      order: [['createdAt', 'DESC']] 
    });

    const categoriesResult = await context.CategoriesModel.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    const authorsResult = await context.AuthorsModel.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'name']
    });

    const publishersResult = await context.PublishersModel.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'name']
    });

    const books = booksResult.map((result) => result.dataValues);
    const categories = categoriesResult.map((c) => c.dataValues);
    const authors = authorsResult.map((a) => a.dataValues);
    const publishers = publishersResult.map((p) => p.dataValues);

    // Filter selectedCategories to only those belonging to the current user
    const validCategoryIds = categories.map(c => String(c.id));
    const filteredSelectedCategories = selectedCategories.filter(catId => validCategoryIds.includes(String(catId)));

    res.render("home/home", {
      booksList: books,
      categoriesList: categories,
      authorsList: authors,         
      publishersList: publishers,   
      hasBooks: books.length > 0,
      hasCategories: categories.length > 0,
      searchTerm: searchTerm,
      selectedCategories: filteredSelectedCategories,
      "page-title": "BookApp - Inicio",
    });
  } catch (error) {
    console.error("Error fetching books for home:", error);
    res.render("home/home", {
      booksList: [],
      categoriesList: [],
      authorsList: [],
      publishersList: [],
      hasBooks: false,
      hasCategories: false,
      searchTerm: '',
      selectedCategories: [],
      error: "Error al cargar los libros",
      "page-title": "BookApp - Inicio",
    });
  }
}