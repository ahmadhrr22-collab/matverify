const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const semanticValidation = async (extractedData, qualitySpecs, supplierMappings = []) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const mappingInfo = supplierMappings.length > 0
      ? `Supplier field mappings: ${supplierMappings.map(m => `"${m.externalField}" maps to "${m.internalField}"`).join(', ')}`
      : 'No supplier-specific mappings.'

    const prompt = `You are a pharmaceutical QC expert. Validate CoA data against quality specifications.

EXTRACTED DATA:
${JSON.stringify(extractedData, null, 2)}

QUALITY SPECIFICATIONS:
${JSON.stringify(qualitySpecs, null, 2)}

${mappingInfo}

Rules:
- Use semantic understanding: "assay" = "purity", "LOD" = "loss_on_drying", "metals" = "heavy_metals"
- Evaluate numeric ranges intelligently: "99.78%" passes "min 99%", "0.12%" passes "max 0.5%"
- Consider units and ranges
- Score 0-100 based on fields passed

Return ONLY this JSON, no markdown:
{"results":[{"specField":"string","extractedField":"string or null","extractedValue":"string or null","expectedValue":"string","passed":true,"confidence":0.95,"reasoning":"string"}],"overallScore":85,"status":"PASSED","summary":"string"}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const clean = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const parsed = JSON.parse(clean)

    if (!parsed.results || !Array.isArray(parsed.results)) {
      throw new Error('Invalid Gemini response structure')
    }

    return parsed
  } catch (e) {
    console.error('Gemini error:', e.message)
    return null
  }
}

module.exports = { semanticValidation }