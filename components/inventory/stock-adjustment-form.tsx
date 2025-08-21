"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Save, ArrowLeft, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  current_stock: number
  sku: string | null
  barcode: string | null
}

interface StockAdjustment {
  productId: string
  product: Product
  adjustmentType: "in" | "out" | "set"
  quantity: number
  reason: string
}

export function StockAdjustmentForm() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.length < 2) {
        setProducts([])
        return
      }

      setIsSearching(true)
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, current_stock, sku, barcode")
          .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%`)
          .limit(10)

        if (error) throw error
        setProducts(data || [])
      } catch (error) {
        console.error("Error searching products:", error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, supabase])

  const addProductToAdjustment = (product: Product) => {
    if (adjustments.find((adj) => adj.productId === product.id)) {
      return // Product already added
    }

    const newAdjustment: StockAdjustment = {
      productId: product.id,
      product,
      adjustmentType: "in",
      quantity: 0,
      reason: "",
    }

    setAdjustments([...adjustments, newAdjustment])
    setSearchTerm("")
    setProducts([])
  }

  const updateAdjustment = (productId: string, field: keyof StockAdjustment, value: any) => {
    setAdjustments(adjustments.map((adj) => (adj.productId === productId ? { ...adj, [field]: value } : adj)))
  }

  const removeAdjustment = (productId: string) => {
    setAdjustments(adjustments.filter((adj) => adj.productId !== productId))
  }

  const calculateNewStock = (adjustment: StockAdjustment) => {
    const currentStock = adjustment.product.current_stock
    switch (adjustment.adjustmentType) {
      case "in":
        return currentStock + adjustment.quantity
      case "out":
        return Math.max(0, currentStock - adjustment.quantity)
      case "set":
        return adjustment.quantity
      default:
        return currentStock
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (adjustments.length === 0) return

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Process each adjustment
      for (const adjustment of adjustments) {
        const newStock = calculateNewStock(adjustment)

        // Update product stock
        const { error: updateError } = await supabase
          .from("products")
          .update({ current_stock: newStock })
          .eq("id", adjustment.productId)

        if (updateError) throw updateError

        // Create stock movement record
        const movementQuantity =
          adjustment.adjustmentType === "set"
            ? newStock - adjustment.product.current_stock
            : adjustment.adjustmentType === "out"
              ? -adjustment.quantity
              : adjustment.quantity

        const { error: movementError } = await supabase.from("stock_movements").insert({
          user_id: user.id,
          product_id: adjustment.productId,
          movement_type: "adjustment",
          quantity: Math.abs(movementQuantity),
          reason: adjustment.reason || `Ajuste manual - ${adjustment.adjustmentType}`,
        })

        if (movementError) throw movementError
      }

      router.push("/dashboard/inventory")
    } catch (error) {
      console.error("Error processing adjustments:", error)
      alert("Erro ao processar ajustes")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/inventory">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
      </div>

      {/* Product Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nome, SKU ou código de barras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isSearching && <p className="text-sm text-gray-600 mt-2">Buscando produtos...</p>}

          {products.length > 0 && (
            <div className="mt-4 space-y-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => addProductToAdjustment(product)}
                >
                  <div>
                    <h4 className="font-medium">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">Estoque: {product.current_stock}</Badge>
                      {product.sku && <Badge variant="outline">SKU: {product.sku}</Badge>}
                    </div>
                  </div>
                  <Button type="button" size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adjustments List */}
      {adjustments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ajustes de Estoque ({adjustments.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {adjustments.map((adjustment) => (
              <div key={adjustment.productId} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{adjustment.product.name}</h4>
                    <Badge variant="outline">Estoque Atual: {adjustment.product.current_stock}</Badge>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeAdjustment(adjustment.productId)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Tipo de Ajuste</Label>
                    <Select
                      value={adjustment.adjustmentType}
                      onValueChange={(value: "in" | "out" | "set") =>
                        updateAdjustment(adjustment.productId, "adjustmentType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">Entrada (+)</SelectItem>
                        <SelectItem value="out">Saída (-)</SelectItem>
                        <SelectItem value="set">Definir Quantidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{adjustment.adjustmentType === "set" ? "Nova Quantidade" : "Quantidade"}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={adjustment.quantity}
                      onChange={(e) => updateAdjustment(adjustment.productId, "quantity", Number(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label>Novo Estoque</Label>
                    <div className="h-10 flex items-center px-3 bg-gray-50 border rounded-md">
                      <span className="font-medium">{calculateNewStock(adjustment)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Motivo do Ajuste</Label>
                  <Textarea
                    value={adjustment.reason}
                    onChange={(e) => updateAdjustment(adjustment.productId, "reason", e.target.value)}
                    placeholder="Ex: Contagem física, produto danificado, etc."
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      {adjustments.length > 0 && (
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/inventory">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Processando..." : `Aplicar ${adjustments.length} Ajuste(s)`}
          </Button>
        </div>
      )}
    </form>
  )
}
