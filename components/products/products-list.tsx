"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search, Package } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  description: string | null
  barcode: string | null
  sku: string | null
  category: string | null
  brand: string | null
  cost_price: number
  selling_price: number
  margin_percentage: number
  current_stock: number
  min_stock: number
  is_active: boolean
  image_url: string | null
}

interface ProductsListProps {
  products: Product[]
}

export function ProductsList({ products: initialProducts }: ProductsListProps) {
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products

    const term = searchTerm.toLowerCase()
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term) ||
        product.barcode?.includes(searchTerm) ||
        product.sku?.includes(searchTerm),
    )
  }, [products, searchTerm])

  const getStockStatus = useMemo(() => {
    return (current: number, min: number) => {
      if (current === 0) return { label: "Sem estoque", color: "destructive" }
      if (current <= min) return { label: "Estoque baixo", color: "secondary" }
      return { label: "Em estoque", color: "default" }
    }
  }, [])

  const handleDelete = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    setIsDeleting(productId)
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId)

      if (error) throw error

      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Erro ao excluir produto")
      router.refresh()
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar produtos por nome, categoria, marca, código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm ? "Tente ajustar os termos de busca" : "Comece adicionando seu primeiro produto"}
            </p>
            {!searchTerm && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/dashboard/products/new">Adicionar Produto</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.current_stock, product.min_stock)

            return (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                    <Badge variant={stockStatus.color as any} className="ml-2">
                      {stockStatus.label}
                    </Badge>
                  </div>
                  {product.description && <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Preço de Custo:</span>
                      <p className="font-medium">R$ {product.cost_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Preço de Venda:</span>
                      <p className="font-medium">R$ {product.selling_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Margem:</span>
                      <p className="font-medium">{product.margin_percentage.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Estoque:</span>
                      <p className="font-medium">{product.current_stock} un.</p>
                    </div>
                  </div>

                  {(product.category || product.brand) && (
                    <div className="flex gap-2 flex-wrap">
                      {product.category && (
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                      {product.brand && (
                        <Badge variant="outline" className="text-xs">
                          {product.brand}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Link href={`/dashboard/products/${product.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
                      disabled={isDeleting === product.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
