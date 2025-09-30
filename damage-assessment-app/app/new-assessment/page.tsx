'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewAssessmentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form data
  const [propertyData, setPropertyData] = useState({
    propertyAddress: '',
    propertyZip: '',
    propertyType: 'SINGLE_FAMILY_RESIDENTIAL' as const,
    companyName: '',
  })

  const [files, setFiles] = useState<File[]>([])

  const handlePropertySubmit = async () => {
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      // Create job
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(propertyData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create assessment')
      }

      const data = await res.json()

      // Store job ID and move to next step
      localStorage.setItem('currentJobId', data.job.id)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assessment')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleFilesSubmit = async () => {
    setError('')

    if (files.length === 0) {
      setError('Please select at least one photo')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const jobId = localStorage.getItem('currentJobId')

      if (!token || !jobId) {
        router.push('/login')
        return
      }

      // In a real implementation, you would:
      // 1. Get presigned S3 URLs
      // 2. Upload files to S3
      // 3. Create photo records in database
      // 4. Start AI processing

      // For MVP demo, we'll simulate this
      console.log(`Uploading ${files.length} files for job ${jobId}`)

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Navigate to assessment page
      router.push(`/assessments/${jobId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-gray-700 font-medium">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <span className={`font-medium ${step >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                  Property Info
                </span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-4">
                <div className={`h-full transition-all ${step >= 2 ? 'bg-blue-600 w-full' : 'bg-blue-600 w-0'}`}></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
                <span className={`font-medium ${step >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                  Upload Photos
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Property Information */}
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Property Information</h1>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Address
                  </label>
                  <input
                    type="text"
                    value={propertyData.propertyAddress}
                    onChange={(e) =>
                      setPropertyData((prev) => ({ ...prev, propertyAddress: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main St, Houston, TX 77001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={propertyData.propertyZip}
                    onChange={(e) =>
                      setPropertyData((prev) => ({ ...prev, propertyZip: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="77001"
                    maxLength={5}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    value={propertyData.propertyType}
                    onChange={(e) =>
                      setPropertyData((prev) => ({
                        ...prev,
                        propertyType: e.target.value as any,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="SINGLE_FAMILY_RESIDENTIAL">Single Family Residential</option>
                    <option value="MULTI_FAMILY_RESIDENTIAL">Multi-Family Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="INDUSTRIAL">Industrial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={propertyData.companyName}
                    onChange={(e) =>
                      setPropertyData((prev) => ({ ...prev, companyName: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ABC Adjusters"
                  />
                </div>
              </div>

              <button
                onClick={handlePropertySubmit}
                disabled={loading || !propertyData.propertyAddress || !propertyData.propertyZip}
                className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Continue to Upload Photos →'}
              </button>
            </div>
          )}

          {/* Step 2: Upload Photos */}
          {step === 2 && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Damage Photos</h1>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-lg text-gray-700 mb-2">
                  Drag and drop photos here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Accepted: JPG, PNG, HEIC (max 50MB each)
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold cursor-pointer"
                >
                  Select Photos
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    {files.length} photo(s) selected
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleFilesSubmit}
                disabled={loading || files.length === 0}
                className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Uploading...' : `Upload ${files.length} Photo(s) & Start Analysis →`}
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full mt-4 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-semibold"
              >
                ← Back to Property Info
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}