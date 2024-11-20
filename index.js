const express = require('express')
const cookieParser = require('cookie-parser')
const router = require('./routes/router')
const cors= require('cors')

require('dotenv').config();
const {PORT} = process.env;

const app = express();

app.use(express.json())
app.use(cookieParser());
app.use(cors());


//for testing purpose wether server is working or not
app.get("/", (req, res) => {
    return res.json({success: true, message: " Server is up"})
})


//api Endpoint
app.use("/api/v1", router);


//starting server
app.listen(PORT, () => {
    console.log(`App is listening at port: ${PORT}`)
})
