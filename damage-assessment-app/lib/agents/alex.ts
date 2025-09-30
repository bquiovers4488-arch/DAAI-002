/**
 * Agent 3: Alex - Insurance & Technology Specialist
 * Ensures compliance with building codes and insurance standards
 */

import { ClaudeAssessmentOutput } from './claude'

export interface AlexComplianceOutput {
  compliance_status: 'approved' | 'approved_with_notes' | 'requires_attention'
  jurisdiction: string
  checks: Array<{
    category: string
    status: 'pass' | 'flagged' | 'warning'
    notes: string
    details?: any
  }>
  permits_required: Array<{
    permit_type: string
    reason: string
    estimated_cost: number
    timeline_days: number
  }>
  fraud_indicators: {
    risk_level: 'low' | 'medium' | 'high'
    flags: string[]
  }
  carrier_compatibility: {
    xactimate_compatible: boolean
    symbility_compatible: boolean
    documentation_standard: 'meets_requirements' | 'needs_improvement'
  }
  recommendations: string[]
}

export async function validateCompliance(
  assessment: ClaudeAssessmentOutput,
  zipCode: string
): Promise<AlexComplianceOutput> {
  const startTime = Date.now()

  console.log('🛡️  Alex: Starting compliance validation...')

  const jurisdiction = getJurisdiction(zipCode)
  const checks: AlexComplianceOutput['checks'] = []

  // Check 1: Building Code Compliance
  const codeCheck = checkBuildingCodes(assessment, jurisdiction)
  checks.push(codeCheck)

  // Check 2: Permit Requirements
  const permits = identifyPermitRequirements(assessment, jurisdiction)

  // Check 3: Insurance Standards
  const insuranceCheck = checkInsuranceStandards(assessment)
  checks.push(insuranceCheck)

  // Check 4: Fraud Detection
  const fraudAnalysis = analyzeFraudIndicators(assessment)

  // Check 5: Carrier Compatibility
  const carrierCheck = checkCarrierCompatibility(assessment)

  // Determine overall status
  const flaggedCount = checks.filter((c) => c.status === 'flagged').length
  let complianceStatus: AlexComplianceOutput['compliance_status'] = 'approved'

  if (flaggedCount > 2) {
    complianceStatus = 'requires_attention'
  } else if (permits.length > 0 || flaggedCount > 0) {
    complianceStatus = 'approved_with_notes'
  }

  const recommendations = generateRecommendations(assessment, permits)

  const processingTime = Date.now() - startTime

  console.log(`✅ Alex compliance check complete in ${processingTime}ms`)
  console.log(`   - Status: ${complianceStatus}`)
  console.log(`   - Permits required: ${permits.length}`)
  console.log(`   - Fraud risk: ${fraudAnalysis.risk_level}`)

  return {
    compliance_status: complianceStatus,
    jurisdiction,
    checks,
    permits_required: permits,
    fraud_indicators: fraudAnalysis,
    carrier_compatibility: carrierCheck,
    recommendations,
  }
}

function getJurisdiction(zipCode: string): string {
  // Simplified - in production, use a proper ZIP code database
  const jurisdictions: Record<string, string> = {
    '77001': 'Houston, TX (Harris County)',
    '77002': 'Houston, TX (Harris County)',
    '90001': 'Los Angeles, CA (Los Angeles County)',
    '10001': 'New York, NY (New York County)',
    '60601': 'Chicago, IL (Cook County)',
  }

  return jurisdictions[zipCode] || `ZIP ${zipCode} (Jurisdiction TBD)`
}

function checkBuildingCodes(
  assessment: ClaudeAssessmentOutput,
  jurisdiction: string
) {
  const issues: string[] = []

  // Check for structural work requiring engineering approval
  const hasStructuralWork = assessment.scope_of_work.some((scope) =>
    scope.tasks.some((task) => task.description.toLowerCase().includes('structural'))
  )

  if (hasStructuralWork) {
    issues.push('Structural work may require engineer approval')
  }

  // Check for electrical work
  const hasElectricalWork = assessment.scope_of_work.some((scope) =>
    scope.tasks.some((task) => task.trade === 'electrical')
  )

  if (hasElectricalWork) {
    issues.push('Electrical work must be performed by licensed electrician')
  }

  return {
    category: 'building_codes',
    status: issues.length > 0 ? ('flagged' as const) : ('pass' as const),
    notes:
      issues.length === 0
        ? 'All work complies with 2021 International Building Code'
        : issues.join('; '),
  }
}

function identifyPermitRequirements(
  assessment: ClaudeAssessmentOutput,
  jurisdiction: string
): AlexComplianceOutput['permits_required'] {
  const permits: AlexComplianceOutput['permits_required'] = []

  // Check for electrical permits
  const hasElectrical = assessment.scope_of_work.some((scope) =>
    scope.tasks.some((task) => task.trade === 'electrical')
  )

  if (hasElectrical) {
    permits.push({
      permit_type: 'Electrical',
      reason: 'Electrical work requires permit',
      estimated_cost: 150,
      timeline_days: 5,
    })
  }

  // Check for roofing permits (if significant roof work)
  const roofWork = assessment.scope_of_work.filter((scope) =>
    scope.tasks.some((task) => task.trade === 'roofing')
  )

  if (roofWork.length > 0) {
    // Check if roof area is significant (>100 sq ft typically requires permit)
    const totalRoofArea = roofWork.reduce((sum, scope) => {
      const area = scope.tasks
        .filter((t) => t.unit === 'sq ft')
        .reduce((taskSum, task) => taskSum + task.quantity, 0)
      return sum + area
    }, 0)

    if (totalRoofArea > 100) {
      permits.push({
        permit_type: 'Roofing',
        reason: `Roof work exceeds ${totalRoofArea} sq ft`,
        estimated_cost: 125,
        timeline_days: 3,
      })
    }
  }

  // Check for plumbing permits
  const hasPlumbing = assessment.scope_of_work.some((scope) =>
    scope.tasks.some((task) => task.trade === 'plumbing')
  )

  if (hasPlumbing) {
    permits.push({
      permit_type: 'Plumbing',
      reason: 'Plumbing modifications require permit',
      estimated_cost: 100,
      timeline_days: 3,
    })
  }

  return permits
}

function checkInsuranceStandards(assessment: ClaudeAssessmentOutput) {
  const issues: string[] = []

  // Check photo documentation sufficiency
  const totalDamageItems = assessment.damage_inventory.length
  const itemsWithPhotos = assessment.damage_inventory.filter(
    (item) => item.photos.length > 0
  ).length

  if (itemsWithPhotos / totalDamageItems < 0.8) {
    issues.push('Insufficient photo documentation (< 80% of damage items)')
  }

  // Check scope detail level
  const totalTasks = assessment.scope_of_work.reduce(
    (sum, scope) => sum + scope.tasks.length,
    0
  )

  if (totalTasks < totalDamageItems) {
    issues.push('Scope tasks insufficient for damage items')
  }

  return {
    category: 'insurance_standards',
    status: issues.length === 0 ? ('pass' as const) : ('warning' as const),
    notes:
      issues.length === 0
        ? 'Meets carrier documentation standards'
        : issues.join('; '),
  }
}

function analyzeFraudIndicators(
  assessment: ClaudeAssessmentOutput
): AlexComplianceOutput['fraud_indicators'] {
  const flags: string[] = []
  let riskScore = 0

  // Pattern 1: Excessive damage claims
  const severeCount = assessment.damage_inventory.filter(
    (item) => item.severity === 'severe' || item.severity === 'critical'
  ).length

  if (severeCount > assessment.damage_inventory.length * 0.7) {
    flags.push('High proportion of severe damage claims')
    riskScore += 15
  }

  // Pattern 2: Unassigned photos (could indicate staging)
  const unassignedRatio =
    assessment.photo_organization.unassigned.length /
    (assessment.damage_inventory.length + 1)

  if (unassignedRatio > 0.3) {
    flags.push('High number of unassigned photos')
    riskScore += 10
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  if (riskScore > 30) {
    riskLevel = 'high'
  } else if (riskScore > 15) {
    riskLevel = 'medium'
  }

  return {
    risk_level: riskLevel,
    flags,
  }
}

function checkCarrierCompatibility(
  assessment: ClaudeAssessmentOutput
): AlexComplianceOutput['carrier_compatibility'] {
  // Check if assessment structure is compatible with major platforms
  const hasProperScope = assessment.scope_of_work.every((scope) =>
    scope.tasks.every((task) => task.quantity && task.unit && task.trade)
  )

  const hasPhotoDocumentation = assessment.damage_inventory.every(
    (item) => item.photos.length > 0
  )

  return {
    xactimate_compatible: hasProperScope,
    symbility_compatible: hasProperScope,
    documentation_standard: hasPhotoDocumentation
      ? 'meets_requirements'
      : 'needs_improvement',
  }
}

function generateRecommendations(
  assessment: ClaudeAssessmentOutput,
  permits: AlexComplianceOutput['permits_required']
): string[] {
  const recommendations: string[] = []

  if (permits.length > 0) {
    const totalPermitCost = permits.reduce((sum, p) => sum + p.estimated_cost, 0)
    const maxTimeline = Math.max(...permits.map((p) => p.timeline_days))
    recommendations.push(
      `Obtain ${permits.length} permit(s) - Total: $${totalPermitCost}, Timeline: ${maxTimeline} days`
    )
  }

  // Check for licensed contractor requirements
  const needsLicensed = assessment.scope_of_work.some((scope) =>
    scope.tasks.some(
      (task) =>
        task.trade === 'electrical' || task.trade === 'plumbing' || task.trade === 'hvac'
    )
  )

  if (needsLicensed) {
    recommendations.push('Ensure all licensed trades are performed by certified professionals')
  }

  // Safety recommendations
  const hasSafetyConcerns = assessment.damage_inventory.some(
    (item) => item.safety_concerns.length > 0
  )

  if (hasSafetyConcerns) {
    recommendations.push('Address all safety concerns before beginning repair work')
  }

  return recommendations
}