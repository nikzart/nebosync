'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ServiceCardProps {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
}

export function ServiceCard({ id, name, description, price, imageUrl, category }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-[2rem] overflow-hidden hover:shadow-xl transition-all duration-300"
      style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}
    >
      <div className="relative h-48">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#c4b5fd] to-[#e0d7ff]"
          style={{
            ...(imageUrl && {
              backgroundImage: `linear-gradient(to bottom, rgba(196, 181, 253, 0.1), rgba(224, 215, 255, 0.3)), url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }),
          }}
        />
        <div className="absolute top-4 left-4">
          <span className="px-4 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-xs font-semibold text-gray-800 shadow-sm">
            {category}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h4 className="text-xl font-bold text-gray-900 mb-2">{name}</h4>
        <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">{description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-bold text-gray-900">
              ₹{price.toLocaleString('en-IN')}
            </span>
          </div>
          <Button
            size="sm"
            className="rounded-full bg-lime-accent hover:bg-lime-accent/80 text-black h-14 w-14 p-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
