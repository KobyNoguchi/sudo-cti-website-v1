import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export default function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white/90 supports-[backdrop-filter]:backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/40 shadow-md hover:shadow-lg transition-shadow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

