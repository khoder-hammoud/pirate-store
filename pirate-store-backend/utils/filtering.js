const filtering = (query) => {
  const excludedFields = [
    'page',
    'limit',
    'sort',
    'fields',
    'keyword'

  ];

  const queryObj = { ...query };

  excludedFields.forEach((el) => {
    delete queryObj[el];
  });

  return queryObj;
};

module.exports = filtering;