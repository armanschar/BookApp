export function GetAuthorName(authorsList, authorId) {
  if (!authorsList || !authorId) return "Sin autor";
  const author = authorsList.find((a) => Number(a.id) === Number(authorId));
  return author ? author.name : "Sin autor";
}
