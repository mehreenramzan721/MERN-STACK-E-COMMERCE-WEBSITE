const mongoose = require('mongoose');

const connectDB = () => {
    // these options are no longer supported in mongoose 6.x, so they can be removed. they are deprecated now.
    // mongoose.connect(process.env.MONGODB_URI, {
    //     useNewUrlParser: true, useUnifiedTopology: true
    //     , useCreateIndex: true
    mongoose.connect(process.env.MONGODB_URI).then((data) => {
        console.log(`Mongodb connected successfully with server: ${data.connection.host}`)
    })
}

module.exports = connectDB;