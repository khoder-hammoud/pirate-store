const pagination = (query) => {
  let page = Number(query.page) || 1;
  let limit = Number(query.limit) || 10;

  const maxLimit = 100;

  if (limit > maxLimit) {
    limit = maxLimit;
  }

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

module.exports = pagination;