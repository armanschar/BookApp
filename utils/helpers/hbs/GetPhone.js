export function GetPhone(publishersList, publisherId) {
  if (!publishersList || !publisherId) return "Sin teléfono";
  const publisher = publishersList.find((p) => p._id.toString() === publisherId.toString());
  return publisher && publisher.phone ? publisher.phone : "Sin teléfono";
}