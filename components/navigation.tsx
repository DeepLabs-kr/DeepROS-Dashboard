"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Network, Activity, GitBranch, MessageSquare, Home, Settings } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Domains", href: "/domains", icon: Network },
  { name: "Nodes", href: "/nodes", icon: Activity },
  { name: "Connections", href: "/connections", icon: GitBranch },
  { name: "Graph", href: "/graph", icon: Settings },
  { name: "Messages", href: "/messages", icon: MessageSquare },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Network className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">DeepROS</span>
          </Link>

          <div className="flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
