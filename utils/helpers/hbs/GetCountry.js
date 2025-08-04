export function GetCountry(publishersList, publisherId) {
  if (!publishersList || !publisherId) return "Sin país";
  const publisher = publishersList.find((p) => Number(p.id) === Number(publisherId));
  return publisher && publisher.country ? publisher.country : "Sin país";
}
