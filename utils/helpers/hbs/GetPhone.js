export function GetPhone(publishersList, publisherId) {
  if (!publishersList || !publisherId) return "Sin teléfono";
  const publisher = publishersList.find((p) => Number(p.id) === Number(publisherId));
  return publisher && publisher.phone ? publisher.phone : "Sin teléfono";
}