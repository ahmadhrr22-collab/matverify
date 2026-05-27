const router = require('express').Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

router.get('/:supplierId', auth, async (req, res) => {
  try {
    const mappings = await prisma.supplierFieldMapping.findMany({
      where: { supplierId: req.params.supplierId },
      orderBy: { createdAt: 'desc' }
    })
    res.json(mappings)
  } catch (e) { res.status(500).json({ message: e.message }) }
})

router.post('/', auth, async (req, res) => {
  try {
    const mapping = await prisma.supplierFieldMapping.create({ data: req.body })
    res.json(mapping)
  } catch (e) { res.status(400).json({ message: e.message }) }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.supplierFieldMapping.delete({ where: { id: req.params.id } })
    res.json({ message: 'Mapping deleted' })
  } catch (e) { res.status(400).json({ message: e.message }) }
})

module.exports = router