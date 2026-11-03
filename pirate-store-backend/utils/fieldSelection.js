const fieldSelection = (query) => {

    return query.fields ? query.fields.replaceAll("," , " ") : null;
}
module.exports = fieldSelection;
