const router = require('express').Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  try {
    const ncs = await prisma.nonConformance.findMany({
      include: {
        task: {
          include: {
            deliveryItem: { include: { material: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(ncs)
  } catch (e) { res.status(500).json({ message: e.message }) }
})

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const nc = await prisma.nonConformance.update({
      where: { id: req.params.id },
      data: { 
        status: req.body.status,
        resolvedAt: req.body.status === 'RESOLVED' ? new Date() : undefined
      }
    })
    res.json(nc)
  } catch (e) { res.status(400).json({ message: e.message }) }
})

module.exports = router