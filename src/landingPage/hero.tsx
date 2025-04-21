



export default function Hero() {
  return (
    <section className="w-full py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-display-lg font-bold text-gray-900 mb-6">
          Create a website in minutes
        </h1>
        <p className="text-heading text-gray-600 mb-8">
          Chariot is the website builder for small businesses. Describe the website you want and Chariot will build it for you. No code required.
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 mb-12">
          <div className="flex items-start gap-4">
            <textarea
              className="flex-1 text-body text-gray-500 bg-transparent resize-none outline-none"
              placeholder="Create a website for my Italian restaurant"
              rows={1}
            />
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.8333 10.8333H10.8333V15.8333H9.16667V10.8333H4.16667V9.16667H9.16667V4.16667H10.8333V9.16667H15.8333V10.8333Z" fill="currentColor"/>
              </svg>
              Attach image
            </button>
            <button className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium shadow-md hover:bg-gray-800 transition-colors flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Build
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1.33333L10.06 5.50667L14.6667 6.18L11.3333 9.42667L12.12 14.0133L8 11.8467L3.88 14.0133L4.66667 9.42667L1.33333 6.18L5.94 5.50667L8 1.33333Z" fill="#FACC15"/>
                </svg>
              ))}
            </div>
            <p className="text-sm text-gray-500">Join 3,323+ small businesses using Chariot</p>
          </div>
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm text-gray-500">Publish in one click</p>
            <div className="w-px h-4 bg-gray-300 mx-2" />
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm text-gray-500">No credit card required</p>
          </div>
        </div>
      </div>
    </section>
  )
} 