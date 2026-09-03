const mongoose = require('mongoose');

const connectDB = () => {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true, useUnifiedTopology: true
        , useCreateIndex: true
    }).then((data) => {
        console.log(`Mongodb connected successfully with server: ${data.connection.host}`)
    }).catch((err) => {
        console.log(`Mongodb connection failed: ${err.message}`)
    })
}

module.exports = connectDB;