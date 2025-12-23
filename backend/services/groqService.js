const Groq = require('groq-sdk');

// Initialize Groq client with API key
const groq = new Groq({
    apiKey: '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'
});

/**
 * Analyze a health report using Groq AI
 */
async function analyzeReport(reportData) {
    try {
        const prompt = `You are a medical AI assistant. Analyze this health report and provide detailed insights.

Report Information:
- Type: ${reportData.report_type}
- Date: ${reportData.report_date}
- Vitals: ${reportData.vitals || 'Not provided'}
- Notes: ${reportData.notes || 'None'}

Please provide a comprehensive analysis in the following JSON format:
{
  "summary": "Brief 2-3 sentence overview of the report",
  "findings": ["Key finding 1", "Key finding 2", "Key finding 3"],
  "condition": "Overall health condition assessment",
  "risks": ["Risk factor 1", "Risk factor 2"],
  "recommendations": [
    {
      "category": "Diet",
      "advice": "Specific dietary recommendation",
      "priority": "high"
    },
    {
      "category": "Exercise",
      "advice": "Physical activity recommendation",
      "priority": "medium"
    },
    {
      "category": "Lifestyle",
      "advice": "Lifestyle modification",
      "priority": "medium"
    }
  ],
  "precautions": ["Precaution 1", "Precaution 2", "Precaution 3"],
  "consultDoctor": "When to seek immediate medical attention"
}

Provide ONLY the JSON response, no additional text.`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful medical AI assistant that analyzes health reports and provides clear, actionable health advice. Always respond in valid JSON format.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 2000,
        });

        const responseText = completion.choices[0]?.message?.content || '{}';

        // Parse JSON response
        try {
            const analysis = JSON.parse(responseText);
            return analysis;
        } catch (parseError) {
            // If JSON parsing fails, try to extract JSON from the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Failed to parse AI response');
        }
    } catch (error) {
        console.error('Error analyzing report:', error);
        throw error;
    }
}

/**
 * Chat with AI assistant
 */
async function chatWithAssistant(messages, context = {}) {
    try {
        const systemMessage = context.reportData
            ? `You are a helpful medical AI assistant. You are discussing a health report:
Type: ${context.reportData.report_type}
Date: ${context.reportData.report_date}
Vitals: ${context.reportData.vitals || 'Not provided'}

Provide clear, helpful medical information. If asked about specific symptoms or conditions, give general health advice but always remind users to consult with healthcare professionals for personalized medical advice.`
            : 'You are a helpful medical AI assistant. Provide clear, helpful health information. Always remind users to consult healthcare professionals for personalized medical advice.';

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemMessage },
                ...messages
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.8,
            max_tokens: 1500,
        });

        return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
        console.error('Error in chat:', error);
        throw error;
    }
}

/**
 * Generate health recommendations based on vitals
 */
async function generateVitalsRecommendations(vitalsData) {
    try {
        const prompt = `Analyze these health vitals and provide recommendations:

${vitalsData.map(v => `- ${v.vital_type}: ${v.value} ${v.unit}`).join('\n')}

Provide recommendations in JSON format:
{
  "assessment": "Overall health assessment",
  "recommendations": [
    {
      "category": "Category name",
      "advice": "Specific advice",
      "priority": "high|medium|low"
    }
  ],
  "warnings": ["Warning 1", "Warning 2"]
}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a medical AI assistant analyzing health vitals.' },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 1000,
        });

        const responseText = completion.choices[0]?.message?.content || '{}';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return JSON.parse(responseText);
    } catch (error) {
        console.error('Error generating vitals recommendations:', error);
        throw error;
    }
}

/**
 * Extract vitals from report metadata using AI
 */
async function extractVitalsFromReport(reportData) {
    try {
        const prompt = `You are a medical AI assistant. Extract or suggest vital signs based on this health report information.

Report Information:
- Type: ${reportData.reportType}
- Date: ${reportData.reportDate}
- Notes: ${reportData.notes || 'No specific notes provided'}

TASK: 
1. If notes contain specific vital measurements, extract them exactly as mentioned.
2. If notes are empty or don't contain vitals, suggest COMMON vitals typically measured for this report type.

For example:
- Blood Test → Blood Pressure, Heart Rate, Blood Sugar, Cholesterol
- ECG → Heart Rate, Blood Pressure
- General Checkup → Blood Pressure, Heart Rate, Temperature, Weight

Extract or suggest vitals from the notes OR based on the report type. Common vitals include:
- Blood Pressure (systolic/diastolic in mmHg)
- Heart Rate (bpm)
- Blood Sugar/Glucose (mg/dL or mmol/L)
- Temperature (°F or °C)
- Weight (kg or lbs)
- Height (cm or inches)
- BMI (kg/m²)
- Oxygen Saturation/SpO2 (%)
- Respiratory Rate (breaths/min)
- Cholesterol levels (mg/dL)
- Hemoglobin (g/dL)

Return ONLY a JSON array of vitals in this exact format:
[
  {
    "type": "Blood Pressure",
    "value": "120/80",
    "unit": "mmHg"
  },
  {
    "type": "Heart Rate",
    "value": "72",
    "unit": "bpm"
  }
]

IMPORTANT RULES:
1. If notes contain specific values, use those exact values
2. If notes are empty, suggest 2-4 common vitals for this report type with typical healthy values
3. For Blood Pressure, use format "systolic/diastolic" as the value
4. Use standard medical units
5. Return ONLY the JSON array, no additional text or explanation
6. If the report type doesn't typically involve vitals (like X-Ray), return empty array []`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a medical AI assistant specialized in extracting and suggesting vital signs from health reports. Always respond with valid JSON only.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3, // Lower temperature for more consistent extraction
            max_tokens: 1000,
        });

        const responseText = completion.choices[0]?.message?.content || '[]';
        console.log('🤖 AI Response:', responseText);

        // Parse JSON response
        try {
            // Try to extract JSON array from response
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const vitals = JSON.parse(jsonMatch[0]);
                // Validate the structure
                if (Array.isArray(vitals)) {
                    const validVitals = vitals.filter(v => v.type && v.value && v.unit);
                    console.log('✅ Valid vitals extracted:', validVitals);
                    return validVitals;
                }
            }
            return [];
        } catch (parseError) {
            console.error('Error parsing vitals extraction response:', parseError);
            return [];
        }
    } catch (error) {
        console.error('Error extracting vitals from report:', error);
        // Return empty array on error - don't fail the upload
        return [];
    }
}

module.exports = {
    analyzeReport,
    chatWithAssistant,
    generateVitalsRecommendations,
    extractVitalsFromReport
};
