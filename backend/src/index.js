const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const supplierRoutes = require('./routes/suppliers')
const materialRoutes = require('./routes/materials')
const deliveryRoutes = require('./routes/deliveries')
const documentRoutes = require('./routes/documents')
const poRoutes = require('./routes/purchaseOrders')
const taskRoutes = require('./routes/verificationTasks')
const ncRoutes = require('./routes/nonConformances')
const fieldMappingRoutes = require('./routes/fieldMappings')

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'MatVerify API running', timestamp: new Date() })
})

app.use('/api/auth', authRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/materials', materialRoutes)
app.use('/api/deliveries', deliveryRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/purchase-orders', poRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/non-conformances', ncRoutes)
app.use('/api/field-mappings', fieldMappingRoutes)

if (require.main === module) {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

module.exports = app