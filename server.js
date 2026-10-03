const express = require('express')
const cors = require('cors');
const app = express()
const connectDB = require('./conect')
const AdminRouter = require('./routes/AdminRouts')
const errorHandler = require('./middlewares/errorhandler');
require('dotenv').config();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://aura-sigma-ashen.vercel.app'
  ]
}));
app.use(express.json())
app.use('/admin',AdminRouter)
app.use(errorHandler);
connectDB()
app.listen(4000,()=>{
    console.log('server is running on port 4000')
})
