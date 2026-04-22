const { DocumentAnalysisClient, AzureKeyCredential } = require('@azure/ai-form-recognizer')

const docClient = new DocumentAnalysisClient(
  process.env.AZURE_DOC_INTELLIGENCE_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_DOC_INTELLIGENCE_KEY)
)

const extractDocument = async (fileUrl) => {
  try {
    const poller = await docClient.beginAnalyzeDocumentFromUrl('prebuilt-document', fileUrl)
    const result = await poller.pollUntilDone()

    const extracted = {}
    const confidence = []

    for (const kv of result.keyValuePairs || []) {
      if (kv.key && kv.value) {
        const key = kv.key.content?.toLowerCase().replace(/\s+/g, '_')
        extracted[key] = kv.value.content
        confidence.push(kv.confidence || 0)
      }
    }

    const avgConfidence = confidence.length > 0
      ? confidence.reduce((a, b) => a + b, 0) / confidence.length
      : 0

    return {
      extractedData: extracted,
      confidence: Math.round(avgConfidence * 100) / 100,
      rawFields: result.keyValuePairs?.length || 0
    }
  } catch (e) {
    return { extractedData: {}, confidence: 0, error: e.message }
  }
}

const validateAgainstSpecs = (extractedData, qualitySpecs) => {
  const results = []
  let passCount = 0

  for (const [specKey, specValue] of Object.entries(qualitySpecs)) {
    const extractedValue = extractedData[specKey.toLowerCase().replace(/\s+/g, '_')]
    const passed = extractedValue !== undefined

    results.push({
      field: specKey,
      expected: specValue,
      extracted: extractedValue || 'Not found',
      passed
    })

    if (passed) passCount++
  }

  const score = results.length > 0 ? passCount / results.length : 0
  const status = score >= 0.8 ? 'PASSED' : score >= 0.5 ? 'MANUAL_REVIEW' : 'FAILED'

  return { results, score: Math.round(score * 100), status }
}

module.exports = { extractDocument, validateAgainstSpecs }