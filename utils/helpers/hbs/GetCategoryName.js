export function GetCategoryName(categoriesList, categoryId) {
  if (!categoriesList || !categoryId) return "Sin categoría";
  const category = categoriesList.find((c) => c._id.toString() === categoryId.toString());
  return category ? category.name : "Sin categoría";
}
