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
import { Search, Plus, Minus, Save, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  selling_price: number
  current_stock: number
  sku: string | null
  barcode: string | null
}

interface Customer {
  id: string
  name: string
  phone: string | null
}

interface SaleItem {
  productId: string
  product: Product
  quantity: number
  unitPrice: number
}

export function SalesForm() {
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [customerSearch, setCustomerSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [notes, setNotes] = useState("")
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
          .select("id, name, selling_price, current_stock, sku, barcode")
          .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%`)
          .gt("current_stock", 0)
          .eq("is_active", true)
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

  // Search customers
  useEffect(() => {
    const searchCustomers = async () => {
      if (customerSearch.length < 2) {
        setCustomers([])
        return
      }

      try {
        const { data, error } = await supabase
          .from("customers")
          .select("id, name, phone")
          .or(`name.ilike.%${customerSearch}%,phone.ilike.%${customerSearch}%`)
          .limit(10)

        if (error) throw error
        setCustomers(data || [])
      } catch (error) {
        console.error("Error searching customers:", error)
      }
    }

    const debounceTimer = setTimeout(searchCustomers, 300)
    return () => clearTimeout(debounceTimer)
  }, [customerSearch, supabase])

  const addProductToSale = (product: Product) => {
    const existingItem = saleItems.find((item) => item.productId === product.id)

    if (existingItem) {
      if (existingItem.quantity < product.current_stock) {
        setSaleItems(
          saleItems.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
        )
      }
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        product,
        quantity: 1,
        unitPrice: product.selling_price,
      }
      setSaleItems([...saleItems, newItem])
    }

    setSearchTerm("")
    setProducts([])
  }

  const updateItemQuantity = (productId: string, quantity: number) => {
    const item = saleItems.find((item) => item.productId === productId)
    if (!item) return

    if (quantity <= 0) {
      setSaleItems(saleItems.filter((item) => item.productId !== productId))
    } else if (quantity <= item.product.current_stock) {
      setSaleItems(saleItems.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
    }
  }

  const updateItemPrice = (productId: string, unitPrice: number) => {
    setSaleItems(saleItems.map((item) => (item.productId === productId ? { ...item, unitPrice } : item)))
  }

  const removeItem = (productId: string) => {
    setSaleItems(saleItems.filter((item) => item.productId !== productId))
  }

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saleItems.length === 0) return

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const totalAmount = calculateTotal()

      // Create sale
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert({
          user_id: user.id,
          customer_id: selectedCustomer?.id || null,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          status: "completed",
          notes: notes || null,
        })
        .select()
        .single()

      if (saleError) throw saleError

      // Create sale items
      const saleItemsData = saleItems.map((item) => ({
        sale_id: saleData.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }))

      const { error: itemsError } = await supabase.from("sale_items").insert(saleItemsData)

      if (itemsError) throw itemsError

      router.push(`/dashboard/sales/${saleData.id}`)
    } catch (error) {
      console.error("Error creating sale:", error)
      alert("Erro ao criar venda")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/sales">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Search */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Produtos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nome, SKU ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {isSearching && <p className="text-sm text-gray-600">Buscando produtos...</p>}

            {products.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => addProductToSale(product)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">R$ {product.selling_price.toFixed(2)}</Badge>
                        <Badge variant="outline">Estoque: {product.current_stock}</Badge>
                        {product.sku && <Badge variant="outline">{product.sku}</Badge>}
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

        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Cliente (Opcional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{selectedCustomer.name}</h4>
                  {selectedCustomer.phone && <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>}
                </div>
                <Button type="button" size="sm" variant="outline" onClick={() => setSelectedCustomer(null)}>
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar cliente por nome ou telefone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {customers.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {customers.map((customer) => (
                      <div
                        key={customer.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setCustomerSearch("")
                          setCustomers([])
                        }}
                      >
                        <div>
                          <h4 className="font-medium">{customer.name}</h4>
                          {customer.phone && <p className="text-sm text-gray-600">{customer.phone}</p>}
                        </div>
                        <Button type="button" size="sm" variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sale Items */}
      {saleItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Itens da Venda ({saleItems.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {saleItems.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <Badge variant="outline">Disponível: {item.product.current_stock}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={item.product.current_stock}
                    value={item.quantity}
                    onChange={(e) => updateItemQuantity(item.productId, Number(e.target.value) || 1)}
                    className="w-20 text-center"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.product.current_stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="w-32">
                  <Label className="text-xs">Preço Unit.</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => updateItemPrice(item.productId, Number(e.target.value) || 0)}
                    className="text-right"
                  />
                </div>

                <div className="w-32 text-right">
                  <Label className="text-xs">Total</Label>
                  <p className="font-medium">R$ {(item.quantity * item.unitPrice).toFixed(2)}</p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => removeItem(item.productId)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-medium">Total da Venda:</span>
              <span className="text-2xl font-bold text-green-600">R$ {calculateTotal().toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment and Notes */}
      {saleItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Finalizar Venda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Forma de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre a venda..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/sales">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                disabled={isLoading || saleItems.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Finalizando..." : `Finalizar Venda - R$ ${calculateTotal().toFixed(2)}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  )
}
