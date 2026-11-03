const normalizeSort = ({ sort, sortBy, sortOrder }) => {
  if (sortBy) {
    return {
      sortBy,
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc'
    };
  }

  if (sort) {
    const s = String(sort).trim();

    if (!s) {
      return { sortBy: 'createdAt', sortOrder: 'desc' };
    }

    if (s.startsWith('-')) {
      return {
        sortBy: s.slice(1),
        sortOrder: 'desc'
      };
    }

    return {
      sortBy: s,
      sortOrder: 'asc'
    };
  }

  return {
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };
};

const parseSelectFields = (fields) => {
  if (!fields) {
    return undefined;
  }

  if (typeof fields === 'object' && !Array.isArray(fields)) {
    return fields;
  }

  const normalizedFields = Array.isArray(fields)
    ? fields
    : String(fields)
        .split(/[\s,]+/)
        .filter(Boolean);

  return normalizedFields.reduce((select, field) => {
    select[field] = true;
    return select;
  }, {});
};

const sanitizeWhere = (where = {}) => {
  const cleaned = {};

  Object.entries(where).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (key === 'OR' || key === 'AND' || key === 'NOT') {
      cleaned[key] = Array.isArray(value)
        ? value.map((item) => sanitizeWhere(item))
        : sanitizeWhere(value);
      return;
    }

    if (Array.isArray(value)) {
      const filteredValues = value.filter((item) => item !== undefined && item !== null && item !== '');

      if (filteredValues.length > 0) {
        cleaned[key] = { in: filteredValues };
      }

      return;
    }

    if (typeof value === 'object' && !(value instanceof Date)) {
      cleaned[key] = value;
      return;
    }

    cleaned[key] = value;
  });

  return cleaned;
};

const buildPrismaQuery = ({
  query = {},
  page = 1,
  limit = 10,
  sort,
  sortBy,
  sortOrder,
  filters = {},
  search = '',
  searchFields = [],
  select,
  include
} = {}) => {
  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const currentLimit = Number(limit) > 0 ? Number(limit) : 10;

  const excludedKeys = new Set([
    'page',
    'limit',
    'sort',
    'sortBy',
    'sortOrder',
    'fields',
    'keyword',
    'search'
  ]);

  const queryFilters = {};

  Object.entries(query).forEach(([key, value]) => {
    if (excludedKeys.has(key)) {
      return;
    }

    if (value === undefined || value === null || value === '') {
      return;
    }

    queryFilters[key] = value;
  });

  const finalFilters = sanitizeWhere({
    ...queryFilters,
    ...sanitizeWhere(filters)
  });

  const activeSearch = String(search || query.keyword || '').trim();
  const finalWhere = { ...finalFilters };

  if (activeSearch && searchFields.length > 0) {
    finalWhere.OR = searchFields.map((field) => ({
      [field]: {
        contains: activeSearch,
        mode: 'insensitive'
      }
    }));
  }

  const { sortBy: resolvedSortBy, sortOrder: resolvedSortOrder } = normalizeSort({
    sort,
    sortBy: sortBy || query.sortBy,
    sortOrder: sortOrder || query.sortOrder
  });

  return {
    where: finalWhere,
    orderBy: {
      [resolvedSortBy]: resolvedSortOrder
    },
    skip: (currentPage - 1) * currentLimit,
    take: currentLimit,
    select: parseSelectFields(select || query.fields),
    include
  };
};

const buildPaginationMeta = ({ total, page, limit }) => {
  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const currentLimit = Number(limit) > 0 ? Number(limit) : 10;
  const totalPages = Math.ceil(total / currentLimit) || 1;

  return {
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

module.exports = {
  buildPrismaQuery,
  buildPaginationMeta,
  parseSelectFields,
  sanitizeWhere
};
