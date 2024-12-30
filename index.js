const express = require("express");
const morgan = require('morgan');
const cors = require('cors');
const path = require("path");
require('dotenv').config();
require('./db.config');
const app = express();
const http = require("http").createServer(app);

const errorHandler = require("./error/errorHandlers");
const CustomError = require("./error/CustomError");

app.use('/Images', express.static(path.join(__dirname, 'Images')));
app.use('/orderFile', express.static(path.join(__dirname, 'orderFile')));

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const AdminRoute = require('./Admin/adminRoute/routes');
app.use('/admin', AdminRoute);

const userRoute = require('./User/userRoute/routes');
app.use('/users', userRoute)

app.all('*', (req, res) => {
    throw new CustomError(`Can't find ${req.originalUrl} on this server!`, 404);
});

app.use(errorHandler);
http.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});