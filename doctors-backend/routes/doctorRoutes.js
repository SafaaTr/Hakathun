const express = require('express');
const router = express.Router();
const {
  loginDoctor,
  registerDoctor,
  updateSchedule,
  getDoctorProfile,
  bookSlot,
  confirmBooking,
  updateDoctorProfile,
} = require('../controllers/doctorController');

router.post('/login', loginDoctor);
router.post('/register', registerDoctor);
router.put('/update-schedule', updateSchedule);
router.put('/profile', updateDoctorProfile);
router.post('/book', bookSlot);
router.patch('/confirm-booking', confirmBooking);
router.get('/:id', getDoctorProfile);

module.exports = router;