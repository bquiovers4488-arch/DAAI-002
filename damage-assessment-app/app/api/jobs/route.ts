import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { z } from 'zod'

const createJobSchema = z.object({
  propertyAddress: z.string().optional(),
  propertyZip: z.string().optional(),
  propertyType: z.enum(['SINGLE_FAMILY_RESIDENTIAL', 'MULTI_FAMILY_RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL']).optional(),
  companyName: z.string().optional(),
  brandingConfig: z.any().optional(),
  estimateTier: z.enum(['ECONOMY', 'STANDARD', 'PREMIUM']).optional(),
})

// GET /api/jobs - List all jobs for user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const skip = (page - 1) * limit

    // Get jobs for user
    const [jobs, total] = await Promise.all([
      prisma.assessmentJob.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          status: true,
          propertyAddress: true,
          propertyZip: true,
          photoCount: true,
          createdAt: true,
          completedAt: true,
          reportUrl: true,
          confidenceScore: true,
        },
      }),
      prisma.assessmentJob.count({
        where: { userId: user.id },
      }),
    ])

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get jobs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/jobs - Create new job
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check subscription limits
    if (user.subscription) {
      if (user.subscription.reportsUsed >= user.subscription.reportsLimit) {
        return NextResponse.json(
          { error: 'Report limit reached. Please upgrade your plan.' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const data = createJobSchema.parse(body)

    // Create job
    const job = await prisma.assessmentJob.create({
      data: {
        userId: user.id,
        propertyAddress: data.propertyAddress,
        propertyZip: data.propertyZip,
        propertyType: data.propertyType,
        companyName: data.companyName || user.company,
        brandingConfig: data.brandingConfig,
        estimateTier: data.estimateTier || 'STANDARD',
        status: 'CREATED',
      },
    })

    return NextResponse.json({
      job,
      message: 'Job created successfully',
    })
  } catch (error) {
    console.error('Create job error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}