
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require("./routes/orderRoutes");
const refundRoutes = require('./routes/refundRoutes');
dotenv.config();

// الاتصال بقاعدة البيانات
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.get('/', (req, res) => {
    res.send('API is running ');
});
app.use("/api/orders", orderRoutes);
app.use('/api/refunds', refundRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


