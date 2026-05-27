const router = require('express').Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  try {
    const materials = await prisma.material.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(materials)
  } catch (e) { res.status(500).json({ message: e.message }) }
})

router.post('/', auth, async (req, res) => {
  try {
    const material = await prisma.material.create({ data: req.body })
    res.json(material)
  } catch (e) { res.status(400).json({ message: e.message }) }
})

router.put('/:id', auth, async (req, res) => {
  try {
    const material = await prisma.material.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json(material)
  } catch (e) { res.status(400).json({ message: e.message }) }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.material.delete({ where: { id: req.params.id } })
    res.json({ message: 'Material deleted' })
  } catch (e) { res.status(400).json({ message: e.message }) }
})

module.exports = router