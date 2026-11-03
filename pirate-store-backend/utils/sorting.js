const sorting = (query) =>{
    return query.sort ? query.sort.replace(/,/g, ' ') : "-createdAt";

};
module.exports = sorting ;
