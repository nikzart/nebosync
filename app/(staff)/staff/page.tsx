'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">CHECK BOX</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-full bg-[#1a1a1a] border-[#2a2a2a] text-white hover:bg-[#2a2a2a]">
            Date: <span className="font-bold ml-1">Now</span>
          </Button>
          <Button variant="outline" className="rounded-full bg-[#1a1a1a] border-[#2a2a2a] text-white hover:bg-[#2a2a2a]">
            Product: <span className="font-bold ml-1">All</span>
          </Button>
          <Button variant="outline" className="rounded-full bg-[#1a1a1a] border-[#2a2a2a] text-white hover:bg-[#2a2a2a]">
            Profile: <span className="font-bold ml-1">Bogdan</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Customer Stats */}
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white text-sm font-medium">CUSTOMER</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-[#2a2a2a]">
                <DropdownMenuItem className="text-white">View Details</DropdownMenuItem>
                <DropdownMenuItem className="text-white">Export Data</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#a3ff57]" />
                  <span className="text-3xl font-bold text-white">2,4%</span>
                </div>
                <p className="text-sm text-gray-400">Web Surfing</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-[#ff8844]" />
                  <span className="text-3xl font-bold text-white">1,1%</span>
                </div>
                <p className="text-sm text-gray-400">Radio Station</p>
              </div>
            </div>
            {/* Mini chart placeholder */}
            <div className="h-24 bg-[#0a0a0a] rounded-xl p-4">
              <svg className="w-full h-full" viewBox="0 0 200 60">
                <path
                  d="M 0 30 Q 50 20 100 35 T 200 25"
                  stroke="#a3ff57"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M 0 35 Q 50 30 100 40 T 200 35"
                  stroke="#ff8844"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Product Stats */}
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white text-sm font-medium">PRODUCT</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-[#2a2a2a]">
                <DropdownMenuItem className="text-white">View Details</DropdownMenuItem>
                <DropdownMenuItem className="text-white">Export Data</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#a3ff57]" />
                  <span className="text-3xl font-bold text-white">2,8%</span>
                </div>
                <p className="text-sm text-gray-400">Patience</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-[#ff8844]" />
                  <span className="text-3xl font-bold text-white">3,2%</span>
                </div>
                <p className="text-sm text-gray-400">Owners</p>
              </div>
            </div>
            {/* Dot matrix visualization */}
            <div className="h-24 bg-[#0a0a0a] rounded-xl p-4">
              <div className="grid grid-cols-12 gap-1 h-full">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      backgroundColor: Math.random() > 0.3
                        ? ['#a3ff57', '#ff8844', '#ffffff'][Math.floor(Math.random() * 3)]
                        : 'transparent',
                      width: '4px',
                      height: '4px',
                    }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Timeline */}
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white text-sm font-medium">PROJECTS TIMELINE</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-[#2a2a2a]">
                <DropdownMenuItem className="text-white">View All</DropdownMenuItem>
                <DropdownMenuItem className="text-white">Add Project</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: '30.09', color: '#a3ff57', count: 10 },
                { date: '29.09', color: '#ff8844', count: 25 },
                { date: '28.09', color: '#ededed', count: 15 },
                { date: '27.09', color: '#a3ff57', count: 21 },
                { date: '26.09', color: '#ededed', count: 10 },
                { date: '25.09', color: '#ff8844', count: 15 },
                { date: '24.09', color: '#ededed', count: 8 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-12">{item.date}</span>
                  <div className="flex-1 h-8 rounded-full" style={{ backgroundColor: item.color }}>
                    <div className="flex items-center justify-between px-4 h-full">
                      <div className="flex items-center gap-2">
                        {item.count > 15 && (
                          <>
                            <div className="w-6 h-6 rounded-full bg-black/20" />
                            <div className="w-6 h-6 rounded-full bg-black/20 -ml-3" />
                            <div className="w-6 h-6 rounded-full bg-black/20 -ml-3" />
                          </>
                        )}
                      </div>
                      <span className="text-xs font-medium text-black/70">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Large Product Card */}
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-sm font-medium">PRODUCT</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-[#2a2a2a]">
              <DropdownMenuItem className="text-white">View Details</DropdownMenuItem>
              <DropdownMenuItem className="text-white">Export Data</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-64">
            {Array.from({ length: 12 }).map((_, i) => {
              const height = Math.random() * 100 + 20
              const colors = ['#a3ff57', '#ff8844', '#ededed']
              const color = colors[Math.floor(Math.random() * colors.length)]
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 rounded-full relative group cursor-pointer transition-all hover:scale-105"
                    style={{ height: `${height}%`, backgroundColor: color }}
                  >
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {i + 1}
                    </span>
                  </div>
                  {/* Connection dots */}
                  {i % 2 === 0 && (
                    <div className="flex gap-1">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div
                          key={j}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-6 px-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ededed]" />
                <span className="text-sm text-gray-400">Resources</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#a3ff57]" />
                <span className="text-sm text-gray-400">Valid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff8844]" />
                <span className="text-sm text-gray-400">Invalid</span>
              </div>
            </div>
            <span className="text-sm text-gray-400">Total: <span className="text-white font-medium">1,012</span></span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
