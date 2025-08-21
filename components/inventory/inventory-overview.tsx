import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, AlertTriangle, TrendingDown, Eye } from "lucide-react"
import Link from "next/link"

interface LowStockProduct {
  id: string
  name: string
  current_stock: number
  min_stock: number
  selling_price: number
}

interface InventoryOverviewProps {
  totalProducts: number
  outOfStockProducts: number
  lowStockProducts: LowStockProduct[]
}

export function InventoryOverview({ totalProducts, outOfStockProducts, lowStockProducts }: InventoryOverviewProps) {
  const lowStockValue = lowStockProducts.reduce(
    (sum, product) => sum + product.current_stock * product.selling_price,
    0,
  )

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
        </CardContent>
      </Card>

      {/* Out of Stock */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
          <p className="text-xs text-muted-foreground">Produtos zerados</p>
        </CardContent>
      </Card>

      {/* Low Stock */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
          <TrendingDown className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
          <p className="text-xs text-muted-foreground">Produtos em falta</p>
        </CardContent>
      </Card>

      {/* Low Stock Value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor em Risco</CardTitle>
          <TrendingDown className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {lowStockValue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Valor dos produtos em falta</p>
        </CardContent>
      </Card>

      {/* Low Stock Products List */}
      {lowStockProducts.length > 0 && (
        <Card className="sm:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg text-orange-800">Produtos com Estoque Baixo</CardTitle>
            <CardDescription>Estes produtos precisam de reposição urgente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="outline" className="text-orange-700 border-orange-300">
                        {product.current_stock} / {product.min_stock} unidades
                      </Badge>
                      <span className="text-sm text-gray-600">R$ {product.selling_price.toFixed(2)} cada</span>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/products/${product.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Link>
                  </Button>
                </div>
              ))}
              {lowStockProducts.length > 5 && (
                <div className="text-center pt-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/products?filter=low-stock">
                      Ver todos os {lowStockProducts.length} produtos
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
