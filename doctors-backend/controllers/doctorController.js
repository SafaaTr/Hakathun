const Doctor = require('../models/Doctor');

// تسجيل دخول الطبيب
const loginDoctor = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال رقم الهاتف وكلمة المرور',
      });
    }

    const doctor = await Doctor.findOne({ phone: String(phone).trim() });
    if (!doctor || doctor.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'رقم الهاتف أو كلمة المرور غير صحيحة',
      });
    }

    const doctorObj = doctor.toObject();
    delete doctorObj.password;

    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: doctorObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطأ أثناء تسجيل الدخول',
      error: error.message,
    });
  }
};

// إنشاء حساب طبيب جديد
const registerDoctor = async (req, res) => {
  try {
    const {
      name,
      phone,
      password,
      clinicName,
      location,
      price,
      workingHours,
      workingDays,
    } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال الاسم ورقم الهاتف وكلمة المرور',
      });
    }

    const existing = await Doctor.findOne({ phone: String(phone).trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف مسجل مسبقاً',
      });
    }

    const doctor = await Doctor.create({
      name: String(name).trim(),
      phone: String(phone).trim(),
      password,
      clinicName: clinicName || 'عيادة بيطرية',
      location: location || 'دمشق',
      price: price ?? 0,
      workingHours: workingHours || '9 -> 5',
      workingDays: workingDays || ['الأحد', 'الثلاثاء', 'الخميس'],
    });

    const doctorObj = doctor.toObject();
    delete doctorObj.password;

    return res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      data: doctorObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطأ أثناء إنشاء الحساب',
      error: error.message,
    });
  }
};

// تحديث جدول المواعيد مع الحفاظ على حالة الحجز والتأكيد للوقت نفسه
const updateSchedule = async (req, res) => {
  try {
    const { doctorId, workingHours, workingDays, newSlots = [] } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'الطبيب غير موجود',
      });
    }

    const existingMap = new Map();
    for (const slot of doctor.timeSlots || []) {
      existingMap.set(slot.time, {
        time: slot.time,
        isBooked: Boolean(slot.isBooked),
        isConfirmed: Boolean(slot.isConfirmed),
        patientName: slot.patientName || null,
        patientPhone: slot.patientPhone || null,
      });
    }

    const updatedSlots = newSlots.map((timeStr) => {
      const cleanTime = String(timeStr).trim();
      if (existingMap.has(cleanTime)) {
        return existingMap.get(cleanTime);
      }
      return {
        time: cleanTime,
        isBooked: false,
        isConfirmed: false,
        patientName: null,
        patientPhone: null,
      };
    });

    if (workingHours !== undefined) doctor.workingHours = workingHours;
    if (workingDays !== undefined) doctor.workingDays = workingDays;
    doctor.timeSlots = updatedSlots;

    await doctor.save();

    const doctorObj = doctor.toObject();
    delete doctorObj.password;

    return res.status(200).json({
      success: true,
      message: 'تم تحديث المواعيد بنجاح',
      data: doctorObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطأ في تحديث المواعيد',
      error: error.message,
    });
  }
};

// جلب بيانات الطبيب (للبروفايل والحجوزات)
const getDoctorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'الطبيب غير موجود',
      });
    }

    return res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الطبيب',
      error: error.message,
    });
  }
};

// حجز موعد
const bookSlot = async (req, res) => {
  try {
    const { doctorId, slotId, patientName, patientPhone } = req.body;

    if (!doctorId || !slotId || !patientName) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إرسال معرف الطبيب ومعرف الموعد واسم المراجع',
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'الطبيب غير موجود',
      });
    }

    const slot = doctor.timeSlots.id(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود',
      });
    }

    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'هذا الموعد محجوز مسبقاً',
      });
    }

    slot.isBooked = true;
    slot.isConfirmed = false;
    slot.patientName = patientName.trim();
    slot.patientPhone = patientPhone ? patientPhone.trim() : null;

    await doctor.save();

    const doctorObj = doctor.toObject();
    delete doctorObj.password;

    return res.status(200).json({
      success: true,
      message: 'تم حجز الموعد بنجاح وبانتظار تأكيد الطبيب',
      data: doctorObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطأ أثناء حجز الموعد',
      error: error.message,
    });
  }
};

// تأكيد حجز من تطبيق الطبيب
const confirmBooking = async (req, res) => {
  try {
    const { doctorId, slotId } = req.body;

    if (!doctorId || !slotId) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إرسال معرف الطبيب ومعرف الموعد',
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'الطبيب غير موجود',
      });
    }

    const slot = doctor.timeSlots.id(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'الموعد غير موجود',
      });
    }

    if (!slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن تأكيد موعد غير محجوز',
      });
    }

    slot.isConfirmed = true;
    await doctor.save();

    const doctorObj = doctor.toObject();
    delete doctorObj.password;

    return res.status(200).json({
      success: true,
      message: 'تم تأكيد الحجز بنجاح',
      data: doctorObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطأ أثناء تأكيد الحجز',
      error: error.message,
    });
  }
};

// تعديل بيانات البروفايل للطبيب مع الحفاظ على المواعيد والحجوزات
const updateDoctorProfile = async (req, res) => {
  try {
    const {
      doctorId,
      name,
      clinicName,
      location,
      price,
      workingHours,
      workingDays,
    } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إرسال معرف الطبيب',
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'الطبيب غير موجود',
      });
    }

    if (name !== undefined && String(name).trim() !== '') {
      doctor.name = String(name).trim();
    }
    if (clinicName !== undefined) {
      doctor.clinicName = String(clinicName).trim();
    }
    if (location !== undefined) {
      doctor.location = String(location).trim();
    }
    if (price !== undefined && price !== '') {
      const numericPrice = Number(price);
      if (!Number.isNaN(numericPrice) && numericPrice >= 0) {
        doctor.price = numericPrice;
      }
    }
    if (workingHours !== undefined) {
      doctor.workingHours = String(workingHours).trim();
    }
    if (Array.isArray(workingDays)) {
      doctor.workingDays = workingDays;
    }

    await doctor.save();

    const doctorObj = doctor.toObject();
    delete doctorObj.password;

    return res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات البروفايل بنجاح',
      data: doctorObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطأ أثناء تحديث البروفايل',
      error: error.message,
    });
  }
};

module.exports = {
  loginDoctor,
  registerDoctor,
  updateSchedule,
  getDoctorProfile,
  bookSlot,
  confirmBooking,
  updateDoctorProfile,
};