'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, User, Home, FileText, Shield, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface NavItem {
  label: string
  href: string
  megaMenu?: {
    columns: Array<{
      title: string
      links: Array<{ label: string; href: string }>
    }>
  }
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  items: NavItem[]
  onLoginClick?: () => void
}

export default function MobileMenu({ isOpen, onClose, items, onLoginClick }: MobileMenuProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const { user, signOut, loading } = useAuth()

  const handleSignOut = async () => {
    onClose()
    await signOut()
  }

  const profileMenuItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'My Reports', href: '/my-reports', icon: FileText },
    { label: 'My Vulnerabilities', href: '/my-vulnerabilities', icon: Shield },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-xl z-50 lg:hidden overflow-y-auto"
          >
            <div className="p-6">
              {/* Close Button */}
              <div className="flex justify-end mb-8">
                <button
                  onClick={onClose}
                  className="p-2 text-gray-700 hover:text-primary"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="space-y-4">
                {items.map((item) => (
                  <div key={item.label}>
                    {item.megaMenu ? (
                      <div>
                        <button
                          onClick={() =>
                            setExpandedItem(expandedItem === item.label ? null : item.label)
                          }
                          className="w-full flex items-center justify-between py-3 text-left text-gray-700 hover:text-primary font-medium transition-colors"
                        >
                          <Link href={item.href} onClick={onClose}>
                            {item.label}
                          </Link>
                          <span className="text-gray-400">
                            {expandedItem === item.label ? '−' : '+'}
                          </span>
                        </button>
                        {expandedItem === item.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-4 mt-2 space-y-3"
                          >
                            {item.megaMenu.columns.map((column, idx) => (
                              <div key={idx} className="mb-4">
                                <h4 className="text-sm font-semibold text-primary mb-2">
                                  {column.title}
                                </h4>
                                <ul className="space-y-2">
                                  {column.links.map((link) => (
                                    <li key={link.href}>
                                      <Link
                                        href={link.href}
                                        onClick={onClose}
                                        className="text-sm text-gray-600 hover:text-secondary"
                                      >
                                        {link.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="block py-3 text-gray-700 hover:text-primary font-medium transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {/* CTA Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="block w-full py-3 px-6 text-center border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-all"
                >
                  Schedule Briefing
                </Link>
                
                {loading ? (
                  <div className="w-full py-3 px-6 bg-gray-200 animate-pulse rounded-full" />
                ) : user ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    
                    {/* Profile Menu Items */}
                    <div className="space-y-1">
                      {profileMenuItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className="flex items-center gap-3 py-2.5 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Icon size={18} className="text-gray-400" />
                            <span className="text-sm font-medium">{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                    
                    {/* Sign Out */}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center justify-center gap-2 w-full py-3 px-6 text-red-600 border border-red-200 font-semibold rounded-full hover:bg-red-50 transition-all"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onLoginClick}
                    className="block w-full py-3 px-6 text-center bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
