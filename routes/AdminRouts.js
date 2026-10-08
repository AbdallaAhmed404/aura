const express = require('express')
const AdminRouter = express.Router()
const authorized = require('../middlewares/Authorized');
const isAdmin = require('../middlewares/isAdmin');
const {adminLogin,getProducts,addProduct,updateProduct,deleteProduct,
    getAdmins,createAdmin,updateAdmin,deleteAdmin,adminLogout,createNote,
    getNotes,updateNote,deleteNote,getLogs, deleteLog,getDeviceSession, 
    updateDeviceSession, closeDeviceSession,getAllDevices,addDevice,deleteDevice
    ,getDailyReports,checkAdminRole} = require('../controllers/AdminController')

AdminRouter.post('/login', adminLogin);
AdminRouter.post('/logout', adminLogout);

AdminRouter.get('/products', authorized, getProducts);
AdminRouter.post('/products',isAdmin, authorized, addProduct);
AdminRouter.put('/products/:id',isAdmin, authorized, updateProduct);
AdminRouter.delete('/products/:id',isAdmin, authorized, deleteProduct);

AdminRouter.get('/admin',isAdmin, authorized, getAdmins);         
AdminRouter.post('/admin',isAdmin, authorized, createAdmin);      
AdminRouter.put('/admin/:id',isAdmin, authorized, updateAdmin);     
AdminRouter.delete('/admin/:id',isAdmin, authorized, deleteAdmin);

AdminRouter.get('/note', authorized, getNotes);         
AdminRouter.post('/note', authorized, createNote);      
AdminRouter.put('/note/:id',isAdmin, authorized, updateNote);     
AdminRouter.delete('/note/:id',isAdmin, authorized, deleteNote);

AdminRouter.get('/activity-logs',isAdmin, authorized, getLogs);
AdminRouter.delete('/activity-logs/:id',isAdmin, authorized, deleteLog);

AdminRouter.get('/devices/:type', authorized, getAllDevices);
AdminRouter.post('/devices/:type',isAdmin, authorized, addDevice);
AdminRouter.delete('/devices/:type/:id',isAdmin, authorized, deleteDevice);

AdminRouter.get('/session/:id', authorized, getDeviceSession);
AdminRouter.put('/session/:id', authorized, updateDeviceSession);
AdminRouter.post('/session/:id', authorized, closeDeviceSession);
AdminRouter.get('/reports',isAdmin, authorized, getDailyReports);
AdminRouter.get('/check-role', authorized, checkAdminRole);

module.exports = AdminRouter

