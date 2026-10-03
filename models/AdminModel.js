const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'مدير النظام',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true // true تعني نشط، و false تعني معطل
    }
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);