const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Import Routes
const authRoutes = require('./routes/auth');
const supplierRoutes = require('./routes/suppliers');
const materialRoutes = require('./routes/materials');
const deliveryRoutes = require('./routes/deliveries');
const documentRoutes = require('./routes/documents');
const poRoutes = require('./routes/purchaseOrders');
const taskRoutes = require('./routes/verificationTasks');
const ncRoutes = require('./routes/nonConformances');
const fieldMappingRoutes = require('./routes/fieldMappings');
const adminRoutes = require('./routes/admin');

// 2. Inisialisasi App (WAJIB DI SINI)
const app = express();

// 3. Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://matverify.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true
}));

app.use(express.json());

// 4. Health Check & Root Route
app.get('/', (req, res) => {
  res.json({ message: "MatVerify API is running!", status: "Online" });
});

app.get('/health', (req, res) => {
  res.json({ status: 'MatVerify API running', timestamp: new Date() });
});

// 5. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/purchase-orders', poRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/non-conformances', ncRoutes);
app.use('/api/field-mappings', fieldMappingRoutes);
app.use('/api/admin', adminRoutes);

// 6. Export untuk Vercel
module.exports = app;

// 7. Listen hanya jika dijalankan manual (bukan oleh Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}