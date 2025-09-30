import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">DA</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">DamageAssessment AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Get Started Free
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Transform Damage Photos Into
            <span className="text-blue-600"> Professional Reports</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered property damage assessment in under 5 minutes.
            Get accurate cost estimates, detailed scopes, and insurance-grade reports.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg"
            >
              Start 14-Day Free Trial
            </Link>
            <Link
              href="#how-it-works"
              className="bg-white text-gray-900 px-8 py-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 font-semibold text-lg"
            >
              See How It Works
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>

        {/* Features */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600">
              Upload photos, get professional reports in under 5 minutes. 70% faster than manual processes.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Accuracy</h3>
            <p className="text-gray-600">
              4 expert AI agents analyze every photo: damage assessment, quality check, compliance, and costing.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Professional Reports</h3>
            <p className="text-gray-600">
              Insurance-grade PDFs with damage inventory, scope of work, cost breakdowns, and your branding.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="mt-32">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Photos</h3>
                <p className="text-gray-600 text-lg">
                  Drag and drop damage photos or upload a PDF report. We accept individual images or batch uploads.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-gray-600 text-lg">
                  Our 4 expert AI agents analyze every photo: Claude identifies damage, Derek validates quality, Alex checks compliance, Marcus calculates costs.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Your Report</h3>
                <p className="text-gray-600 text-lg">
                  Download a professional PDF with damage inventory, detailed scope of work, cost estimates by room and trade, and your company branding.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-32 bg-blue-600 rounded-2xl p-16 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of adjusters and contractors saving hours on every assessment.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 font-semibold text-lg"
          >
            Start Free Trial →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-20 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>&copy; 2025 DamageAssessment AI. All rights reserved.</p>
          <p className="mt-2">
            Built with Claude Code • Powered by Anthropic AI
          </p>
        </div>
      </footer>
    </div>
  )
}