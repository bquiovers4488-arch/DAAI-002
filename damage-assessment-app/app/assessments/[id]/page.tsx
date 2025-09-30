'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AssessmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJob()
  }, [params.id])

  const fetchJob = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const res = await fetch(`/api/jobs/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error('Failed to fetch job')
      }

      const data = await res.json()
      setJob(data.job)
    } catch (error) {
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Not Found</h2>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const isProcessing = !['COMPLETE', 'FAILED'].includes(job.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {job.propertyAddress || 'Assessment Details'}
            </h1>
            <p className="text-gray-600">
              Created {new Date(job.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    🤖 AI Team is Analyzing Your Photos...
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Our expert AI agents are working together to create your professional assessment report.
                  </p>

                  {/* Agent Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      {job.claudeCompletedAt ? (
                        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      )}
                      <span className="text-gray-900 font-medium">
                        Claude - Damage Assessment {job.claudeCompletedAt && '✓'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {job.derekCompletedAt ? (
                        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : job.derekStartedAt ? (
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                      )}
                      <span className="text-gray-900 font-medium">
                        Derek - Quality Validation {job.derekCompletedAt && '✓'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {job.alexCompletedAt ? (
                        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : job.alexStartedAt ? (
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                      )}
                      <span className="text-gray-900 font-medium">
                        Alex - Compliance Check {job.alexCompletedAt && '✓'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {job.marcusCompletedAt ? (
                        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : job.marcusStartedAt ? (
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                      )}
                      <span className="text-gray-900 font-medium">
                        Marcus - Cost Calculation {job.marcusCompletedAt && '✓'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-4">
                    💡 This usually takes 4-6 minutes. We'll refresh automatically when complete.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Completed Status */}
          {job.status === 'COMPLETE' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900">Assessment Complete! 🎉</h2>
              </div>
              <p className="text-gray-700 mb-6">
                Your professional damage assessment report is ready to download.
              </p>
              {job.confidenceScore && (
                <p className="text-sm text-gray-600 mb-6">
                  Confidence Score: <span className="font-bold text-green-600">{(job.confidenceScore * 100).toFixed(0)}%</span>
                </p>
              )}
              <div className="flex space-x-4">
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold">
                  📥 Download PDF Report
                </button>
                <button className="bg-white text-gray-700 px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 font-semibold">
                  📧 Email Report
                </button>
              </div>
            </div>
          )}

          {/* Failed Status */}
          {job.status === 'FAILED' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Failed</h2>
              <p className="text-gray-700 mb-4">
                {job.errorMessage || 'An error occurred while processing your assessment.'}
              </p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                Retry Assessment
              </button>
            </div>
          )}

          {/* Job Details */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Assessment Details</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Property Address</p>
                <p className="text-lg font-semibold text-gray-900">
                  {job.propertyAddress || 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">ZIP Code</p>
                <p className="text-lg font-semibold text-gray-900">{job.propertyZip || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Property Type</p>
                <p className="text-lg font-semibold text-gray-900">
                  {job.propertyType?.replace('_', ' ') || 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Photos Uploaded</p>
                <p className="text-lg font-semibold text-gray-900">{job.photoCount}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-lg font-semibold text-gray-900">{job.status}</p>
              </div>

              {job.totalProcessingMs && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Processing Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {(job.totalProcessingMs / 1000).toFixed(1)}s
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}