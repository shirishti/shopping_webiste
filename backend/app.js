require('dotenv').config()
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')


const errorMiddleware = require('./middlewares/errors')

dotenv.config({ path: 'backend/config/config.env' })

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

const products = require('./routes/product');
const auth = require('./routes/auth');
const order= require('./routes/order');


app.use('/api/v1', products)
app.use('/api/v1', auth)
app.use('/api/v1', order)


app.use(errorMiddleware);

module.exports = app
