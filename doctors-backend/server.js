const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const doctorRoutes = require('./routes/doctorRoutes.js');

dotenv.config();

// الاتصال بـ MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/doctors', doctorRoutes);

app.get('/', (req, res) => {
  res.send('Doctors API Server Running...');
});

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Doctors Server running on port ${PORT}`);
// });
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});