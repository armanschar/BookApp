export function GetPublisherName(publishersList, publisherId) {
  if (!publishersList || !publisherId) return "Sin editorial";
  const publisher = publishersList.find((p) => Number(p.id) === Number(publisherId));
  return publisher ? publisher.name : "Sin editorial";
}
