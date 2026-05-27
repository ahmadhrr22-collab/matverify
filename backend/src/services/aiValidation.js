const { GoogleGenerativeAI } = require('@google/generative-ai')
const OpenAI = require('openai')

// Helper for schema configuration in Gemini
const geminiSchema = {
  type: 'OBJECT',
  properties: {
    results: {
      type: 'ARRAY',
      description: 'List of matching results for each quality specification field.',
      items: {
        type: 'OBJECT',
        properties: {
          specField: { type: 'STRING', description: 'Internal quality spec field name' },
          extractedField: { type: 'STRING', description: 'Best matching extracted field name from document, null if not found' },
          extractedValue: { type: 'STRING', description: 'Value from document matching extracted field, null if not found' },
          expectedValue: { type: 'STRING', description: 'Expected limit or value from specifications' },
          passed: { type: 'BOOLEAN', description: 'True if value meets specifications, false if outside limits or not found' },
          confidence: { type: 'NUMBER', description: 'Confidence score of the match and evaluation between 0.0 and 1.0' },
          reasoning: { type: 'STRING', description: 'Explanation for passing or failing, including unit translations if any' }
        },
        required: ['specField', 'passed', 'confidence', 'reasoning']
      }
    },
    overallScore: { type: 'INTEGER', description: 'Overall compliance score of the CoA from 0 to 100 based on fields passed' },
    status: { type: 'STRING', description: 'Overall verification result: PASSED (all key specs pass), FAILED (critical spec failed or multiple specs failed), MANUAL_REVIEW (borderline, low confidence, or missing non-critical parameters)' },
    summary: { type: 'STRING', description: 'Concise executive summary of verification findings' }
  },
  required: ['results', 'overallScore', 'status', 'summary']
}

const runGeminiNative = async (extractedData, qualitySpecs, mappingInfo) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('dummy')) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: geminiSchema,
      temperature: 0.0
    }
  })

  const specKeys = Object.keys(qualitySpecs)
  const extractedKeys = Object.keys(extractedData)

  const prompt = `You are an expert pharmaceutical Quality Control (QC) analyst. 
Compare the extracted Certificate of Analysis (CoA) data against the master Quality Specifications.

SPECS TO VALIDATE (${specKeys.length} fields):
${specKeys.map(k => `- ${k}: ${qualitySpecs[k]}`).join('\n')}

EXTRACTED DATA FROM DOCUMENT (${extractedKeys.length} fields):
${extractedKeys.map(k => `- ${k}: ${extractedData[k]}`).join('\n')}

${mappingInfo}

Task:
1. Match each quality spec field to the most semantically relevant extracted field.
2. Evaluate if the extracted value meets the specification requirements. 
   - Pay attention to unit scales (e.g. 0.12% is equal to 1200 ppm; "assay min 99%" is satisfied by "99.78%"; melting point "168-172" is satisfied by "171.8 °C").
   - Take into account the provided field mappings.
3. Compute the overall score and final status (PASSED, FAILED, or MANUAL_REVIEW).`

  const response = await model.generateContent(prompt)
  const text = response.response.text()
  return JSON.parse(text)
}

const runOpenRouter = async (extractedData, qualitySpecs, mappingInfo) => {
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.includes('dummy')) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  })

  const specKeys = Object.keys(qualitySpecs)
  const extractedKeys = Object.keys(extractedData)

  const prompt = `You are a pharmaceutical QC expert. Validate CoA data against specifications.

SPECS TO VALIDATE (${specKeys.length} fields):
${specKeys.map(k => `- ${k}: ${qualitySpecs[k]}`).join('\n')}

EXTRACTED DATA FROM DOCUMENT (${extractedKeys.length} fields):
${extractedKeys.map(k => `- ${k}: ${extractedData[k]}`).join('\n')}

${mappingInfo}

Evaluate and match each spec field against extracted fields. For numeric validation:
- "99.78%" PASSES "min 99%"
- "0.12%" PASSES "max 0.5%"
- "< 20 ppm" PASSES "max 20 ppm"
- "171.8" PASSES "168-172"

Respond ONLY with a JSON object. No explanation. No markdown. Just the raw JSON matching this schema:
{
  "results": [
    {
      "specField": "assay",
      "extractedField": "assay_percent",
      "extractedValue": "99.78%",
      "expectedValue": "min 99%",
      "passed": true,
      "confidence": 0.98,
      "reasoning": "99.78% exceeds minimum 99%"
    }
  ],
  "overallScore": 95,
  "status": "PASSED",
  "summary": "All critical specifications met"
}`

  const response = await client.chat.completions.create({
    model: 'google/gemini-2.0-flash-001',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.0,
    max_tokens: 1500,
  })

  const text = response.choices[0].message.content.trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in OpenRouter response')
  return JSON.parse(jsonMatch[0])
}

const semanticValidation = async (extractedData, qualitySpecs, supplierMappings = []) => {
  const mappingInfo = supplierMappings.length > 0
    ? `Supplier custom field mappings: ${supplierMappings.map(m => `"${m.externalField}" matches "${m.internalField}"`).join(', ')}`
    : 'No supplier-specific mappings provided.'

  console.log('Initiating semantic validation pipeline...')

  // Try Native Gemini API first
  try {
    console.log('Running native Gemini AI validation (with Structured Outputs)...')
    const result = await runGeminiNative(extractedData, qualitySpecs, mappingInfo)
    console.log('Gemini validation successful. Status:', result.status)
    return result
  } catch (e) {
    console.warn('Native Gemini validation failed, attempting OpenRouter fallback... Error:', e.message)

    // Fallback to OpenRouter
    try {
      console.log('Running OpenRouter fallback validation...')
      const result = await runOpenRouter(extractedData, qualitySpecs, mappingInfo)
      console.log('OpenRouter fallback successful. Status:', result.status)
      return result
    } catch (err) {
      console.error('All AI validation providers failed. Error:', err.message)
      return null
    }
  }
}

module.exports = { semanticValidation }