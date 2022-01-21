//connect to mongoose

const mongoose = require('mongoose')

const myModule = require('./constants')
const mongoURI = myModule.mongoURI

const connectToMongo = ()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("Connected to server successfully")
    })
}

module.exports = connectToMongo;