'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface Column {
  title: string
  links: Array<{ label: string; href: string }>
}

interface MegaMenuProps {
  columns: Column[]
}

export default function MegaMenu({ columns }: MegaMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-0 mt-2 w-screen max-w-4xl bg-white shadow-xl border-t border-gray-200"
      onMouseLeave={() => {}}
    >
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-3 gap-8">
          {columns.map((column, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-semibold text-primary mb-4">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-700 hover:text-secondary text-sm transition-colors block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

