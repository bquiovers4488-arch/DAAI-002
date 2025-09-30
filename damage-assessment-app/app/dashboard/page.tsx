'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Job {
  id: string
  status: string
  propertyAddress: string
  photoCount: number
  createdAt: string
  completedAt: string | null
  confidenceScore: number | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userData))
    fetchJobs(token)
  }, [router])

  const fetchJobs = async (token: string) => {
    try {
      const res = await fetch('/api/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error('Failed to fetch jobs')
      }

      const data = await res.json()
      setJobs(data.jobs)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      CREATED: 'bg-gray-100 text-gray-800',
      UPLOADING: 'bg-blue-100 text-blue-800',
      ANALYZING: 'bg-purple-100 text-purple-800',
      VALIDATING: 'bg-yellow-100 text-yellow-800',
      COMPLIANCE_CHECK: 'bg-orange-100 text-orange-800',
      COSTING: 'bg-indigo-100 text-indigo-800',
      GENERATING: 'bg-pink-100 text-pink-800',
      COMPLETE: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.CREATED}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">DA</span>
                </div>
                <span className="text-xl font-bold text-gray-900">DamageAssessment AI</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {user?.firstName || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'there'}!
          </h1>
          <p className="text-gray-600">
            Manage your property damage assessments and reports.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Total Reports</p>
            <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {jobs.filter((j) => j.status === 'COMPLETE').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">
              {jobs.filter((j) => !['COMPLETE', 'FAILED'].includes(j.status)).length}
            </p>
          </div>
        </div>

        {/* Create New Assessment Button */}
        <div className="mb-6">
          <Link
            href="/new-assessment"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Assessment</span>
          </Link>
        </div>

        {/* Assessments List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Assessments</h2>
          </div>

          {jobs.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No assessments yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first assessment to get started
              </p>
              <Link
                href="/new-assessment"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Assessment</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/assessments/${job.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {job.propertyAddress || 'Untitled Assessment'}
                        </h3>
                        {getStatusBadge(job.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{job.photoCount} photos</span>
                        <span>•</span>
                        <span>Created {new Date(job.createdAt).toLocaleDateString()}</span>
                        {job.confidenceScore && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-medium">
                              {(job.confidenceScore * 100).toFixed(0)}% confidence
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}