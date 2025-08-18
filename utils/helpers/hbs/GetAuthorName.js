export function GetAuthorName(authorsList, authorId) {
  if (!authorsList || !authorId) return "Sin autor";
  const author = authorsList.find((a) => a._id.toString() === authorId.toString());
  return author ? author.name : "Sin autor";
}
