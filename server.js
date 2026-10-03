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
    'https://aura-ppcu2y5p3-abdallas-projects-5164a1a1.vercel.app'
  ],
  credentials: true
}));
app.use(express.json())
app.use('/admin',AdminRouter)
app.use(errorHandler);
connectDB()
app.listen(4000,()=>{
    console.log('server is running on port 4000')
})
