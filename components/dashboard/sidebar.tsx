"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Package, BarChart3, Users, Settings, Home, ShoppingCart, Camera, Archive } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Produtos", href: "/dashboard/products", icon: Package },
  { name: "Estoque", href: "/dashboard/inventory", icon: Archive },
  { name: "Vendas", href: "/dashboard/sales", icon: ShoppingCart },
  { name: "Scanner", href: "/dashboard/scanner", icon: Camera },
  { name: "Clientes", href: "/dashboard/customers", icon: Users },
  { name: "Relatórios", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Configurações", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-sm">
        <div className="flex h-16 shrink-0 items-center">
          <Package className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">StockManager</span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Button
                      asChild
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        pathname === item.href || pathname.startsWith(item.href + "/")
                          ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          : "text-gray-700 hover:bg-gray-50",
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
