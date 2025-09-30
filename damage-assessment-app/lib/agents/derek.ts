/**
 * Agent 2: Derek - Data Quality & Analytics Partner
 * Validates and ensures quality of assessments from Claude
 */

import { ClaudeAssessmentOutput } from './claude'

export interface DerekValidationOutput {
  status: 'pass' | 'needs_review' | 'fail'
  confidence_score: number
  validations: Array<{
    check: string
    status: 'pass' | 'warning' | 'fail'
    details: string
  }>
  corrections_made: Array<{
    field: string
    original: string
    corrected: string
    reason: string
  }>
  enhanced_assessment: ClaudeAssessmentOutput
}

export async function validateWithDerek(
  assessment: ClaudeAssessmentOutput
): Promise<DerekValidationOutput> {
  const startTime = Date.now()
  const validations: DerekValidationOutput['validations'] = []
  const corrections: DerekValidationOutput['corrections_made'] = []

  console.log('🔍 Derek: Starting quality validation...')

  // Validation 1: Completeness Check
  const completenessCheck = checkCompleteness(assessment)
  validations.push(completenessCheck)

  // Validation 2: Consistency Check
  const consistencyCheck = checkConsistency(assessment)
  validations.push(consistencyCheck)

  // Validation 3: Photo-Damage Correlation
  const correlationCheck = checkPhotoCorrelation(assessment)
  validations.push(correlationCheck)

  // Validation 4: Scope-Damage Alignment
  const scopeCheck = checkScopeAlignment(assessment)
  validations.push(scopeCheck)

  // Validation 5: Professional Language
  const languageResult = checkProfessionalLanguage(assessment)
  validations.push(languageResult.validation)
  corrections.push(...languageResult.corrections)

  // Calculate confidence score
  const passCount = validations.filter((v) => v.status === 'pass').length
  const totalChecks = validations.length
  let confidenceScore = passCount / totalChecks

  // Apply deductions for warnings
  const warningCount = validations.filter((v) => v.status === 'warning').length
  confidenceScore -= warningCount * 0.05

  // Determine overall status
  const failCount = validations.filter((v) => v.status === 'fail').length
  let overallStatus: 'pass' | 'needs_review' | 'fail' = 'pass'
  if (failCount > 0) {
    overallStatus = 'fail'
  } else if (warningCount > 2 || confidenceScore < 0.9) {
    overallStatus = 'needs_review'
  }

  const processingTime = Date.now() - startTime

  console.log(`✅ Derek validation complete in ${processingTime}ms`)
  console.log(`   - Status: ${overallStatus.toUpperCase()}`)
  console.log(`   - Confidence: ${(confidenceScore * 100).toFixed(1)}%`)
  console.log(`   - Corrections made: ${corrections.length}`)

  return {
    status: overallStatus,
    confidence_score: Math.max(0, Math.min(1, confidenceScore)),
    validations,
    corrections_made: corrections,
    enhanced_assessment: assessment, // With corrections applied
  }
}

function checkCompleteness(assessment: ClaudeAssessmentOutput) {
  const issues: string[] = []

  // Check all photos are classified
  const unassignedPhotos = assessment.photo_organization.unassigned
  if (unassignedPhotos.length > 0) {
    issues.push(`${unassignedPhotos.length} photos remain unclassified`)
  }

  // Check all damage items have photos
  const damageWithoutPhotos = assessment.damage_inventory.filter(
    (item) => item.photos.length === 0
  )
  if (damageWithoutPhotos.length > 0) {
    issues.push(`${damageWithoutPhotos.length} damage items lack photo evidence`)
  }

  // Check all damage items have scope tasks
  const damageWithoutScope = assessment.damage_inventory.filter(
    (item) =>
      !assessment.scope_of_work.some((scope) => scope.damage_item_id === item.item_id)
  )
  if (damageWithoutScope.length > 0) {
    issues.push(`${damageWithoutScope.length} damage items lack repair scope`)
  }

  return {
    check: 'completeness',
    status: issues.length === 0 ? ('pass' as const) : ('warning' as const),
    details: issues.length === 0 ? 'All elements complete' : issues.join('; '),
  }
}

function checkConsistency(assessment: ClaudeAssessmentOutput) {
  const issues: string[] = []

  // Check severity matches scope complexity
  for (const damageItem of assessment.damage_inventory) {
    const scope = assessment.scope_of_work.find(
      (s) => s.damage_item_id === damageItem.item_id
    )

    if (scope) {
      const taskCount = scope.tasks.length

      // Severe damage should have multiple tasks
      if (damageItem.severity === 'severe' && taskCount < 3) {
        issues.push(
          `Damage ${damageItem.item_id} marked severe but only ${taskCount} tasks`
        )
      }

      // Minor damage shouldn't have excessive tasks
      if (damageItem.severity === 'minor' && taskCount > 5) {
        issues.push(
          `Damage ${damageItem.item_id} marked minor but has ${taskCount} tasks`
        )
      }
    }
  }

  return {
    check: 'consistency',
    status: issues.length === 0 ? ('pass' as const) : ('warning' as const),
    details: issues.length === 0 ? 'Severity and scope aligned' : issues.join('; '),
  }
}

function checkPhotoCorrelation(assessment: ClaudeAssessmentOutput) {
  const issues: string[] = []

  // Verify photo IDs in damage items exist in photo organization
  const allPhotoIds = new Set([
    ...Object.values(assessment.photo_organization.exterior).flat(),
    ...Object.values(assessment.photo_organization.interior).flat(),
    ...assessment.photo_organization.unassigned,
  ])

  for (const damageItem of assessment.damage_inventory) {
    for (const photoId of damageItem.photos) {
      if (!allPhotoIds.has(photoId)) {
        issues.push(`Photo ${photoId} referenced but not in organization`)
      }
    }
  }

  return {
    check: 'photo_correlation',
    status: issues.length === 0 ? ('pass' as const) : ('fail' as const),
    details:
      issues.length === 0 ? 'All photos properly correlated' : issues.join('; '),
  }
}

function checkScopeAlignment(assessment: ClaudeAssessmentOutput) {
  const issues: string[] = []

  // Verify all scope work references valid damage items
  for (const scope of assessment.scope_of_work) {
    const damageItem = assessment.damage_inventory.find(
      (item) => item.item_id === scope.damage_item_id
    )

    if (!damageItem) {
      issues.push(`Scope references non-existent damage item ${scope.damage_item_id}`)
    }

    // Check tasks have required fields
    for (const task of scope.tasks) {
      if (!task.quantity || !task.unit || !task.trade) {
        issues.push(`Task ${task.task_id} missing required fields`)
      }
    }
  }

  return {
    check: 'scope_alignment',
    status: issues.length === 0 ? ('pass' as const) : ('fail' as const),
    details: issues.length === 0 ? 'Scope properly aligned with damage' : issues.join('; '),
  }
}

function checkProfessionalLanguage(assessment: ClaudeAssessmentOutput) {
  const corrections: DerekValidationOutput['corrections_made'] = []
  const issues: string[] = []

  // Common unprofessional terms to replace
  const replacements: Record<string, string> = {
    'really bad': 'severe',
    'messed up': 'damaged',
    'broken': 'damaged',
    'busted': 'damaged',
    'needs fixed': 'requires repair',
    sheetrock: 'drywall',
  }

  // Check damage descriptions
  for (const item of assessment.damage_inventory) {
    let corrected = item.description
    let changed = false

    for (const [informal, professional] of Object.entries(replacements)) {
      if (corrected.toLowerCase().includes(informal)) {
        corrected = corrected.replace(new RegExp(informal, 'gi'), professional)
        changed = true
      }
    }

    if (changed) {
      corrections.push({
        field: `damage_inventory[${item.item_id}].description`,
        original: item.description,
        corrected,
        reason: 'Professionalized language',
      })
      item.description = corrected
    }
  }

  return {
    validation: {
      check: 'professional_language',
      status: corrections.length === 0 ? ('pass' as const) : ('pass' as const),
      details:
        corrections.length === 0
          ? 'Professional terminology maintained'
          : `${corrections.length} language corrections applied`,
    },
    corrections,
  }
}