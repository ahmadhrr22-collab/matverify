const router = require('express').Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  try {
    const deliveries = await prisma.delivery.findMany({
      include: {
        purchaseOrder: { include: { supplier: true } },
        receivedBy: { select: { name: true } },
        items: { include: { material: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(deliveries)
  } catch (e) { res.status(500).json({ message: e.message }) }
})

router.get('/:id', auth, async (req, res) => {
  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: req.params.id },
      include: {
        purchaseOrder: { include: { supplier: true } },
        receivedBy: { select: { name: true } },
        items: {
          include: {
            material: true,
            verificationTasks: { include: { documents: true, nonConformances: true } }
          }
        }
      }
    })
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' })
    res.json(delivery)
  } catch (e) { res.status(500).json({ message: e.message }) }
})

router.post('/', auth, async (req, res) => {
  try {
    const { deliveryNo, poId, arrivalDate, notes, items } = req.body
    const delivery = await prisma.delivery.create({
      data: {
        deliveryNo,
        poId,
        receivedById: req.user.id,
        arrivalDate: new Date(arrivalDate),
        notes,
        items: {
          create: items.map(item => ({
            materialId: item.materialId,
            qtyOrdered: item.qtyOrdered,
            qtyReceived: item.qtyReceived,
            batchNo: item.batchNo,
            expiryDate: new Date(item.expiryDate),
          }))
        }
      },
      include: { items: true }
    })
    res.json(delivery)
  } catch (e) { res.status(400).json({ message: e.message }) }
})

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const delivery = await prisma.delivery.update({
      where: { id: req.params.id },
      data: { status: req.body.status }
    })
    res.json(delivery)
  } catch (e) { res.status(400).json({ message: e.message }) }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { verificationTasks: { include: { documents: true, nonConformances: true } } } } }
    })
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' })

    for (const item of delivery.items) {
      for (const task of item.verificationTasks) {
        await prisma.document.deleteMany({ where: { taskId: task.id } })
        await prisma.nonConformance.deleteMany({ where: { taskId: task.id } })
      }
      await prisma.verificationTask.deleteMany({ where: { deliveryItemId: item.id } })
    }
    await prisma.deliveryItem.deleteMany({ where: { deliveryId: req.params.id } })
    await prisma.delivery.delete({ where: { id: req.params.id } })

    res.json({ message: 'Delivery deleted' })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const { action, notes } = req.body
    const status = action === 'approve' ? 'COMPLETED' : 'REJECTED'

    const delivery = await prisma.delivery.update({
      where: { id: req.params.id },
      data: { status }
    })

    await prisma.verificationTask.updateMany({
      where: {
        deliveryItem: { deliveryId: req.params.id },
        status: { not: 'REJECTED' }
      },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        notes: notes || null,
        completedAt: new Date()
      }
    })

    res.json({ delivery, message: `Delivery ${status}` })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

module.exports = router