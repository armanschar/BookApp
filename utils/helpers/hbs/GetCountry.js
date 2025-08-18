export function GetCountry(publishersList, publisherId) {
  if (!publishersList || !publisherId) return "Sin país";
  const publisher = publishersList.find((p) => p._id.toString() === publisherId.toString());
  return publisher && publisher.country ? publisher.country : "Sin país";
}
