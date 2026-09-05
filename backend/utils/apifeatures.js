class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }
    search() {
        const keyword = this.queryStr.keyword ? {
            name: { $regex: this.queryStr.keyword, $options: 'i' }
        } : {}

        this.query = this.query.find({ ...keyword });
        return this;
    }
    filter() {
        const queryCopy = { ...this.queryStr };
        console.log(queryCopy)
        // removing some fields for category
        const removeFields = ['keyword', 'page', 'limit'];
        removeFields.forEach(key => delete queryCopy[key]);

        // filter making for proce and reviews :
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => {
            return `$${match}`;
        });
        // whenever we see tjis.query remember that it is actually the product.find() 
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    pagination(resultsPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultsPerPage * (currentPage - 1);
        this.query = this.query.limit(resultsPerPage).skip(skip);
        return this;
    }
};
module.exports = ApiFeatures;