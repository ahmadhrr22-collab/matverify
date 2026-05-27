const router = require('express').Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      include: { supplier: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(pos)
  } catch (e) { res.status(500).json({ message: e.message }) }
})

router.post('/', auth, async (req, res) => {
  try {
    const po = await prisma.purchaseOrder.create({
      data: { ...req.body, createdById: req.user.id, poDate: new Date(req.body.poDate) },
      include: { supplier: true }
    })
    res.json(po)
  } catch (e) { res.status(400).json({ message: e.message }) }
})

module.exports = router