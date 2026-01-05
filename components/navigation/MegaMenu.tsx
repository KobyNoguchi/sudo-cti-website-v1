'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface MenuLink {
  label: string
  href: string
  requiresAuth?: boolean
}

interface Column {
  title: string
  links: MenuLink[]
}

interface MegaMenuProps {
  columns: Column[]
}

export default function MegaMenu({ columns }: MegaMenuProps) {
  const { user } = useAuth()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-0 pt-4 w-screen max-w-4xl"
    >
      {/* Invisible bridge to maintain hover */}
      <div className="absolute top-0 left-0 right-0 h-4" />
      <div className="bg-white shadow-xl border-t border-gray-200 rounded-b-lg">
        <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-3 gap-8">
          {columns.map((column, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-semibold text-primary mb-4">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => {
                  const isLocked = link.requiresAuth && !user
                  
                  if (isLocked) {
                    return (
                      <li key={link.href}>
                        <span
                          className="text-gray-400 text-sm flex items-center gap-2 cursor-not-allowed"
                          title="Login required"
                        >
                          <Lock size={14} className="text-gray-300" />
                          {link.label}
                        </span>
                      </li>
                    )
                  }
                  
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray-700 hover:text-secondary text-sm transition-colors block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
      </div>
    </motion.div>
  )
}
