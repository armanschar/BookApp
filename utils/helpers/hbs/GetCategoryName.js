export function GetCategoryName(categoriesList, categoryId) {
  if (!categoriesList || !categoryId) return "Sin categoría";
  const category = categoriesList.find((c) => Number(c.id) === Number(categoryId));
  return category ? category.name : "Sin categoría";
}
