import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/navigation/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sudo CTI - Cyber Threat Intelligence for Critical Infrastructure',
  description: 'Purpose-built cyber threat intelligence platform for utilities and critical infrastructure. Trusted by Fortune 500 utilities across North America.',
  keywords: ['cyber threat intelligence', 'critical infrastructure', 'utilities', 'OT security', 'ICS security'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}

