const searching = (query) =>{

    if (!query.keyword) {
        return {};
    }{
        return {
            $or:[
                { name: { $regex: query.keyword, $options: 'i' } },
                { description: { $regex: query.keyword, $options: 'i' } }
            ]
        }
    };

};

module.exports = searching;