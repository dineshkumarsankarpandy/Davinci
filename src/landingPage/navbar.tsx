import { useState } from "react"




export default function Navbar() {
  const [isProductOpen, setIsProductOpen] = useState(false)
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)

  return (
    <nav className="w-full bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-16">
          {/* <Image src="/logo.svg" alt="Logo" width={32} height={32} className="w-8 h-8" /> */}
          
          <div className="flex items-center gap-1">
            <button 
              className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-1"
              onClick={() => setIsProductOpen(!isProductOpen)}
            >
              Product
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button 
              className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-1"
              onClick={() => setIsResourcesOpen(!isResourcesOpen)}
            >
              Resources
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
              Pricing
            </button>

            <button className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
              Showcase
            </button>

            <button className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
              Contact
            </button>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button 
            className="text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
            onClick={() => window.location.href = '/login'}
          >
            Log in
          </button>
          <button 
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-md hover:bg-gray-800 transition-colors cursor-pointer"
            onClick={() => window.location.href = '/dashboard'}
          >
            Start building
          </button>
        </div>
      </div>
    </nav>
  )
} 