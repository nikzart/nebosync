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
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative h-48">
        <div
          className="absolute inset-0 bg-gradient-to-br from-pastel-purple to-pastel-lavender"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            {category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h4 className="text-lg font-semibold text-gray-900 mb-1">{name}</h4>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            ₹{price.toLocaleString('en-IN')}
          </span>
          <Button
            size="sm"
            className="rounded-full bg-lime-accent hover:bg-lime-accent/90 text-black h-12 w-12 p-0"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
