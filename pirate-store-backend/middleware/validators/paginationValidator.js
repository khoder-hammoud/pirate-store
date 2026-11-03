const AppError = require('../../utils/AppError');

const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if (page) {
    const pageNum = Number(page);

    if (!Number.isInteger(pageNum) || pageNum < 1) {
      return next(new AppError('Invalid page number', 400));
    }
  }

  if (limit) {
    const limitNum = Number(limit);

    if (!Number.isInteger(limitNum) || limitNum < 1) {
      return next(new AppError('Invalid limit value', 400));
    }
  }

  next();
};
const sortvalidator = (req, res, next) => {
  const allowedSortFields = [
  'price',
  '-price',
  'name',
  '-name',
  'createdAt',
  '-createdAt',
  'rating',
  '-rating'
];
  if (!req.query.sort) {
    next();
  } else {
    const sortField = req.query.sort;
    if (!allowedSortFields.includes(sortField)) {
      return next(new AppError('Invalid sort field', 400));
    }
    next();
  }
};
const keywordValidator = (req, res, next) => {
  const keyword = req.query.keyword?.trim();

if (req.query.keyword !== undefined && keyword === "") {
    return next(new AppError("Keyword cannot be empty.", 400));
}

  if (keyword && keyword.length > 50 && keyword === "" && !/^[a-zA-Zا-ي\s]+$/.test(keyword)) {
    return next(new AppError("Invalid keyword", 400));
  }

  next();
};
const allowedFields = [
  'name',
  'price',
  'category',
  'rating',
  'createdAt'

];
const fieldSelectionValidator = (req, res, next) => {
  if (req.query.fields === undefined ){

    return next();
  } 

const fields = req.query.fields?.trim();

  if(!fields) {
    return next(new AppError("Fields cannot be empty.", 400));};


     const isValid = fields.split(',').map(field => field.trim()).every(field => allowedFields.includes(field));
     if (!isValid){
      return next(new AppError("Invalid fields", 400));
     };
     next();
  };                                                                             

module.exports = {
  validatePagination,
  sortvalidator,
  keywordValidator,
  fieldSelectionValidator
};