'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useState } from 'react'

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
}

export default function MobileMenu({ isOpen, onClose, items }: MobileMenuProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

