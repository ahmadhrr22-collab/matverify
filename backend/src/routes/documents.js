const router = require('express').Router()
const multer = require('multer')
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')
const { uploadFile } = require('../services/azureStorage')
const { extractDocument } = require('../services/azureAI')
const { semanticValidation } = require('../services/aiValidation')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

router.post('/upload/:taskId', auth, upload.single('file'), async (req, res) => {
  try {
    const { taskId } = req.params
    const { docType } = req.body

    const task = await prisma.verificationTask.findUnique({
      where: { id: taskId },
      include: {
        deliveryItem: {
          include: {
            material: true,
            delivery: {
              include: {
                purchaseOrder: {
                  include: {
                    supplier: {
                      include: { fieldMappings: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
    if (!task) return res.status(404).json({ message: 'Task not found' })

    const { url, sasUrl } = await uploadFile(
      req.file.buffer, req.file.originalname, req.file.mimetype
    )

    const azureResult = await extractDocument(sasUrl, task.deliveryItem?.material?.name || '')

    let validationStatus = 'PENDING'
    let validationDetail = null

    if (docType === 'COA') {
      const specs = task.deliveryItem.material.qualitySpecs
      const supplierMappings = task.deliveryItem.delivery.purchaseOrder.supplier.fieldMappings || []

      const geminiResult = await semanticValidation(
        azureResult.extractedData,
        specs,
        supplierMappings
      )

      if (geminiResult) {
        validationStatus = geminiResult.status === 'PASSED' ? 'PASSED' : 
                           geminiResult.status === 'FAILED' ? 'FAILED' : 'MANUAL_REVIEW'
        validationDetail = geminiResult
      } else {
        const { validateAgainstSpecs } = require('../services/azureAI')
        const fallback = validateAgainstSpecs(azureResult.extractedData, specs)
        validationStatus = fallback.status === 'PASSED' ? 'PASSED' :
                           fallback.status === 'FAILED' ? 'FAILED' : 'MANUAL_REVIEW'
        validationDetail = fallback
      }
    }

    // Execute database writes atomically using a transaction
    const transactionResult = await prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          taskId,
          docType,
          fileUrl: url,
          fileName: req.file.originalname,
          extractedData: azureResult.extractedData,
          confidence: azureResult.confidence,
          validationStatus,
          validationDetail
        }
      })

      let nonConformance = null
      if (docType === 'COA' && validationStatus === 'FAILED') {
        const ncCount = await tx.nonConformance.count({ where: { taskId } })
        const failedFields = (validationDetail.results || [])
          .filter(r => !r.passed)
          .map(r => r.specField)
          .join(', ')

        nonConformance = await tx.nonConformance.create({
          data: {
            taskId,
            ncNumber: `NC-${Date.now()}-${ncCount + 1}`,
            severity: validationDetail.overallScore < 30 ? 'CRITICAL' : 'MAJOR',
            description: `AI Validation failed. Score: ${validationDetail.overallScore}%. Fields: ${failedFields}. ${validationDetail.summary || ''}`,
            status: 'OPEN'
          }
        })
      }

      const updatedTask = await tx.verificationTask.update({
        where: { id: taskId },
        data: {
          status: validationStatus === 'PASSED' ? 'APPROVED' :
                  validationStatus === 'FAILED' ? 'REJECTED' : 'IN_REVIEW'
        }
      })

      return { document, nonConformance, updatedTask }
    })

    res.json({
      document: transactionResult.document,
      azureResult,
      geminiValidation: validationDetail,
      nonConformance: transactionResult.nonConformance,
      message: validationStatus === 'FAILED' ? 'NC auto-generated' : 'Document processed successfully'
    })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { taskId: req.params.taskId },
      orderBy: { createdAt: 'desc' }
    })
    res.json(documents)
  } catch (e) { res.status(500).json({ message: e.message }) }
})

router.post('/test-extract', auth, async (req, res) => {
  try {
    const { fileUrl } = req.body
    const result = await extractDocument(fileUrl)
    res.json(result)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

module.exports = router