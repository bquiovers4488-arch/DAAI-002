import AWS from 'aws-sdk'

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'damage-assessment-photos'

export async function generateUploadUrl(
  jobId: string,
  fileName: string,
  contentType: string
): Promise<string> {
  const key = `jobs/${jobId}/photos/${Date.now()}-${fileName}`

  const url = s3.getSignedUrl('putObject', {
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    Expires: 3600, // 1 hour
  })

  return url
}

export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const result = await s3
    .upload({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
    .promise()

  return result.Location
}

export async function deleteFile(key: string): Promise<void> {
  await s3
    .deleteObject({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    .promise()
}

export async function getFileUrl(key: string): Promise<string> {
  return s3.getSignedUrl('getObject', {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: 3600, // 1 hour
  })
}

export function getStorageKey(jobId: string, fileName: string): string {
  return `jobs/${jobId}/photos/${Date.now()}-${fileName}`
}

export function getReportKey(jobId: string): string {
  return `jobs/${jobId}/report.pdf`
}