"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Search, Filter, CreditCard, Banknote, Smartphone } from "lucide-react"
import Link from "next/link"

interface Sale {
  id: string
  total_amount: number
  payment_method: string
  status: string
  created_at: string
  customers: { name: string } | null
  sale_items: Array<{
    quantity: number
    unit_price: number
    products: { name: string } | null
  }>
}

interface SalesListProps {
  sales: Sale[]
}

export function SalesList({ sales: initialSales }: SalesListProps) {
  const [sales] = useState(initialSales)
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      !searchTerm ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.sale_items.some((item) => item.products?.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesPayment = paymentFilter === "all" || sale.payment_method === paymentFilter
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter

    return matchesSearch && matchesPayment && matchesStatus
  })

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <Banknote className="h-4 w-4" />
      case "card":
        return <CreditCard className="h-4 w-4" />
      case "pix":
        return <Smartphone className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "Dinheiro"
      case "card":
        return "Cartão"
      case "pix":
        return "PIX"
      default:
        return method
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluída"
      case "pending":
        return "Pendente"
      case "cancelled":
        return "Cancelada"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0)
  const totalItems = filteredSales.reduce((sum, sale) => sum + sale.sale_items.length, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSales.length}</div>
            <p className="text-xs text-muted-foreground">vendas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">em vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Itens Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">produtos vendidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por ID, cliente ou produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as formas</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="card">Cartão</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sales List */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas ({filteredSales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma venda encontrada</h3>
              <p className="text-gray-600">Tente ajustar os filtros ou registre uma nova venda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">#{sale.id.slice(0, 8)}</h4>
                      <Badge variant={getStatusColor(sale.status) as any}>{getStatusLabel(sale.status)}</Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        {getPaymentIcon(sale.payment_method)}
                        {getPaymentLabel(sale.payment_method)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Cliente:</span>
                        <p className="font-medium">{sale.customers?.name || "Cliente avulso"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <p className="font-medium text-green-600">R$ {sale.total_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Data:</span>
                        <p className="font-medium">{formatDate(sale.created_at)}</p>
                      </div>
                    </div>

                    <div className="mt-2">
                      <span className="text-gray-500 text-sm">Itens: </span>
                      <span className="text-sm">
                        {sale.sale_items
                          .map((item) => `${item.quantity}x ${item.products?.name || "Produto removido"}`)
                          .join(", ")}
                      </span>
                    </div>
                  </div>

                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/sales/${sale.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
