const mongoose = require('mongoose');
const slugify = require("slugify");
const productSchema = new mongoose.Schema ({
    name:{
        type: String,
        required: [true,"Product name is required"],
        trim:true///لحتى ما يكون في مسافات زياده بالاسم 
    },
    description:{
        type: String,
        required: [true, "Product description is required"]
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        default: 0
    },
    category: {
        type: String,
        required: [true, "Product category is required"]
    },
    countInStock: {
        type: Number,
        required: [true, "Stock count is required"],
        default: 0
    },
    image: {
        type: String,
        required: [true, "Product image is required"]
    },
    rating: {
        type: Number,
        default: 0
    },
        numReviews: {
        type: Number,
        default: 0//قيمه بدائيه 
    },
    
}, { timestamps: true });///لحتى يضفلي تاريخ انشاء وتاريخ تحديث للمنتج


module.exports = mongoose.model('Product', productSchema);
//قابل للتطويرقابل للتطوير حيث فينا نضيف بعدين reviews و ratigs وغيرها من الخصاءص للمنتج 
