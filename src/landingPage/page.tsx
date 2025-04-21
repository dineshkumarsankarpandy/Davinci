import Navbar from './navbar'
import Hero from './hero'
import Showcase from './showcase'
import CTA from './cta'
import Footer from './footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-50 font-inter">
      <Navbar />
      <Hero />
      <Showcase />
      <CTA />
      <Footer />
    </main>
  )
} 