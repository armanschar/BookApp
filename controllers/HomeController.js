import BooksModel from "../models/BooksModel.js";
import CategoriesModel from "../models/CategoriesModel.js";
import PublishersModel from "../models/PublishersModel.js";
import AuthorsModel from "../models/AuthorsModel.js";

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
        $regex: searchTerm, // Case-insensitive search
        $options: 'i'
      };
    }
    if (selectedCategories.length > 0) {
      whereConditions.categoryId = {
        $in: selectedCategories
      };
    }

    const booksResult = await BooksModel.find(whereConditions)
      .sort({ createdAt: -1 })
      .lean();

    const categoriesResult = await CategoriesModel.find({ userId: req.user.id })
      .select('name')
      .sort({ name: 1 })
      .lean();

    const authorsResult = await AuthorsModel.find({ userId: req.user.id })
      .select('name')
      .lean();

    const publishersResult = await PublishersModel.find({ userId: req.user.id })
      .select('name country phone')
      .lean();

    // Filter selectedCategories to only those belonging to the current user
    const validCategoryIds = categoriesResult.map(c => c._id.toString());
    const filteredSelectedCategories = selectedCategories.filter(catId => validCategoryIds.includes(String(catId)));

    res.render("home/home", {
      booksList: booksResult,
      categoriesList: categoriesResult,
      authorsList: authorsResult,         
      publishersList: publishersResult,   
      hasBooks: booksResult.length > 0,
      hasCategories: categoriesResult.length > 0,
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