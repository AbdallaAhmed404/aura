const Admin = require('../models/AdminModel');
const bcrypt = require('bcryptjs');
const customError = require('../customError');
const jwt = require('jsonwebtoken');
const Product = require('../models/ProductModel');
const Note = require('../models/noteModel');
const ActivityLog = require('../models/LogModel');
const DeviceSession = require('../models/DeviceSession');
const ClosedSession = require('../models/ClosedModel');


const adminLogin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // 1. البحث عن الأدمن بالإيميل
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        // 2. التحقق إذا كان الحساب نشطاً
        if (admin.isActive === false) {
            return res.status(403).json({
                success: false,
                message: 'حسابك معطل. يرجى التواصل مع مسؤول النظام.'
            });
        }

        // 3. مقارنة كلمة المرور
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        // 4. إنشاء التوكن (JWT)
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET || 'key',
            { expiresIn: '1d' }
        );

        // تم إلغاء تخزين الكوكي (res.cookie) نهائياً

        // 5. إرسال الاستجابة بنجاح والتوكن معها ليتولى الفرونت إند تخزينه
        return res.status(200).json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            token,
            admin: {
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (err) {
        console.error("Admin login error:", err);
        return res.status(500).json({ success: false, message: "حدث خطأ أثناء تسجيل الدخول" });
    }
};

const adminLogout = async (req, res) => {
    try {
        // مسح الكوكي عبر ضبط انتهاء صلاحيتها أو استخدام clearCookie
        res.clearCookie('auraToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });

        return res.status(200).json({
            success: true,
            message: 'تم تسجيل الخروج بنجاح'
        });
    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ success: false, message: "حدث خطأ أثناء تسجيل الخروج" });
    }
};

// 1. جلب كل الأصناف (GET)
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات',
      error: error.message
    });
  }
};

// 2. إضافة صنف جديد (ADD)
const addProduct = async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    const adminId = req.admin.id;

    const newProduct = await Product.create({
      name,
      price,
      quantity
    });

    await ActivityLog.create({
      adminId,
      action: `إضافة صنف جديد: ${name}`
    });

    res.status(201).json({
      success: true,
      message: 'تمت إضافة الصنف بنجاح',
      data: newProduct
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'فشل إضافة الصنف',
      error: error.message
    });
  }
};

// 3. تحديث صنف موجود (UPDATE)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity } = req.body;
    const adminId = req.admin.id;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, price, quantity },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'الصنف غير موجود'
      });
    }

    await ActivityLog.create({
      adminId,
      action: `تعديل صنف: ${updatedProduct.name}`
    });

    res.status(200).json({
      success: true,
      message: 'تم تحديث الصنف بنجاح',
      data: updatedProduct
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'فشل تحديث الصنف',
      error: error.message
    });
  }
};

// 4. حذف صنف (DELETE)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'الصنف غير موجود'
      });
    }
    
    await ActivityLog.create({
      adminId,
      action: `حذف صنف: ${deletedProduct.name}`
    });

    res.status(200).json({
      success: true,
      message: 'تم حذف الصنف بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الصنف',
      error: error.message
    });
  }
};

const getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password'); // جلب البيانات بدون كلمة المرور للأمان
        res.status(200).json({ success: true, data: admins });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// إضافة حساب جديد (POST)
const createAdmin = async (req, res) => {
    try {
        const { name, email, password, role, isActive } = req.body;

        // التحقق من عدم تكرار البريد الإلكتروني
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: "البريد الإلكتروني مستخدم مسبقاً." });
        }

        // تشفير كلمة المرور (اختياري ولكن ينصح به بشدة)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = await Admin.create({
            name,
            email,
            password: hashedPassword,
            role,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({ success: true, data: newAdmin, message: "تمت إضافة الحساب بنجاح." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// تحديث بيانات الحساب (PUT)
const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role, isActive } = req.body;

        let updateData = { name, email, role, isActive };

        // إذا تم إدخال كلمة مرور جديدة، يتم تشفيرها وتحديثها
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedAdmin) {
            return res.status(404).json({ success: false, message: "الحساب غير موجود." });
        }

        res.status(200).json({ success: true, data: updatedAdmin, message: "تم تعديل الحساب بنجاح." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// حذف الحساب (DELETE)
const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAdmin = await Admin.findByIdAndDelete(id);

        if (!deletedAdmin) {
            return res.status(404).json({ success: false, message: "الحساب غير موجود." });
        }

        res.status(200).json({ success: true, message: "تم حذف الحساب بنجاح." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 1. إضافة ملاحظة جديدة (Create / Add)
const createNote = async (req, res) => {
    try {
        const { noteText } = req.body;
        
        // استخراج adminId من التوكن الذي قام الميدل وير بوضعه في req.admin
        const adminId = req.admin.id ;

        if (!adminId) {
            return res.status(401).json({ success: false, message: 'غير مصرح، يرجى تسجيل الدخول مجدداً' });
        }

        const newNote = await Note.create({
            adminId,
            noteText
        });

        res.status(201).json({
            success: true,
            message: 'تمت إضافة الملاحظة بنجاح',
            data: newNote
        });
    } catch (error) {
        console.error("Error creating note:", error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء إضافة الملاحظة' });
    }
};

// 2. جلب كل الملاحظات (Get All) مع إمكانية جلب بيانات الأدمن الذي كتبها (populating)
const getNotes = async (req, res) => {
    try {
        const notes = await Note.find()
            .populate('adminId', 'name') // لجلب اسم وإيميل الأدمن المرتبط بالملاحظة
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notes.length,
            data: notes
        });
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب الملاحظات' });
    }
};

// 3. تحديث ملاحظة (Update)
const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { noteText } = req.body;

        const updatedNote = await Note.findByIdAndUpdate(
            id,
            { noteText},
            { new: true, runValidators: true }
        );

        if (!updatedNote) {
            return res.status(404).json({ success: false, message: 'الملاحظة غير موجودة' });
        }

        res.status(200).json({
            success: true,
            message: 'تم تحديث الملاحظة بنجاح',
            data: updatedNote
        });
    } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحديث الملاحظة' });
    }
};

// 4. حذف ملاحظة (Delete)
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNote = await Note.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'تم حذف الملاحظة بنجاح'
        });
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء حذف الملاحظة' });
    }
};

const getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({})
      .populate('adminId', 'name email') // جلب اسم وبريد الأدمن من خلال الـ ID
      .sort({ createdAt: -1 }); // ترتيب العمليات من الأحدث للأقدم

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب السجلات",
      error: error.message
    });
  }
};

// @desc    حذف سجل عملية معين بناءً على الـ ID (إجراء المسح)
// @route   DELETE /api/activity-logs/:id
// @access  Private
const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await ActivityLog.findById(id);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: "السجل غير موجود"
      });
    }

    await log.deleteOne();

    return res.status(200).json({
      success: true,
      message: "تم حذف السجل بنجاح"
    });
  } catch (error) {
    console.error("Error deleting log:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف السجل",
      error: error.message
    });
  }
};

// 1. جلب بيانات جهاز معين بناءً على نوعه ورقم الـ ID الخاص به
const getAllDevices = async (req, res) => {
  try {
    const { type } = req.params;
    const devices = await DeviceSession.find({ type }).sort({ deviceId: 1 });
    res.status(200).json({ success: true, data: devices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addDevice = async (req, res) => {
  try {
    const { type } = req.params;
    const { deviceId, name, status, hourlyRate } = req.body;

    const typeNames = { billiards: 'طاولة', playstation: 'بلايستيشن', racing: 'سيموليتر سباق' };
    
    const newDevice = await DeviceSession.create({
      deviceId: Number(deviceId),
      type,
      name: name || `${typeNames[type] || 'جهاز'} ${deviceId}`,
      status: status || 'AVAILABLE',
      hourlyRate: hourlyRate || 2.000
    });

    res.status(201).json({ success: true, message: "تمت الإضافة بنجاح", data: newDevice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDevice = async (req, res) => {
  try {
    const { type, id } = req.params;
    
    const deletedDevice = await DeviceSession.findOneAndDelete({ type, deviceId: Number(id) });
    
    if (!deletedDevice) {
      return res.status(404).json({ success: false, message: "الجهاز غير موجود" });
    }

    res.status(200).json({ success: true, message: "تم الحذف بنجاح" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDeviceSession = async (req, res) => {
  try {
    const { id } = req.params;
    
    // البحث المباشر بـ _id في قاعدة البيانات
    const device = await DeviceSession.findById(id);

    if (!device) {
      return res.status(404).json({ success: false, message: "الجهاز غير موجود" });
    }

    res.status(200).json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. تحديث بيانات الجلسة (تشغيل، إيقاف مؤقت، إضافة منتجات، وقت، إلخ)
const updateDeviceSession = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const device = await DeviceSession.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ success: false, message: "الجهاز غير موجود" });
    }

    res.status(200).json({ success: true, message: "تم التحديث بنجاح", data: device });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. إغلاق الحساب وتحويل الجهاز إلى الحالة المتاحة (AVAILABLE)
const closeDeviceSession = async (req, res) => {
  try {
    const { id } = req.params; // هذا هو الـ _id الخاص بمونجو القادم من الـ Params
    const { paymentMethod, finalTotal: clientFinalTotal, timeCost: clientTimeCost, productsTotal: clientProductsTotal, discountPercent: clientDiscountPercent } = req.body;

    // 1. جلب بيانات الجلسة الحالية باستخدام الـ _id الخاص بمونجو
    const session = await DeviceSession.findById(id); 
    if (!session) {
      return res.status(404).json({ success: false, message: "الجلسة غير موجودة" });
    }

    // 2. حساب القيم وتجهيز التكاليف
    const timeCost = clientTimeCost !== undefined ? clientTimeCost : (session.timeCost || 0);
    const productsTotal = clientProductsTotal !== undefined ? clientProductsTotal : (session.productsTotal || 0);
    const discountPercent = clientDiscountPercent !== undefined ? clientDiscountPercent : (session.discountPercent || 0);
    
    const subTotal = timeCost + productsTotal;
    const discountAmount = (subTotal * discountPercent) / 100;
    const finalTotal = clientFinalTotal !== undefined ? clientFinalTotal : Math.max(0, subTotal - discountAmount);

    // 3. حفظ العملية في جدول العمليات المغلقة مع تخزين الـ sessionId الخاص بموديل الجهاز والـ _id
    const closedSessionData = new ClosedSession({
      sessionId: session.sessionId || session._id.toString(), // تخزين الـ ID الخاص بالموديل أو المعرف المخصص
      deviceName: session.name || session.deviceName || "جهاز",
      deviceType: session.type || session.deviceType || "billiards",
      customer: session.customer || { name: "", phone: "" },
      timeMode: session.timeMode || "OPEN",
      timeCost: timeCost,
      products: session.cart || [],
      productsTotal: productsTotal,
      discountPercent: discountPercent,
      finalTotal: finalTotal,
      paymentMethod: paymentMethod || "كاش",
      closedAt: new Date()
    });

    await closedSessionData.save();

    // 4. إعادة تعيين الجلسة الحالية لتصبح متاحة (AVAILABLE) وتفريغ الحقول
    session.status = "AVAILABLE";
    session.startTime = null;
    session.cart = [];
    session.customer = { name: "", phone: "" };
    session.discountPercent = 0;
    session.timeCost = 0;
    session.productsTotal = 0;
    await session.save();

    return res.status(200).json({ success: true, message: "تم إغلاق الحساب وحفظ العملية بنجاح", data: closedSessionData });
  } catch (error) {
    console.error("Error closing session:", error);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getDailyReports = async (req, res) => {
  try {
    // تحديد بداية ونهاية اليوم الحالي لحساب تقرير اليوم فقط
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const closedSessions = await ClosedSession.find({
      closedAt: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ closedAt: -1 });

    // حساب إجمالي مبيعات اليوم وتوزيع طرق الدفع (اختياري لتسهيل عمل المدير)
    const totalRevenue = closedSessions.reduce((sum, item) => sum + item.finalTotal, 0);

    return res.status(200).json({
      success: true,
      count: closedSessions.length,
      totalRevenue,
      data: closedSessions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "فشل في جلب التقارير" });
  }
};


module.exports = {
    adminLogin,
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    adminLogout,
    createNote,
    getNotes,
    updateNote,
    deleteNote,
    getLogs,
    deleteLog,
    getDeviceSession,
    updateDeviceSession,
    closeDeviceSession,
    getAllDevices,
    addDevice,
    deleteDevice,
    getDailyReports
};