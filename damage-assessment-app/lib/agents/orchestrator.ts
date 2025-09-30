/**
 * Agent Orchestrator
 * Coordinates the 4-agent pipeline: Claude → Derek → Alex → Marcus
 */

import { prisma } from '../prisma'
import { analyzeWithClaude, ClaudeAssessmentInput } from './claude'
import { validateWithDerek } from './derek'
import { validateCompliance } from './alex'
import { calculateCosts } from './marcus'

export interface OrchestratorInput {
  jobId: string
  photos: Array<{
    id: string
    url: string
    fileName: string
  }>
  propertyData: {
    address?: string
    type?: string
    zipCode: string
  }
  estimateTier?: 'economy' | 'standard' | 'premium'
}

export interface OrchestratorOutput {
  jobId: string
  status: 'complete' | 'failed'
  processingTime: number
  claudeOutput: any
  derekOutput: any
  alexOutput: any
  marcusOutput: any
  finalAssessment: any
  confidenceScore: number
}

export async function orchestrateAssessment(
  input: OrchestratorInput
): Promise<OrchestratorOutput> {
  const overallStartTime = Date.now()

  console.log(`\n🚀 Starting assessment orchestration for job ${input.jobId}`)
  console.log(`   Photos: ${input.photos.length}`)
  console.log(`   Property: ${input.propertyData.address || 'Unknown'}`)

  try {
    // ============================================
    // STEP 1: CLAUDE - Damage Assessment
    // ============================================
    await updateJobStatus(input.jobId, 'ANALYZING', { claudeStartedAt: new Date() })

    const claudeInput: ClaudeAssessmentInput = {
      jobId: input.jobId,
      photos: input.photos,
      propertyData: input.propertyData,
    }

    const claudeOutput = await analyzeWithClaude(claudeInput)

    await updateJobStatus(input.jobId, 'ANALYZING', {
      claudeCompletedAt: new Date(),
      claudeOutput,
    })

    // ============================================
    // STEP 2: DEREK - Quality Validation
    // ============================================
    await updateJobStatus(input.jobId, 'VALIDATING', { derekStartedAt: new Date() })

    const derekOutput = await validateWithDerek(claudeOutput)

    // If validation fails, return early
    if (derekOutput.status === 'fail') {
      console.error('❌ Derek validation FAILED - stopping pipeline')
      await updateJobStatus(input.jobId, 'FAILED', {
        derekCompletedAt: new Date(),
        derekOutput,
        errorMessage: 'Quality validation failed',
      })

      throw new Error('Quality validation failed')
    }

    // If needs review, log warning but continue
    if (derekOutput.status === 'needs_review') {
      console.warn('⚠️  Derek flagged for review - continuing with caution')
    }

    await updateJobStatus(input.jobId, 'VALIDATING', {
      derekCompletedAt: new Date(),
      derekOutput,
    })

    // ============================================
    // STEP 3: ALEX - Compliance Check
    // ============================================
    await updateJobStatus(input.jobId, 'COMPLIANCE_CHECK', { alexStartedAt: new Date() })

    const alexOutput = await validateCompliance(
      derekOutput.enhanced_assessment,
      input.propertyData.zipCode
    )

    await updateJobStatus(input.jobId, 'COMPLIANCE_CHECK', {
      alexCompletedAt: new Date(),
      alexOutput,
    })

    // ============================================
    // STEP 4: MARCUS - Cost Calculation
    // ============================================
    await updateJobStatus(input.jobId, 'COSTING', { marcusStartedAt: new Date() })

    const marcusOutput = await calculateCosts(
      derekOutput.enhanced_assessment,
      input.propertyData.zipCode,
      input.estimateTier || 'standard'
    )

    await updateJobStatus(input.jobId, 'COSTING', {
      marcusCompletedAt: new Date(),
      marcusOutput,
    })

    // ============================================
    // FINALIZE - Combine All Outputs
    // ============================================
    const finalAssessment = {
      assessment_id: input.jobId,
      property: claudeOutput.property,
      damage_inventory: derekOutput.enhanced_assessment.damage_inventory,
      scope_of_work: derekOutput.enhanced_assessment.scope_of_work,
      photo_organization: derekOutput.enhanced_assessment.photo_organization,
      recommendations: derekOutput.enhanced_assessment.recommendations,
      compliance: alexOutput,
      cost_estimate: marcusOutput,
      metadata: {
        confidence_score: derekOutput.confidence_score,
        processing_time_ms: Date.now() - overallStartTime,
        agents_used: ['claude', 'derek', 'alex', 'marcus'],
        validation_status: derekOutput.status,
        compliance_status: alexOutput.compliance_status,
      },
    }

    const processingTime = Date.now() - overallStartTime

    await updateJobStatus(input.jobId, 'GENERATING', {
      completedAt: new Date(),
      totalProcessingMs: processingTime,
      finalAssessment,
      confidenceScore: derekOutput.confidence_score,
    })

    console.log(`\n✅ Assessment orchestration COMPLETE in ${processingTime}ms`)
    console.log(`   Confidence Score: ${(derekOutput.confidence_score * 100).toFixed(1)}%`)
    console.log(`   Total Cost: $${marcusOutput.grand_total.toFixed(2)}`)
    console.log(`   Status: ${derekOutput.status.toUpperCase()}`)

    return {
      jobId: input.jobId,
      status: 'complete',
      processingTime,
      claudeOutput,
      derekOutput,
      alexOutput,
      marcusOutput,
      finalAssessment,
      confidenceScore: derekOutput.confidence_score,
    }
  } catch (error) {
    console.error('❌ Assessment orchestration FAILED:', error)

    await updateJobStatus(input.jobId, 'FAILED', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date(),
      totalProcessingMs: Date.now() - overallStartTime,
    })

    throw error
  }
}

async function updateJobStatus(
  jobId: string,
  status: string,
  data: any
) {
  await prisma.assessmentJob.update({
    where: { id: jobId },
    data: {
      status: status as any,
      ...data,
    },
  })
}

// Helper function to be called from API routes
export async function processJobById(jobId: string) {
  // Fetch job from database
  const job = await prisma.assessmentJob.findUnique({
    where: { id: jobId },
    include: { photos: true },
  })

  if (!job) {
    throw new Error(`Job ${jobId} not found`)
  }

  // Prepare input for orchestrator
  const input: OrchestratorInput = {
    jobId: job.id,
    photos: job.photos.map((p) => ({
      id: p.id,
      url: p.storageUrl,
      fileName: p.fileName,
    })),
    propertyData: {
      address: job.propertyAddress || undefined,
      type: job.propertyType || undefined,
      zipCode: job.propertyZip || '77001', // Default to Houston for demo
    },
    estimateTier: job.estimateTier as any,
  }

  // Run orchestration
  return await orchestrateAssessment(input)
}