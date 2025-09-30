/**
 * Agent 1: Claude - Lead Assessment Expert
 * Analyzes property damage photos and creates comprehensive damage inventory
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are an elite property damage assessment expert with 20+ years of experience.

Your task:
1. Analyze the provided property damage photos
2. Identify all visible damage (type, severity, location)
3. Classify each photo by location (room name for interior, elevation for exterior)
4. Generate a comprehensive scope of work for repairs
5. Flag safety concerns and urgent items

Output structured JSON following this schema:
{
  "assessment_id": "string",
  "property": {
    "address": "string",
    "type": "string"
  },
  "damage_inventory": [
    {
      "item_id": "string",
      "location": "string",
      "location_type": "interior|exterior",
      "elevation": "north|south|east|west|roof|null",
      "damage_type": "string",
      "severity": "minor|moderate|severe|critical",
      "affected_area": "string",
      "description": "string",
      "photos": ["photo_ids"],
      "safety_concerns": ["string"],
      "urgent": boolean
    }
  ],
  "scope_of_work": [
    {
      "damage_item_id": "string",
      "tasks": [
        {
          "task_id": "string",
          "description": "string",
          "quantity": number,
          "unit": "string",
          "trade": "string"
        }
      ]
    }
  ],
  "photo_organization": {
    "exterior": {
      "north_elevation": ["photo_ids"],
      "south_elevation": ["photo_ids"],
      "east_elevation": ["photo_ids"],
      "west_elevation": ["photo_ids"],
      "roof": ["photo_ids"]
    },
    "interior": {
      "room_name": ["photo_ids"]
    },
    "unassigned": ["photo_ids"]
  },
  "recommendations": ["string"]
}

Guidelines:
- Be thorough but concise in descriptions
- Use professional construction terminology
- Severity levels: minor, moderate, severe, critical
- Always correlate photos with damage items
- Flag any safety hazards immediately`

export interface ClaudeAssessmentInput {
  jobId: string
  photos: Array<{
    id: string
    url: string
    fileName: string
  }>
  propertyData: {
    address?: string
    type?: string
    zipCode?: string
  }
}

export interface ClaudeAssessmentOutput {
  assessment_id: string
  property: {
    address: string
    type: string
  }
  damage_inventory: Array<{
    item_id: string
    location: string
    location_type: 'interior' | 'exterior'
    elevation: 'north' | 'south' | 'east' | 'west' | 'roof' | null
    damage_type: string
    severity: 'minor' | 'moderate' | 'severe' | 'critical'
    affected_area: string
    description: string
    photos: string[]
    safety_concerns: string[]
    urgent: boolean
  }>
  scope_of_work: Array<{
    damage_item_id: string
    tasks: Array<{
      task_id: string
      description: string
      quantity: number
      unit: string
      trade: string
    }>
  }>
  photo_organization: {
    exterior: Record<string, string[]>
    interior: Record<string, string[]>
    unassigned: string[]
  }
  recommendations: string[]
}

export async function analyzeWithClaude(
  input: ClaudeAssessmentInput
): Promise<ClaudeAssessmentOutput> {
  const startTime = Date.now()

  // Prepare photo messages for Claude
  const photoMessages = input.photos.map((photo) => ({
    type: 'image' as const,
    source: {
      type: 'url' as const,
      url: photo.url,
    },
  }))

  const userPrompt = `Property Information:
- Address: ${input.propertyData.address || 'Unknown'}
- Type: ${input.propertyData.type || 'Unknown'}
- ZIP Code: ${input.propertyData.zipCode || 'Unknown'}
- Photos: ${input.photos.length} uploaded

Please analyze all photos and provide a complete damage assessment in JSON format.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            ...photoMessages,
          ],
        },
      ],
    })

    const processingTime = Date.now() - startTime

    // Parse the response
    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    const assessment = JSON.parse(content.text) as ClaudeAssessmentOutput

    console.log(`✅ Claude analysis complete in ${processingTime}ms`)
    console.log(`   - Damage items found: ${assessment.damage_inventory.length}`)
    console.log(`   - Scope tasks: ${assessment.scope_of_work.length}`)

    return assessment
  } catch (error) {
    console.error('❌ Claude analysis failed:', error)
    throw new Error(`Claude analysis failed: ${error}`)
  }
}

export function getConfidenceScore(assessment: ClaudeAssessmentOutput): number {
  // Calculate confidence based on completeness and consistency
  let score = 1.0

  // Deduct if photos are unassigned
  const unassignedCount = assessment.photo_organization.unassigned.length
  const totalPhotos =
    unassignedCount +
    Object.values(assessment.photo_organization.exterior).flat().length +
    Object.values(assessment.photo_organization.interior).flat().length

  if (totalPhotos > 0) {
    score -= (unassignedCount / totalPhotos) * 0.2
  }

  // Deduct if damage items lack scope tasks
  const damageWithoutScope = assessment.damage_inventory.filter(
    (item) =>
      !assessment.scope_of_work.some((scope) => scope.damage_item_id === item.item_id)
  ).length

  if (assessment.damage_inventory.length > 0) {
    score -= (damageWithoutScope / assessment.damage_inventory.length) * 0.3
  }

  return Math.max(0, Math.min(1, score))
}