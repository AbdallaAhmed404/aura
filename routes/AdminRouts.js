const express = require('express')
const AdminRouter = express.Router()
const authorized = require('../middlewares/Authorized');
const isAdmin = require('../middlewares/isAdmin');
const {adminLogin,getProducts,addProduct,updateProduct,deleteProduct,
    getAdmins,createAdmin,updateAdmin,deleteAdmin,adminLogout,createNote,
    getNotes,updateNote,deleteNote,getLogs, deleteLog,getDeviceSession, 
    updateDeviceSession, closeDeviceSession,getAllDevices,addDevice,deleteDevice,getDailyReports} = require('../controllers/AdminController')

AdminRouter.post('/login', adminLogin);
AdminRouter.post('/logout', adminLogout);

AdminRouter.get('/products', authorized, getProducts);
AdminRouter.post('/products', authorized, addProduct);
AdminRouter.put('/products/:id', authorized, updateProduct);
AdminRouter.delete('/products/:id', authorized, deleteProduct);

AdminRouter.get('/admin', authorized, getAdmins);         
AdminRouter.post('/admin', authorized, createAdmin);      
AdminRouter.put('/admin/:id', authorized, updateAdmin);     
AdminRouter.delete('/admin/:id', authorized, deleteAdmin);

AdminRouter.get('/note', authorized, getNotes);         
AdminRouter.post('/note', authorized, createNote);      
AdminRouter.put('/note/:id', authorized, updateNote);     
AdminRouter.delete('/note/:id', authorized, deleteNote);

AdminRouter.get('/activity-logs', authorized, getLogs);
AdminRouter.delete('/activity-logs/:id', authorized, deleteLog);

AdminRouter.get('/devices/:type', authorized, getAllDevices);
AdminRouter.post('/devices/:type', authorized, addDevice);
AdminRouter.delete('/devices/:type/:id', authorized, deleteDevice);

AdminRouter.get('/session/:id', authorized, getDeviceSession);
AdminRouter.put('/session/:id', authorized, updateDeviceSession);
AdminRouter.post('/session/:id', authorized, closeDeviceSession);
AdminRouter.get('/reports', authorized, getDailyReports);

module.exports = AdminRouter

