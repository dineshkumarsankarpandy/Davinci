

const showcaseItems = [
  {
    id: 1,
    title: 'Bubblegum BI',
    description: 'Business intelligence for multifamily asset managers',
    image: '/showcase1.svg',
  },
  {
    id: 2,
    title: 'Teras Media Co.',
    description: 'Web design and development agency in Michigan',
    image: '/showcase2.svg',
  },
  {
    id: 3,
    title: 'PARennial Golf',
    description: 'State-of-the-art Chicago indoor golf facilities',
    image: '/showcase3.svg',
  },
]



export default function Showcase() {
  return (
    <section className="w-full py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-display-md font-bold text-gray-900 mb-4">
            Made with Chariot
          </h2>
          <p className="text-heading text-gray-600">
            See what other businesses are building with Chariot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {showcaseItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="relative h-64">
                {/* <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                /> */}
                <div className="absolute inset-0 bg-black bg-opacity-60" />
                <button className="absolute top-6 right-6 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  View Project
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {item.description}
                </p>
                <button className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 10.8333H10V15.8333H8.33333V10.8333H3.33333V9.16667H8.33333V4.16667H10V9.16667H15V10.8333Z" fill="currentColor"/>
                  </svg>
                  Visit Website
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 