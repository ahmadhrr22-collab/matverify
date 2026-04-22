const OpenAI = require('openai')

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

const MODELS = [
  'google/gemini-2.0-flash-001',
  'google/gemini-2.0-pro-exp-02-05:free',
  'meta-llama/llama-3.3-70b-instruct'
]

const semanticValidation = async (extractedData, qualitySpecs, supplierMappings = []) => {
  const mappingInfo = supplierMappings.length > 0
    ? `Supplier mappings: ${supplierMappings.map(m => `"${m.externalField}"="${m.internalField}"`).join(', ')}`
    : ''

  const specKeys = Object.keys(qualitySpecs)
  const extractedKeys = Object.keys(extractedData)

  const prompt = `You are a pharmaceutical QC expert. Match and validate CoA data against specs.

SPECS TO VALIDATE (${specKeys.length} fields):
${specKeys.map(k => `- ${k}: ${qualitySpecs[k]}`).join('\n')}

EXTRACTED DATA FROM DOCUMENT (${extractedKeys.length} fields):
${extractedKeys.map(k => `- ${k}: ${extractedData[k]}`).join('\n')}

${mappingInfo}

TASK: For each spec field, find the best matching extracted field using semantic understanding.
Examples of semantic matches:
- "assay" matches "assay_(_on_dried_c8h9no2" → value "99.78 %"
- "metals" or "heavy_metals" matches "metals" → value "< 20 ppm"  
- "loss_on_drying" matches "loss_on_drying" → value "0.12 %"
- "melting_point" matches "melting_point_" → value "171.8 °C"
- "sulphated_ash" matches "sulphated_ash" → value "0.029 %"

For numeric validation:
- "99.78 %" PASSES "min 99%"
- "0.12 %" PASSES "max 0.5%"
- "< 20 ppm" PASSES "max 20 ppm"
- "171.8" PASSES "168-172"
- "0.029 %" PASSES "max 0.1%"

Respond with ONLY a JSON object. No explanation. No markdown. Just the JSON:
{"results":[{"specField":"assay","extractedField":"assay_(_on_dried_c8h9no2","extractedValue":"99.78 %","expectedValue":"min 99%","passed":true,"confidence":0.95,"reasoning":"99.78% meets min 99%"}],"overallScore":80,"status":"PASSED","summary":"Most specs passed"}`

  for (const model of MODELS) {
    try {
      console.log(`Trying model: ${model}`)
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.0,
        max_tokens: 1000,
      })

      const text = response.choices[0].message.content.trim()
      console.log('AI Response:', text.slice(0, 200))

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')

      const parsed = JSON.parse(jsonMatch[0])
      if (!parsed.results || !Array.isArray(parsed.results)) {
        throw new Error('Invalid structure')
      }

      console.log(`Success with model: ${model}, score: ${parsed.overallScore}`)
      return parsed
    } catch (e) {
      console.error(`Model ${model} failed:`, e.message)
      continue
    }
  }

  console.error('All models failed')
  return null
}

module.exports = { semanticValidation }