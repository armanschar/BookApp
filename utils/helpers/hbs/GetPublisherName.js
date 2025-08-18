export function GetPublisherName(publishersList, publisherId) {
  if (!publishersList || !publisherId) return "Sin editorial";
  const publisher = publishersList.find((p) => p._id.toString() === publisherId.toString());
  return publisher ? publisher.name : "Sin editorial";
}
