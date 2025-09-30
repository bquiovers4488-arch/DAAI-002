# Technical Implementation Specification
## AI Property Damage Assessment Platform

**Document Version:** 1.0
**Last Updated:** 2025-09-30
**Technical Lead:** Bryant Quiovers
**Status:** Ready for Development Sprint Planning

---

## Executive Summary

This document provides detailed technical specifications for building the AI-powered property damage assessment platform. It covers architecture decisions, technology stack, development phases, API specifications, database schemas, deployment infrastructure, and security requirements.

**Development Timeline:** 12 weeks to MVP launch
**Team Size:** 6-8 engineers + 2 AI/ML specialists
**Budget:** $250K-$350K (MVP phase)

---

## Technology Stack

### Frontend

**Framework:** Next.js 14+ (React 18+)
- **Why:** Server-side rendering, API routes, excellent developer experience, production-ready
- **TypeScript:** Strict type safety throughout application
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** React Context + Zustand (for complex state)
- **Form Handling:** React Hook Form + Zod validation
- **File Upload:** react-dropzone + TUS protocol (resumable uploads)

**Key Libraries:**
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "typescript": "^5.3.0",
  "tailwindcss": "^3.4.0",
  "zustand": "^4.4.0",
  "react-hook-form": "^7.49.0",
  "zod": "^3.22.0",
  "react-dropzone": "^14.2.0",
  "@react-pdf/renderer": "^3.1.0"
}
```

---

### Backend

**Framework:** Next.js API Routes + FastAPI (Python microservices)
- **Next.js API Routes:** User management, job orchestration, report generation
- **FastAPI:** AI agent processing, computer vision, ML inference
- **Node.js:** v20 LTS
- **Python:** 3.11+

**Key Backend Libraries:**
```json
// Node.js (package.json)
{
  "prisma": "^5.8.0",
  "@prisma/client": "^5.8.0",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "aws-sdk": "^2.1519.0",
  "bull": "^4.12.0",
  "ioredis": "^5.3.2",
  "stripe": "^14.10.0"
}
```

```python
# Python (requirements.txt)
fastapi==0.108.0
uvicorn[standard]==0.25.0
anthropic==0.8.0
openai==1.6.0
langchain==0.1.0
pillow==10.1.0
opencv-python==4.9.0
torch==2.1.0
torchvision==0.16.0
ultralytics==8.1.0  # YOLOv8
boto3==1.34.0
redis==5.0.1
pydantic==2.5.0
```

---

### Database

**Primary Database:** PostgreSQL 15+
- **Why:** ACID compliance, JSONB support, excellent performance, mature ecosystem
- **ORM:** Prisma (Node.js) + SQLAlchemy (Python)
- **Hosting:** AWS RDS PostgreSQL or Azure Database for PostgreSQL

**Caching:** Redis 7+
- **Use Cases:** Job queue (Bull/BullMQ), session storage, API response caching
- **Hosting:** AWS ElastiCache or Azure Cache for Redis

---

### File Storage

**Object Storage:** AWS S3 or Azure Blob Storage
- **Use Cases:** Photo storage, generated PDF reports
- **Access Pattern:** Presigned URLs for secure temporary access
- **Lifecycle:** Auto-delete after 90 days (configurable)

---

### AI/ML Infrastructure

**LLM APIs:**
- **Primary:** Anthropic Claude 3.5 Sonnet (Agents 1-4)
- **Backup:** OpenAI GPT-4 Turbo
- **Why:** Claude excels at structured output, long context, instruction following

**Computer Vision:**
- **Damage Detection:** YOLOv8 (custom-trained) or Roboflow-hosted model
- **Room Classification:** EfficientNet-B4 (fine-tuned on interior photos)
- **Image Preprocessing:** OpenCV, Pillow
- **Infrastructure:** AWS EC2 g4dn instances (NVIDIA T4 GPUs) or Azure NC-series

**Agent Orchestration:**
- **Framework:** LangChain or CrewAI
- **Why:** Built-in multi-agent coordination, prompt management, tool integration

---

### DevOps & Infrastructure

**Hosting:** Vercel (frontend) + AWS/Azure (backend + AI services)
- **Why Vercel:** Best-in-class Next.js hosting, automatic scaling, excellent DX
- **Why AWS/Azure:** Mature AI/ML services, scalable infrastructure, enterprise-ready

**CI/CD:** GitHub Actions
**Monitoring:** Sentry (error tracking) + Datadog/New Relic (APM)
**Logging:** CloudWatch (AWS) or Azure Monitor
**Version Control:** GitHub

---

### Payment Processing

**Provider:** Stripe
- **Subscription Billing:** Recurring monthly/annual plans
- **Usage-Based:** Metered billing for overage charges
- **Features:** Customer portal, invoice management, tax automation

---

## System Architecture

### High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Web App   │  │ Mobile App  │  │   API SDK   │             │
│  │  (Next.js)  │  │ (React Native)│  │  (Future)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                             │
│  ┌──────────────────────────────────────────────────┐           │
│  │  Next.js API Routes (Node.js)                    │           │
│  │  - Authentication & Authorization                │           │
│  │  - User Management                               │           │
│  │  - Job Orchestration                             │           │
│  │  - Payment Processing                            │           │
│  └──────────────────────────────────────────────────┘           │
└────────────────────────────┬─────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐
│  PostgreSQL     │  │    Redis     │  │   S3/Blob        │
│  (Primary DB)   │  │ (Queue+Cache)│  │  (File Storage)  │
└─────────────────┘  └──────────────┘  └──────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                  AI AGENT PROCESSING LAYER                       │
│  ┌────────────────────────────────────────────────────┐         │
│  │  FastAPI Workers (Python)                          │         │
│  │                                                     │         │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  │ Agent 1  │  │ Agent 2  │  │ Agent 3  │  │ Agent 4  │   │
│  │  │ (Claude) │  │ (Derek)  │  │ (Alex)   │  │ (Marcus) │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  │                                                     │         │
│  │  Computer Vision Models:                           │         │
│  │  - YOLOv8 (damage detection)                       │         │
│  │  - EfficientNet (room classification)              │         │
│  └────────────────────────────────────────────────────┘         │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Anthropic   │  │    Stripe    │  │   Sendgrid   │          │
│  │  Claude API  │  │   Payments   │  │    Email     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Core Tables (Prisma Schema)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER MANAGEMENT
// ============================================

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // bcrypt hashed
  firstName String?
  lastName  String?
  company   String?
  phone     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  subscription Subscription?
  jobs         AssessmentJob[]
  apiKeys      ApiKey[]
}

model Subscription {
  id         String   @id @default(uuid())
  userId     String   @unique
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  plan       PlanType // STARTER, PROFESSIONAL, BUSINESS, ENTERPRISE
  status     SubscriptionStatus // ACTIVE, CANCELED, PAST_DUE, TRIALING

  stripeCustomerId     String @unique
  stripeSubscriptionId String @unique

  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd  Boolean @default(false)

  reportsUsed     Int @default(0)
  reportsLimit    Int // Based on plan

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum PlanType {
  STARTER
  PROFESSIONAL
  BUSINESS
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  TRIALING
  INCOMPLETE
}

// ============================================
// ASSESSMENT JOBS
// ============================================

model AssessmentJob {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])

  status      JobStatus @default(CREATED)

  // Input data
  propertyAddress  String?
  propertyZip      String?
  propertyType     PropertyType?

  companyName      String?
  brandingConfig   Json?  // {logo_url, colors, fonts}

  photoCount       Int    @default(0)
  estimateTier     EstimateTier @default(STANDARD)

  // Processing metadata
  createdAt           DateTime  @default(now())
  claudeStartedAt     DateTime?
  claudeCompletedAt   DateTime?
  derekStartedAt      DateTime?
  derekCompletedAt    DateTime?
  alexStartedAt       DateTime?
  alexCompletedAt     DateTime?
  marcusStartedAt     DateTime?
  marcusCompletedAt   DateTime?
  completedAt         DateTime?

  totalProcessingMs   Int?

  // Agent outputs (stored as JSONB)
  claudeOutput   Json?
  derekOutput    Json?
  alexOutput     Json?
  marcusOutput   Json?
  finalAssessment Json?

  // Generated report
  reportUrl      String?
  reportFileName String?

  // Quality metrics
  confidenceScore Decimal? @db.Decimal(3, 2)

  // Error handling
  errorMessage String?
  retryCount   Int     @default(0)

  // Relations
  photos Photo[]

  @@index([userId, status])
  @@index([createdAt])
}

enum JobStatus {
  CREATED
  UPLOADING
  ANALYZING        // Claude processing
  VALIDATING       // Derek processing
  COMPLIANCE_CHECK // Alex processing
  COSTING          // Marcus processing
  GENERATING       // PDF generation
  COMPLETE
  FAILED
}

enum PropertyType {
  SINGLE_FAMILY_RESIDENTIAL
  MULTI_FAMILY_RESIDENTIAL
  COMMERCIAL
  INDUSTRIAL
}

enum EstimateTier {
  ECONOMY
  STANDARD
  PREMIUM
}

// ============================================
// PHOTOS
// ============================================

model Photo {
  id            String   @id @default(uuid())
  jobId         String
  job           AssessmentJob @relation(fields: [jobId], references: [id], onDelete: Cascade)

  fileName      String
  fileSize      Int      // bytes
  mimeType      String

  storageUrl    String   // S3/Azure URL
  thumbnailUrl  String?

  width         Int?
  height        Int?

  // EXIF metadata
  takenAt       DateTime?
  gpsLatitude   Decimal?  @db.Decimal(10, 8)
  gpsLongitude  Decimal?  @db.Decimal(11, 8)
  cameraMake    String?
  cameraModel   String?

  // Classification (populated by agents)
  locationType  LocationType?
  locationName  String?      // "Master Bedroom", "North Elevation", etc.
  elevation     Elevation?

  // Damage detected
  hasDamage     Boolean @default(false)
  damageTypes   String[] // ["roof_damage", "water_damage"]

  uploadedAt    DateTime @default(now())

  @@index([jobId])
}

enum LocationType {
  INTERIOR
  EXTERIOR
  SITE
  UNASSIGNED
}

enum Elevation {
  NORTH
  SOUTH
  EAST
  WEST
  ROOF
}

// ============================================
// API KEYS (for enterprise customers)
// ============================================

model ApiKey {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name      String   // User-friendly name
  key       String   @unique // hashed API key

  lastUsedAt DateTime?
  createdAt  DateTime @default(now())
  expiresAt  DateTime?

  isActive   Boolean @default(true)

  @@index([userId])
}

// ============================================
// AUDIT LOGS
// ============================================

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  jobId     String?

  action    String   // "job_created", "report_downloaded", etc.
  details   Json?
  ipAddress String?
  userAgent String?

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([jobId])
  @@index([createdAt])
}
```

---

## API Specification

### Authentication

**All API requests require authentication via JWT token or API key.**

**Headers:**
```
Authorization: Bearer <jwt_token>
# OR
X-API-Key: <api_key>
```

---

### Endpoints

#### **POST /api/auth/register**
Create new user account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "company": "ABC Adjusters"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "jwt_token_here"
}
```

---

#### **POST /api/auth/login**
Authenticate user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "user": { /* user object */ },
  "token": "jwt_token_here"
}
```

---

#### **POST /api/jobs**
Create new assessment job

**Request:**
```json
{
  "propertyAddress": "123 Main St, Houston, TX 77001",
  "propertyZip": "77001",
  "propertyType": "SINGLE_FAMILY_RESIDENTIAL",
  "companyName": "ABC Adjusters",
  "brandingConfig": {
    "logoUrl": "https://...",
    "colors": ["#1E3A8A", "#3B82F6", "#93C5FD"]
  },
  "estimateTier": "STANDARD"
}
```

**Response:**
```json
{
  "jobId": "uuid",
  "status": "CREATED",
  "uploadUrl": "https://upload.example.com/presigned-url"
}
```

---

#### **POST /api/jobs/:jobId/upload**
Upload photos to job (multipart/form-data)

**Request:**
```
Content-Type: multipart/form-data

files[]: <file1>
files[]: <file2>
...
```

**Response:**
```json
{
  "jobId": "uuid",
  "uploadedCount": 47,
  "status": "UPLOADING"
}
```

---

#### **POST /api/jobs/:jobId/process**
Start AI processing pipeline

**Request:**
```json
{
  "priority": "normal"  // or "high" for paid priority
}
```

**Response:**
```json
{
  "jobId": "uuid",
  "status": "ANALYZING",
  "estimatedCompletionTime": "2025-09-30T14:45:00Z"
}
```

---

#### **GET /api/jobs/:jobId**
Get job status and results

**Response:**
```json
{
  "jobId": "uuid",
  "status": "COMPLETE",
  "progress": {
    "claude": "complete",
    "derek": "complete",
    "alex": "complete",
    "marcus": "complete"
  },
  "photoCount": 47,
  "processingTimeMs": 245000,
  "confidenceScore": 0.94,
  "reportUrl": "https://reports.example.com/uuid.pdf",
  "createdAt": "2025-09-30T14:30:00Z",
  "completedAt": "2025-09-30T14:35:00Z"
}
```

---

#### **GET /api/jobs/:jobId/assessment**
Get detailed assessment data (JSON)

**Response:**
```json
{
  "assessmentId": "uuid",
  "property": { /* ... */ },
  "damageInventory": [ /* ... */ ],
  "scopeOfWork": [ /* ... */ ],
  "costEstimate": { /* ... */ },
  "photoOrganization": { /* ... */ },
  "complianceReport": { /* ... */ },
  "validationReport": { /* ... */ }
}
```

---

#### **GET /api/jobs/:jobId/report**
Download PDF report

**Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="assessment_uuid.pdf"

<PDF binary data>
```

---

#### **POST /api/jobs/:jobId/export**
Export to external format

**Request:**
```json
{
  "format": "xactimate",  // or "symbility", "csv", "json"
  "options": {
    "includePhotos": true
  }
}
```

**Response:**
```json
{
  "exportUrl": "https://exports.example.com/uuid.esx",
  "format": "xactimate",
  "expiresAt": "2025-10-07T14:30:00Z"
}
```

---

#### **GET /api/jobs**
List all jobs for authenticated user

**Query Parameters:**
- `status` (optional): Filter by status
- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response:**
```json
{
  "jobs": [
    {
      "jobId": "uuid",
      "propertyAddress": "123 Main St",
      "status": "COMPLETE",
      "createdAt": "2025-09-30T14:30:00Z",
      "reportUrl": "https://..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "pages": 8
  }
}
```

---

#### **DELETE /api/jobs/:jobId**
Delete job and associated data

**Response:**
```json
{
  "success": true,
  "message": "Job and associated data deleted"
}
```

---

### Webhook Events (Enterprise)

**POST to customer webhook URL:**

**Event: job.completed**
```json
{
  "event": "job.completed",
  "timestamp": "2025-09-30T14:35:00Z",
  "data": {
    "jobId": "uuid",
    "status": "COMPLETE",
    "reportUrl": "https://...",
    "assessmentUrl": "https://api.example.com/jobs/uuid/assessment"
  }
}
```

---

## AI Agent Implementation

### Agent 1: Claude (Damage Assessment)

**Prompt Template:**
```python
SYSTEM_PROMPT = """
You are an elite property damage assessment expert with 20+ years of experience.

Your task:
1. Analyze the provided property damage photos
2. Identify all visible damage (type, severity, location)
3. Classify each photo by location (room name for interior, elevation for exterior)
4. Generate a comprehensive scope of work for repairs
5. Flag safety concerns and urgent items

Output structured JSON following this schema:
{json_schema}

Guidelines:
- Be thorough but concise in descriptions
- Use professional construction terminology
- Severity levels: minor, moderate, severe, critical
- Always correlate photos with damage items
"""

USER_PROMPT = """
Property Information:
- Address: {property_address}
- Type: {property_type}
- Photos: {photo_count} uploaded

Please analyze all photos and provide a complete damage assessment.
"""
```

**Implementation:**
```python
import anthropic
import json

async def claude_assess_damage(job_id: str, photos: list[str], property_data: dict):
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    # Prepare photo data (base64 encode for Claude)
    photo_messages = [
        {
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/jpeg",
                "data": base64_encode_photo(photo)
            }
        }
        for photo in photos
    ]

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=8000,
        system=SYSTEM_PROMPT.format(json_schema=ASSESSMENT_SCHEMA),
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": USER_PROMPT.format(**property_data)},
                    *photo_messages
                ]
            }
        ]
    )

    # Parse structured JSON output
    assessment = json.loads(response.content[0].text)

    # Save to database
    await save_claude_output(job_id, assessment)

    return assessment
```

---

### Agent 2: Derek (Validation)

**Prompt Template:**
```python
DEREK_PROMPT = """
You are a data quality specialist reviewing property damage assessments.

Your task:
1. Validate completeness (all photos classified, all damage has scope)
2. Check consistency (damage severity matches scope complexity)
3. Verify professional language and grammar
4. Benchmark against typical patterns
5. Provide corrections where needed

Input: {claude_assessment}

Output structured validation report with:
- Status: pass / needs_review / fail
- List of validations performed
- Any corrections made
- Confidence score (0-1)
"""
```

---

### Agent 3: Alex (Compliance)

**Prompt Template:**
```python
ALEX_PROMPT = """
You are an insurance compliance expert.

Property Jurisdiction: {jurisdiction}

Your task:
1. Verify building code compliance
2. Identify required permits
3. Check insurance carrier standards
4. Flag fraud indicators (if any)

Assessment Data: {validated_assessment}

Output compliance report with required permits and notes.
"""
```

---

### Agent 4: Marcus (Cost Estimation)

**Implementation:**
```python
async def marcus_estimate_costs(
    certified_assessment: dict,
    zip_code: str,
    tier: str = "standard"
):
    # Retrieve regional pricing data
    pricing_data = await get_regional_pricing(zip_code)

    estimates = []

    for scope_item in certified_assessment['scope_of_work']:
        for task in scope_item['tasks']:
            # Calculate labor
            labor_rate = pricing_data['labor_rates'][task['trade']]
            labor_hours = estimate_labor_hours(task)
            labor_cost = labor_rate * labor_hours

            # Calculate materials
            materials = get_materials_for_task(task, tier)
            material_cost = sum([
                m['unit_price'] * m['quantity']
                for m in materials
            ])

            # Apply overhead & profit
            subtotal = labor_cost + material_cost
            overhead = subtotal * 0.20
            profit = (subtotal + overhead) * 0.10
            total = subtotal + overhead + profit

            estimates.append({
                "task_id": task['task_id'],
                "description": task['description'],
                "labor": labor_cost,
                "materials": material_cost,
                "overhead": overhead,
                "profit": profit,
                "total": total
            })

    # Generate summaries
    trade_summary = group_estimates_by_trade(estimates)
    room_summary = group_estimates_by_room(estimates)

    return {
        "line_items": estimates,
        "trade_summary": trade_summary,
        "room_summary": room_summary,
        "grand_total": sum([e['total'] for e in estimates])
    }
```

---

## Job Queue System (Redis + Bull)

**Queue Configuration:**
```typescript
// queues/assessment.queue.ts
import Bull from 'bull';

export const assessmentQueue = new Bull('assessment', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

// Job processor
assessmentQueue.process('claude-analyze', async (job) => {
  const { jobId, photoUrls, propertyData } = job.data;

  try {
    // Download photos from S3
    const photos = await downloadPhotos(photoUrls);

    // Call Claude agent
    const assessment = await claudeAssessDamage(jobId, photos, propertyData);

    // Update job status
    await updateJobStatus(jobId, 'ANALYZING', 'VALIDATING');

    // Queue next agent (Derek)
    await assessmentQueue.add('derek-validate', {
      jobId,
      claudeOutput: assessment,
    });

    return { success: true, assessment };
  } catch (error) {
    console.error(`Claude processing failed for job ${jobId}:`, error);
    throw error;
  }
});

assessmentQueue.process('derek-validate', async (job) => {
  // Similar pattern for Derek
});

assessmentQueue.process('alex-compliance', async (job) => {
  // Similar pattern for Alex
});

assessmentQueue.process('marcus-cost', async (job) => {
  // Similar pattern for Marcus
});
```

---

## Report Generation (PDF)

**Technology:** Puppeteer (headless Chrome) or @react-pdf/renderer

**Approach: Puppeteer (Recommended for Complex Layouts)**

```typescript
// lib/pdf-generator.ts
import puppeteer from 'puppeteer';

export async function generatePdfReport(
  assessment: FinalAssessment,
  branding: BrandingConfig
): Promise<Buffer> {
  // Render HTML template
  const html = renderReportTemplate(assessment, branding);

  // Launch headless browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Load HTML content
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Generate PDF
  const pdf = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in',
    },
  });

  await browser.close();

  return pdf;
}

function renderReportTemplate(
  assessment: FinalAssessment,
  branding: BrandingConfig
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', sans-serif; }
        .cover-page { background: ${branding.colors[0]}; color: white; }
        /* ... more styles ... */
      </style>
    </head>
    <body>
      <!-- Cover Page -->
      <div class="cover-page">
        <img src="${branding.logoUrl}" />
        <h1>${assessment.property.address}</h1>
        <h2>Total: $${assessment.cost_estimate.grand_total}</h2>
      </div>

      <!-- Executive Summary -->
      <div class="executive-summary">
        <!-- ... -->
      </div>

      <!-- Damage Sections -->
      ${assessment.damage_inventory.map(renderDamageSection).join('')}

      <!-- Cost Summary -->
      <div class="cost-summary">
        ${renderCostTable(assessment.cost_estimate)}
      </div>
    </body>
    </html>
  `;
}
```

---

## Security Implementation

### 1. Authentication & Authorization

**JWT Configuration:**
```typescript
// lib/auth.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
}

// Middleware
export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { userId } = verifyToken(token);
    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

### 2. File Upload Security

**Validation:**
```typescript
// lib/file-validation.ts
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'application/pdf',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large (max 50MB)' };
  }

  return { valid: true };
}
```

**Presigned Upload URLs (S3):**
```typescript
import AWS from 'aws-sdk';

const s3 = new AWS.S3();

export async function generateUploadUrl(
  jobId: string,
  fileName: string,
  contentType: string
): Promise<string> {
  const key = `jobs/${jobId}/photos/${Date.now()}-${fileName}`;

  const url = s3.getSignedUrl('putObject', {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
    Expires: 3600, // 1 hour
  });

  return url;
}
```

---

### 3. Data Encryption

**At Rest (Database):**
- PostgreSQL encryption enabled at infrastructure level (AWS RDS/Azure)
- Sensitive fields (API keys) hashed with bcrypt

**In Transit:**
- TLS 1.3 for all API communication
- HTTPS only (redirect HTTP → HTTPS)

**Environment Variables:**
```bash
# .env.example
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
REDIS_URL="redis://:password@host:6379"

JWT_SECRET="random-256-bit-key"
ANTHROPIC_API_KEY="sk-..."
OPENAI_API_KEY="sk-..."

AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
S3_BUCKET="damage-assessment-photos"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

SENDGRID_API_KEY="SG..."
```

---

## Deployment

### Infrastructure as Code (Terraform)

**Example: AWS Deployment**

```hcl
# main.tf

provider "aws" {
  region = "us-east-1"
}

# VPC
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "damage-assessment-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier = "damage-assessment-db"

  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.t3.large"

  allocated_storage = 100
  storage_encrypted = true

  db_name  = "assessments"
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  multi_az                = true

  tags = {
    Environment = "production"
  }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id      = "damage-assessment-cache"
  engine          = "redis"
  engine_version  = "7.0"
  node_type       = "cache.t3.medium"
  num_cache_nodes = 1

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
}

# S3 Bucket
resource "aws_s3_bucket" "photos" {
  bucket = "damage-assessment-photos-prod"

  tags = {
    Environment = "production"
  }
}

resource "aws_s3_bucket_versioning" "photos" {
  bucket = aws_s3_bucket.photos.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "photos" {
  bucket = aws_s3_bucket.photos.id

  rule {
    id     = "delete-old-photos"
    status = "Enabled"

    expiration {
      days = 90
    }
  }
}

# ECS Cluster (for AI workers)
resource "aws_ecs_cluster" "workers" {
  name = "damage-assessment-workers"
}

# Auto-scaling for GPU instances (agent processing)
resource "aws_autoscaling_group" "gpu_workers" {
  name = "damage-assessment-gpu-workers"

  min_size         = 1
  max_size         = 10
  desired_capacity = 2

  vpc_zone_identifier = module.vpc.private_subnets

  launch_template {
    id      = aws_launch_template.gpu_worker.id
    version = "$Latest"
  }
}
```

---

### Deployment Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy-production.yml

name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run linter
        run: npm run lint

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Build Docker image
        run: docker build -t damage-assessment-api:${{ github.sha }} .

      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
          docker tag damage-assessment-api:${{ github.sha }} ${{ secrets.ECR_REGISTRY }}/damage-assessment-api:latest
          docker push ${{ secrets.ECR_REGISTRY }}/damage-assessment-api:latest

      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster prod-cluster --service api-service --force-new-deployment
```

---

## Monitoring & Observability

### Key Metrics Dashboard

**System Health:**
- API response time (p50, p95, p99)
- Error rate (5xx responses)
- Queue depth (jobs waiting)
- Processing time per agent
- Database connection pool usage

**Business Metrics:**
- Reports generated per hour
- Average time to completion
- User satisfaction (NPS scores)
- Subscription churn rate

**Implementation (Datadog):**
```typescript
import { StatsD } from 'hot-shots';

const dogstatsd = new StatsD({
  host: process.env.DATADOG_HOST,
  port: 8125,
  prefix: 'damage_assessment.',
});

// Track job processing
dogstatsd.increment('jobs.created');
dogstatsd.timing('jobs.processing_time', processingTimeMs);
dogstatsd.gauge('queue.depth', queueDepth);
```

---

## Testing Strategy

### Unit Tests

**Example: Cost Calculation Test**
```typescript
// __tests__/marcus.test.ts
import { calculateTaskCost } from '@/lib/agents/marcus';

describe('Marcus Cost Calculation', () => {
  it('should calculate correct labor cost', () => {
    const task = {
      description: 'Install drywall',
      quantity: 100,
      unit: 'sq ft',
      trade: 'general_carpentry',
    };

    const result = calculateTaskCost(task, '77001', 'standard');

    expect(result.labor).toBeCloseTo(650.00, 2); // $65/hr × 10 hours
  });

  it('should apply overhead and profit correctly', () => {
    const task = { /* ... */ };
    const result = calculateTaskCost(task, '77001', 'standard');

    const expectedOverhead = result.subtotal * 0.20;
    const expectedProfit = (result.subtotal + expectedOverhead) * 0.10;

    expect(result.overhead).toBeCloseTo(expectedOverhead, 2);
    expect(result.profit).toBeCloseTo(expectedProfit, 2);
  });
});
```

---

### Integration Tests

**Example: End-to-End Job Processing**
```typescript
// __tests__/integration/job-processing.test.ts
import { createJob, uploadPhotos, processJob, getJobResult } from '@/lib/api';

describe('Job Processing Integration', () => {
  it('should complete full pipeline', async () => {
    // Create job
    const job = await createJob({
      propertyAddress: '123 Test St',
      propertyZip: '77001',
    });

    // Upload photos
    await uploadPhotos(job.id, [
      './fixtures/photo1.jpg',
      './fixtures/photo2.jpg',
    ]);

    // Start processing
    await processJob(job.id);

    // Wait for completion (with timeout)
    const result = await waitForCompletion(job.id, { timeout: 300000 }); // 5 min

    expect(result.status).toBe('COMPLETE');
    expect(result.reportUrl).toBeDefined();
    expect(result.finalAssessment).toBeDefined();
  }, 360000); // 6 minute timeout
});
```

---

### Load Testing (k6)

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
  },
};

export default function () {
  const loginRes = http.post('https://api.example.com/auth/login', {
    email: 'test@example.com',
    password: 'password',
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  const token = loginRes.json('token');

  const jobRes = http.post(
    'https://api.example.com/jobs',
    JSON.stringify({
      propertyAddress: '123 Test St',
      propertyZip: '77001',
    }),
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  check(jobRes, {
    'job created': (r) => r.status === 200,
  });

  sleep(1);
}
```

---

## Development Roadmap

### Phase 1: Foundation (Weeks 1-4)

**Week 1:**
- [ ] Set up development environment
- [ ] Initialize Next.js project
- [ ] Set up PostgreSQL + Prisma
- [ ] Set up Redis
- [ ] Create basic authentication

**Week 2:**
- [ ] Implement file upload (S3 integration)
- [ ] Create job management API
- [ ] Build job queue system (Bull)
- [ ] Set up monitoring (Sentry, Datadog)

**Week 3:**
- [ ] Implement Claude agent (basic)
- [ ] Build computer vision pipeline (YOLOv8)
- [ ] Create photo classification logic
- [ ] Develop damage inventory schema

**Week 4:**
- [ ] Implement Derek agent (validation)
- [ ] Implement Alex agent (compliance basics)
- [ ] Implement Marcus agent (cost calculation)
- [ ] Test agent orchestration

---

### Phase 2: Core Features (Weeks 5-8)

**Week 5:**
- [ ] Build report generation (PDF)
- [ ] Create branding customization UI
- [ ] Implement multi-tier estimates
- [ ] Develop cost breakdown tables

**Week 6:**
- [ ] Build user dashboard
- [ ] Create job history/management UI
- [ ] Implement report preview
- [ ] Add download/share functionality

**Week 7:**
- [ ] Integrate Stripe payments
- [ ] Build subscription management
- [ ] Implement usage tracking
- [ ] Create billing portal

**Week 8:**
- [ ] Build admin dashboard
- [ ] Implement analytics tracking
- [ ] Create audit logging
- [ ] Develop export functionality (Xactimate)

---

### Phase 3: Polish & Launch (Weeks 9-12)

**Week 9:**
- [ ] Performance optimization
- [ ] Security audit & penetration testing
- [ ] Load testing (1000+ concurrent users)
- [ ] Bug fixes from testing

**Week 10:**
- [ ] Beta user onboarding (25 users)
- [ ] Collect feedback and iterate
- [ ] Create help documentation
- [ ] Record demo videos

**Week 11:**
- [ ] Marketing website (landing page)
- [ ] Set up customer support (Intercom/Zendesk)
- [ ] Create onboarding email sequences
- [ ] Finalize pricing tiers

**Week 12:**
- [ ] Production deployment
- [ ] Launch announcement (PR, social media)
- [ ] Monitor launch metrics
- [ ] Begin customer acquisition campaigns

---

## Cost Estimates

### Development Costs (MVP)

| Item | Cost |
|------|------|
| Engineering Team (8 people × 12 weeks) | $200K-$280K |
| Cloud Infrastructure (dev + staging) | $5K |
| Third-party APIs (Claude, OpenAI) | $5K |
| Design & UX | $10K |
| **Total MVP Cost** | **$220K-$300K** |

---

### Monthly Operating Costs (Post-Launch)

| Item | Monthly Cost |
|------|--------------|
| AWS/Azure Infrastructure | $3K-$8K |
| Claude API (10K reports × $0.50) | $5K |
| Database (RDS) | $500 |
| Redis (ElastiCache) | $200 |
| S3 Storage (10TB) | $300 |
| Monitoring (Datadog) | $500 |
| Email (Sendgrid) | $100 |
| Customer Support (Intercom) | $200 |
| **Total Monthly OpEx** | **$10K-$15K** |

**Break-even:** ~100-150 Professional plan users ($149/month)

---

## Risk Mitigation

### Technical Risks

**Risk: AI accuracy below expectations**
- **Mitigation:** Extensive training data collection, human-in-loop review queue, continuous model improvement

**Risk: Processing time exceeds 5 minutes**
- **Mitigation:** Parallel processing, GPU acceleration, optimize image preprocessing

**Risk: Scaling issues at 1000+ users**
- **Mitigation:** Load testing before launch, auto-scaling infrastructure, queue-based architecture

---

### Business Risks

**Risk: Low user adoption**
- **Mitigation:** Free trial program, aggressive marketing, referral incentives

**Risk: High churn rate**
- **Mitigation:** Excellent onboarding, responsive support, continuous product improvement

---

## Appendices

### Appendix A: Environment Setup

**Prerequisites:**
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose

**Quick Start:**
```bash
# Clone repository
git clone https://github.com/yourorg/damage-assessment-ai.git
cd damage-assessment-ai

# Install dependencies
npm install
pip install -r requirements.txt

# Set up database
npx prisma migrate dev
npx prisma db seed

# Start development servers
npm run dev          # Next.js (port 3000)
npm run worker       # Background workers
python -m api.main   # FastAPI (port 8000)

# Run tests
npm test
pytest
```

---

### Appendix B: Code Style Guide

**TypeScript:**
- Use ESLint + Prettier
- Prefer functional components (React)
- Use async/await over promises
- Type everything (no `any`)

**Python:**
- Follow PEP 8
- Use Black formatter
- Type hints required
- Docstrings for all functions

---

**Document Approval:**
- [ ] CTO: _____________
- [ ] Lead Backend Engineer: _____________
- [ ] Lead Frontend Engineer: _____________
- [ ] AI/ML Lead: _____________
- [ ] DevOps Lead: _____________

**Next Steps:**
1. Assemble development team
2. Set up development environment
3. Create initial sprint backlog
4. Begin Phase 1 development
5. Schedule daily standups and weekly sprint reviews

---

*End of Technical Implementation Specification*