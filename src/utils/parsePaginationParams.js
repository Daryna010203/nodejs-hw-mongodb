const parseNumber = (string, defaultValue) => {
  const number = Number(string);

  if (Number.isNaN(number)) {
    return defaultValue;
  }

  return number;
};

export const parsePaginationParams = (query) => {
  const page = parseNumber(query.page, 1);
  const perPage = parseNumber(query.perPage, 10);
  return {
    page,
    perPage,
  };
};
