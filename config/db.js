const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
    try{
        mongoose.connect(db, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB Connected");
    } catch (err){
        console.log(err.message);
        //exit process with fail
        process.exit(1);
    }
}

module.exports = connectDB;