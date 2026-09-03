const app = require('./app');
const connectDB = require('./config/database');
const dotenv = require('dotenv');

//config:
dotenv.config({path:'backend/config/config.env'});

// db connection 
// make sure that this will be called after the config.env file is loaded
connectDB();

// setting up server
app.listen(process.env.PORT ,()=>{
    console.log(`Server is running on port https://localhost:${process.env.PORT}`);

})
