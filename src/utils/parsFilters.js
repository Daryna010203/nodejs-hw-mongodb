const parseBoolean = (string) => {
  if (['true', 'false'].includes(string)) return JSON.parse(string);
};

export const parsFilters = (filter) => {
  return {
    isFavourite: parseBoolean(filter.isFavourite),
  };
};
