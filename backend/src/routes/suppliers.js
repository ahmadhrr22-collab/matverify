const router = require('express').Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(suppliers)
  } catch (e) { res.status(500).json({ message: e.message }) }
})

router.post('/', auth, async (req, res) => {
  try {
    const supplier = await prisma.supplier.create({ data: req.body })
    res.json(supplier)
  } catch (e) { res.status(400).json({ message: e.message }) }
})

router.put('/:id', auth, async (req, res) => {
  try {
    const supplier = await prisma.supplier.update({
      where: { id: req.params.id }, data: req.body
    })
    res.json(supplier)
  } catch (e) { res.status(400).json({ message: e.message }) }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    const hasPO = await prisma.purchaseOrder.findFirst({
      where: { supplierId: req.params.id }
    })
    if (hasPO) return res.status(400).json({ 
      message: 'Supplier tidak bisa dihapus karena sudah memiliki Purchase Order' 
    })
    await prisma.supplier.delete({ where: { id: req.params.id } })
    res.json({ message: 'Supplier deleted' })
  } catch (e) { res.status(400).json({ message: e.message }) }
})

module.exports = router