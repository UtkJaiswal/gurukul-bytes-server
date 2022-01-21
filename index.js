const connectToMongo = require('./db'); 
const express = require('express');
const cors = require("cors");
const port = require('./constants')
connectToMongo();

const app = express();
app.use(cors());
app.use('/uploads',express.static('uploads')) //make upload folder public so that profile pictures can be accessed easily from client side


app.use(express.json());

//Routes
app.use('/api/auth',require('./routes/auth'));


app.listen(port,()=>{
    console.log(`App listening successfully`)
})