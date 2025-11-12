'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Twitter, Linkedin, Mail } from 'lucide-react'

const footerLinks = {
  platform: [
    { label: 'Threat Intelligence', href: '/platform/threat-intelligence' },
    { label: 'Vulnerability Management', href: '/platform/vulnerability-management' },
    { label: 'Executive Reporting', href: '/platform/reporting' },
    { label: 'OT-Specific Analysis', href: '/platform/ot-analysis' },
  ],
  intelligence: [
    { label: 'Threat Reports', href: '/intelligence/reports' },
    { label: 'Advisory Alerts', href: '/intelligence/alerts' },
    { label: 'Industry Analysis', href: '/intelligence/analysis' },
  ],
  resources: [
    { label: 'Blog', href: '/resources/blog' },
    { label: 'Whitepapers', href: '/resources/whitepapers' },
    { label: 'Case Studies', href: '/resources/case-studies' },
    { label: 'Webinars', href: '/resources/webinars' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Leadership', href: '/about/leadership' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
}

const socialLinks = [
  {
    icon: Twitter,
    href: '#',
    label: 'Twitter',
  },
  {
    icon: Linkedin,
    href: 'https://www.linkedin.com/in/koby-noguchi/',
    label: 'LinkedIn',
  },
  {
    icon: Mail,
    href: 'mailto:koby.noguchi@sudocti.com',
    label: 'Email',
  },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/Assets/Logo Files/svg/White logo - no background.svg"
                alt="Sudo CTI Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Purpose-built cyber threat intelligence platform for utilities and critical
              infrastructure. Trusted by Fortune 500 utilities across North America.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Intelligence Links */}
          <div>
            <h3 className="font-semibold mb-4">Intelligence</h3>
            <ul className="space-y-3">
              {footerLinks.intelligence.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Company */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 mb-8">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            © {currentYear} Sudo CTI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white/60 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/60 hover:text-white text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

