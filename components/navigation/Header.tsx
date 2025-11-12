'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X, Search } from 'lucide-react'
import MegaMenu from './MegaMenu'
import MobileMenu from './MobileMenu'
import Button from '@/components/ui/Button'

const navigationItems = [
  {
    label: 'Platform',
    href: '/platform',
    megaMenu: {
      columns: [
        {
          title: 'Features',
          links: [
            { label: 'Threat Intelligence', href: '/platform/threat-intelligence' },
            { label: 'Vulnerability Management', href: '/platform/vulnerability-management' },
            { label: 'Executive Reporting', href: '/platform/reporting' },
          ],
        },
        {
          title: 'Capabilities',
          links: [
            { label: 'OT-Specific Analysis', href: '/platform/ot-analysis' },
            { label: 'Regulatory Compliance', href: '/platform/compliance' },
            { label: 'Incident Response', href: '/platform/incident-response' },
          ],
        },
      ],
    },
  },
  {
    label: 'Intelligence',
    href: '/intelligence',
    megaMenu: {
      columns: [
        {
          title: 'Intelligence Types',
          links: [
            { label: 'Threat Reports', href: '/intelligence/reports' },
            { label: 'Advisory Alerts', href: '/intelligence/alerts' },
            { label: 'Industry Analysis', href: '/intelligence/analysis' },
          ],
        },
      ],
    },
  },
  {
    label: 'Resources',
    href: '/resources',
  },
  {
    label: 'Company',
    href: '/about',
    megaMenu: {
      columns: [
        {
          title: 'About',
          links: [
            { label: 'Our Story', href: '/about' },
            { label: 'Leadership', href: '/about/leadership' },
            { label: 'Careers', href: '/careers' },
          ],
        },
      ],
    },
  },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      
      // Calculate scroll progress
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const maxScroll = documentHeight - windowHeight
      const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0
      setScrollProgress(Math.min(progress, 100))
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white shadow-lg'
            : 'bg-white/95 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/Assets/Logo Files/svg/Color logo - no background.svg"
                alt="Sudo CTI Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navigationItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.megaMenu && setActiveMegaMenu(item.label)}
                  onMouseLeave={() => setActiveMegaMenu(null)}
                >
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-primary font-medium text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                  {item.megaMenu && activeMegaMenu === item.label && (
                    <MegaMenu columns={item.megaMenu.columns} />
                  )}
                </div>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <button
                aria-label="Search"
                className="p-2 text-gray-700 hover:text-primary transition-colors"
              >
                <Search size={20} />
              </button>
              <Button variant="primary" size="md">
                Schedule Briefing
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Scroll Progress Indicator */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-secondary to-secondary-light transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        items={navigationItems}
      />
    </>
  )
}

