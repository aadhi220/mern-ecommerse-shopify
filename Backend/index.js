// src/index.js
const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
require("./Config/connectDB");
const server = express();
server.use(cors());
server.use(express.json());
const AuthRouter = require("./Routes/AuthRouter");
const ProductRouter =require('./Routes/ProductRouter')
const { errorHandler, notFound } = require("./Middlewares/ErrorHandler");
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
server.use(morgan('dev'))
server.use(cookieParser())
server.use("/api/user", AuthRouter);
server.use('/api/products', ProductRouter)
server.use(notFound);
server.use(errorHandler);


const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

server.get("/", (req, res) => {
  res.send(`<h1> Server successfully started running on port ${port}`);
});
