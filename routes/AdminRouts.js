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

AdminRouter.get('/products', getProducts);
AdminRouter.post('/products', authorized, addProduct);
AdminRouter.put('/products/:id', authorized, updateProduct);
AdminRouter.delete('/products/:id', authorized, deleteProduct);

AdminRouter.get('/admin', getAdmins);         
AdminRouter.post('/admin', createAdmin);      
AdminRouter.put('/admin/:id', updateAdmin);     
AdminRouter.delete('/admin/:id', deleteAdmin);

AdminRouter.get('/note', getNotes);         
AdminRouter.post('/note', authorized, createNote);      
AdminRouter.put('/note/:id', updateNote);     
AdminRouter.delete('/note/:id', deleteNote);

AdminRouter.get('/activity-logs', getLogs);
AdminRouter.delete('/activity-logs/:id', deleteLog);

AdminRouter.get('/devices/:type', getAllDevices);
AdminRouter.post('/devices/:type', addDevice);
AdminRouter.delete('/devices/:type/:id', deleteDevice);

AdminRouter.get('/session/:id', getDeviceSession);
AdminRouter.put('/session/:id', updateDeviceSession);
AdminRouter.post('/session/:id', closeDeviceSession);
AdminRouter.get('/reports', getDailyReports);

module.exports = AdminRouter

