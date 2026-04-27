const router = require('express').Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

router.delete('/reset-demo', auth, async (req, res) => {
  try {
    await prisma.nonConformance.deleteMany()
    await prisma.document.deleteMany()
    await prisma.verificationTask.deleteMany()
    await prisma.deliveryItem.deleteMany()
    await prisma.delivery.deleteMany()
    await prisma.purchaseOrder.deleteMany()
    await prisma.supplierFieldMapping.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.material.deleteMany()
    res.json({ message: 'Demo data reset successfully' })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

module.exports = router