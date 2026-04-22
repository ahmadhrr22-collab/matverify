const router = require('express').Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  try {
    const tasks = await prisma.verificationTask.findMany({
      include: {
        deliveryItem: { include: { material: true, delivery: true } },
        assignedTo: { select: { name: true } },
        documents: true,
        nonConformances: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(tasks)
  } catch (e) { res.status(500).json({ message: e.message }) }
})

router.get('/:id', auth, async (req, res) => {
  try {
    const task = await prisma.verificationTask.findUnique({
      where: { id: req.params.id },
      include: {
        deliveryItem: { include: { material: true, delivery: true } },
        assignedTo: { select: { name: true } },
        documents: true,
        nonConformances: true
      }
    })
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json(task)
  } catch (e) { res.status(500).json({ message: e.message }) }
})

router.post('/', auth, async (req, res) => {
  try {
    const task = await prisma.verificationTask.create({
      data: { ...req.body, assignedToId: req.user.id },
      include: { deliveryItem: { include: { material: true } } }
    })
    res.json(task)
  } catch (e) { res.status(400).json({ message: e.message }) }
})

module.exports = router