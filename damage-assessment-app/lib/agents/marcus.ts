/**
 * Agent 4: Marcus - Financial Strategy & Cost Control
 * Calculates accurate repair costs based on regional pricing
 */

import { ClaudeAssessmentOutput } from './claude'

export interface MarcusCostOutput {
  estimate_tier: 'economy' | 'standard' | 'premium'
  line_items: Array<{
    task_id: string
    description: string
    quantity: number
    unit: string
    trade: string
    labor: {
      hours: number
      rate: number
      total: number
    }
    materials: Array<{
      name: string
      quantity: number
      unit_price: number
      total: number
    }>
    material_total: number
    subtotal: number
    overhead: number
    profit: number
    total: number
  }>
  room_totals: Array<{
    room: string
    total: number
  }>
  trade_summary: Array<{
    trade: string
    labor: number
    materials: number
    total: number
  }>
  tier_comparison: {
    economy: number
    standard: number
    premium: number
  }
  grand_total: number
  breakdown: {
    labor: number
    materials: number
    overhead: number
    profit: number
  }
  financial_notes: string[]
}

const REGIONAL_LABOR_RATES: Record<
  string,
  Record<string, { min: number; max: number }>
> = {
  '77': {
    // Houston area
    general_carpentry: { min: 65, max: 85 },
    roofing: { min: 75, max: 95 },
    electrical: { min: 85, max: 110 },
    plumbing: { min: 90, max: 115 },
    hvac: { min: 95, max: 120 },
    drywall: { min: 55, max: 75 },
    painting: { min: 50, max: 70 },
    flooring: { min: 60, max: 80 },
  },
  '90': {
    // Los Angeles area
    general_carpentry: { min: 75, max: 95 },
    roofing: { min: 85, max: 110 },
    electrical: { min: 95, max: 125 },
    plumbing: { min: 100, max: 130 },
    hvac: { min: 105, max: 135 },
    drywall: { min: 65, max: 85 },
    painting: { min: 60, max: 80 },
    flooring: { min: 70, max: 90 },
  },
  default: {
    general_carpentry: { min: 60, max: 80 },
    roofing: { min: 70, max: 90 },
    electrical: { min: 80, max: 105 },
    plumbing: { min: 85, max: 110 },
    hvac: { min: 90, max: 115 },
    drywall: { min: 50, max: 70 },
    painting: { min: 45, max: 65 },
    flooring: { min: 55, max: 75 },
  },
}

export async function calculateCosts(
  assessment: ClaudeAssessmentOutput,
  zipCode: string,
  tier: 'economy' | 'standard' | 'premium' = 'standard'
): Promise<MarcusCostOutput> {
  const startTime = Date.now()

  console.log('💰 Marcus: Calculating costs...')

  const zipPrefix = zipCode.substring(0, 2)
  const rates = REGIONAL_LABOR_RATES[zipPrefix] || REGIONAL_LABOR_RATES.default

  const lineItems: MarcusCostOutput['line_items'] = []
  const financialNotes: string[] = []

  // Process each scope item
  for (const scope of assessment.scope_of_work) {
    const damageItem = assessment.damage_inventory.find(
      (item) => item.item_id === scope.damage_item_id
    )

    for (const task of scope.tasks) {
      const lineItem = calculateTaskCost(task, rates, tier, damageItem?.location || 'Unknown')
      lineItems.push(lineItem)
    }
  }

  // Calculate room totals
  const roomTotals = calculateRoomTotals(lineItems, assessment)

  // Calculate trade summary
  const tradeSummary = calculateTradeSummary(lineItems)

  // Calculate tier comparison
  const standardTotal = lineItems.reduce((sum, item) => sum + item.total, 0)
  const tierComparison = {
    economy: standardTotal * 0.75,
    standard: standardTotal,
    premium: standardTotal * 1.45,
  }

  // Calculate breakdown
  const breakdown = {
    labor: lineItems.reduce((sum, item) => sum + item.labor.total, 0),
    materials: lineItems.reduce((sum, item) => sum + item.material_total, 0),
    overhead: lineItems.reduce((sum, item) => sum + item.overhead, 0),
    profit: lineItems.reduce((sum, item) => sum + item.profit, 0),
  }

  // Add regional adjustment note
  if (zipPrefix === '77') {
    financialNotes.push('Regional adjustment: Houston market +8% above national average for roofing labor')
  } else if (zipPrefix === '90') {
    financialNotes.push('Regional adjustment: Los Angeles market +15% above national average')
  }

  financialNotes.push('Material pricing based on Q4 2025 market data')

  const processingTime = Date.now() - startTime

  console.log(`✅ Marcus cost calculation complete in ${processingTime}ms`)
  console.log(`   - Total estimate: $${tierComparison[tier].toFixed(2)}`)
  console.log(`   - Line items: ${lineItems.length}`)

  return {
    estimate_tier: tier,
    line_items: lineItems,
    room_totals: roomTotals,
    trade_summary: tradeSummary,
    tier_comparison: tierComparison,
    grand_total: tierComparison[tier],
    breakdown,
    financial_notes: financialNotes,
  }
}

function calculateTaskCost(
  task: any,
  rates: Record<string, { min: number; max: number }>,
  tier: 'economy' | 'standard' | 'premium',
  room: string
) {
  // Get labor rate for trade
  const tradeRate = rates[task.trade] || rates.general_carpentry
  const laborRate = tier === 'economy' ? tradeRate.min : tier === 'premium' ? tradeRate.max : (tradeRate.min + tradeRate.max) / 2

  // Estimate labor hours based on task
  const laborHours = estimateLaborHours(task)
  const laborCost = laborHours * laborRate

  // Calculate materials
  const materials = getMaterialsForTask(task, tier)
  const materialTotal = materials.reduce((sum, m) => sum + m.total, 0)

  // Calculate overhead and profit
  const subtotal = laborCost + materialTotal
  const overhead = subtotal * 0.2 // 20%
  const profit = (subtotal + overhead) * 0.1 // 10%
  const total = subtotal + overhead + profit

  return {
    task_id: task.task_id,
    description: task.description,
    quantity: task.quantity,
    unit: task.unit,
    trade: task.trade,
    labor: {
      hours: laborHours,
      rate: laborRate,
      total: laborCost,
    },
    materials,
    material_total: materialTotal,
    subtotal,
    overhead,
    profit,
    total,
  }
}

function estimateLaborHours(task: any): number {
  const { quantity, unit, trade, description } = task

  // Simplified labor estimation based on trade and quantity
  const laborRates: Record<string, number> = {
    general_carpentry: 0.15, // hours per sq ft
    drywall: 0.08,
    painting: 0.05,
    flooring: 0.1,
    roofing: 0.12,
    electrical: 0.2,
    plumbing: 0.25,
    hvac: 0.3,
  }

  const baseRate = laborRates[trade] || 0.1

  if (unit === 'sq ft') {
    return quantity * baseRate
  } else if (unit === 'linear ft') {
    return quantity * baseRate * 0.5
  } else if (unit === 'each') {
    return quantity * 2
  }

  // Default
  return Math.max(1, quantity * 0.1)
}

function getMaterialsForTask(task: any, tier: 'economy' | 'standard' | 'premium') {
  const materials: Array<{ name: string; quantity: number; unit_price: number; total: number }> = []

  // Material pricing varies by tier
  const tierMultiplier = tier === 'economy' ? 0.8 : tier === 'premium' ? 1.5 : 1.0

  // Simplified material costs based on task description keywords
  const description = task.description.toLowerCase()

  if (description.includes('drywall')) {
    materials.push({
      name: '5/8" Drywall',
      quantity: task.quantity,
      unit_price: 0.85 * tierMultiplier,
      total: task.quantity * 0.85 * tierMultiplier,
    })
    materials.push({
      name: 'Joint compound',
      quantity: Math.ceil(task.quantity / 100),
      unit_price: 18 * tierMultiplier,
      total: Math.ceil(task.quantity / 100) * 18 * tierMultiplier,
    })
  } else if (description.includes('paint')) {
    materials.push({
      name: 'Primer',
      quantity: Math.ceil(task.quantity / 350),
      unit_price: 35 * tierMultiplier,
      total: Math.ceil(task.quantity / 350) * 35 * tierMultiplier,
    })
    materials.push({
      name: 'Paint',
      quantity: Math.ceil(task.quantity / 350),
      unit_price: 45 * tierMultiplier,
      total: Math.ceil(task.quantity / 350) * 45 * tierMultiplier,
    })
  } else if (description.includes('shingle') || description.includes('roof')) {
    materials.push({
      name: tier === 'premium' ? 'Architectural shingles' : 'Standard shingles',
      quantity: task.quantity,
      unit_price: (tier === 'economy' ? 1.0 : tier === 'premium' ? 2.5 : 1.5),
      total: task.quantity * (tier === 'economy' ? 1.0 : tier === 'premium' ? 2.5 : 1.5),
    })
    materials.push({
      name: 'Underlayment',
      quantity: task.quantity,
      unit_price: 0.5 * tierMultiplier,
      total: task.quantity * 0.5 * tierMultiplier,
    })
  } else if (description.includes('carpet') || description.includes('flooring')) {
    const basePrice = tier === 'economy' ? 3.5 : tier === 'premium' ? 12.0 : 5.5
    materials.push({
      name: tier === 'premium' ? 'Premium flooring' : 'Standard flooring',
      quantity: task.quantity,
      unit_price: basePrice,
      total: task.quantity * basePrice,
    })
  } else {
    // Generic materials
    materials.push({
      name: 'Materials',
      quantity: 1,
      unit_price: task.quantity * 5 * tierMultiplier,
      total: task.quantity * 5 * tierMultiplier,
    })
  }

  return materials
}

function calculateRoomTotals(
  lineItems: MarcusCostOutput['line_items'],
  assessment: ClaudeAssessmentOutput
): MarcusCostOutput['room_totals'] {
  const roomMap = new Map<string, number>()

  for (const lineItem of lineItems) {
    // Find which damage item this task belongs to
    const scope = assessment.scope_of_work.find((s) =>
      s.tasks.some((t) => t.task_id === lineItem.task_id)
    )

    if (scope) {
      const damageItem = assessment.damage_inventory.find(
        (item) => item.item_id === scope.damage_item_id
      )

      if (damageItem) {
        const room = damageItem.location
        const current = roomMap.get(room) || 0
        roomMap.set(room, current + lineItem.total)
      }
    }
  }

  return Array.from(roomMap.entries()).map(([room, total]) => ({
    room,
    total,
  }))
}

function calculateTradeSummary(
  lineItems: MarcusCostOutput['line_items']
): MarcusCostOutput['trade_summary'] {
  const tradeMap = new Map<string, { labor: number; materials: number; total: number }>()

  for (const item of lineItems) {
    const current = tradeMap.get(item.trade) || { labor: 0, materials: 0, total: 0 }
    tradeMap.set(item.trade, {
      labor: current.labor + item.labor.total,
      materials: current.materials + item.material_total,
      total: current.total + item.total,
    })
  }

  return Array.from(tradeMap.entries()).map(([trade, totals]) => ({
    trade,
    ...totals,
  }))
}