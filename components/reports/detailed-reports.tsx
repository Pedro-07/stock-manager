"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Filter, Calendar } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface ReportData {
  sales: any[]
  products: any[]
  customers: any[]
  stockMovements: any[]
}

export function DetailedReports() {
  const [reportType, setReportType] = useState("sales")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [reportData, setReportData] = useState<ReportData>({
    sales: [],
    products: [],
    customers: [],
    stockMovements: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Set default dates (last 30 days)
  useEffect(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    setDateTo(today.toISOString().split("T")[0])
    setDateFrom(thirtyDaysAgo.toISOString().split("T")[0])
  }, [])

  const generateReport = async () => {
    if (!dateFrom || !dateTo) return

    setIsLoading(true)
    try {
      const fromDate = new Date(dateFrom).toISOString()
      const toDate = new Date(dateTo + "T23:59:59").toISOString()

      const [salesData, productsData, customersData, stockData] = await Promise.all([
        // Sales report
        supabase
          .from("sales")
          .select(`
            id,
            total_amount,
            payment_method,
            status,
            created_at,
            customers (name),
            sale_items (
              quantity,
              unit_price,
              total_price,
              products (name, cost_price)
            )
          `)
          .gte("created_at", fromDate)
          .lte("created_at", toDate)
          .order("created_at", { ascending: false }),

        // Products performance
        supabase
          .from("sale_items")
          .select(`
            quantity,
            unit_price,
            total_price,
            products (id, name, cost_price, current_stock)
          `)
          .gte("created_at", fromDate)
          .lte("created_at", toDate),

        // Customer analysis
        supabase
          .from("customers")
          .select(`
            id,
            name,
            total_purchases,
            created_at,
            sales (total_amount, created_at)
          `)
          .gte("created_at", fromDate)
          .lte("created_at", toDate),

        // Stock movements
        supabase
          .from("stock_movements")
          .select(`
            id,
            movement_type,
            quantity,
            reason,
            created_at,
            products (name)
          `)
          .gte("created_at", fromDate)
          .lte("created_at", toDate)
          .order("created_at", { ascending: false }),
      ])

      setReportData({
        sales: salesData.data || [],
        products: productsData.data || [],
        customers: customersData.data || [],
        stockMovements: stockData.data || [],
      })
    } catch (error) {
      console.error("Error generating report:", error)
      alert("Erro ao gerar relatório")
    } finally {
      setIsLoading(false)
    }
  }

  const exportToPDF = () => {
    // Simple PDF export functionality
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const reportHTML = generateReportHTML()
    printWindow.document.write(reportHTML)
    printWindow.document.close()
    printWindow.print()
  }

  const generateReportHTML = () => {
    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

    const formatDate = (dateString: string) =>
      new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })

    let content = ""

    if (reportType === "sales") {
      const totalRevenue = reportData.sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
      const totalProfit = reportData.sales.reduce((sum, sale) => {
        const saleProfit = sale.sale_items.reduce((itemSum: number, item: any) => {
          const profit = (item.unit_price - (item.products?.cost_price || 0)) * item.quantity
          return itemSum + profit
        }, 0)
        return sum + saleProfit
      }, 0)

      content = `
        <h2>Relatório de Vendas</h2>
        <p><strong>Período:</strong> ${formatDate(dateFrom)} a ${formatDate(dateTo)}</p>
        <p><strong>Total de Vendas:</strong> ${reportData.sales.length}</p>
        <p><strong>Receita Total:</strong> ${formatCurrency(totalRevenue)}</p>
        <p><strong>Lucro Total:</strong> ${formatCurrency(totalProfit)}</p>
        
        <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Pagamento</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.sales
              .map(
                (sale) => `
              <tr>
                <td>${formatDate(sale.created_at)}</td>
                <td>${sale.customers?.name || "Cliente avulso"}</td>
                <td>${formatCurrency(sale.total_amount)}</td>
                <td>${sale.payment_method}</td>
                <td>${sale.status}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      `
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório - StockManager</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            h2 { color: #333; }
          </style>
        </head>
        <body>
          <h1>StockManager - Relatórios</h1>
          ${content}
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Relatório gerado em ${new Date().toLocaleString("pt-BR")}
          </p>
        </body>
      </html>
    `
  }

  const renderSalesReport = () => {
    const totalRevenue = reportData.sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
    const totalProfit = reportData.sales.reduce((sum, sale) => {
      const saleProfit = sale.sale_items.reduce((itemSum: number, item: any) => {
        const profit = (item.unit_price - (item.products?.cost_price || 0)) * item.quantity
        return itemSum + profit
      }, 0)
      return sum + saleProfit
    }, 0)

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{reportData.sales.length}</div>
              <p className="text-sm text-muted-foreground">Total de Vendas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalRevenue)}
              </div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalProfit)}
              </div>
              <p className="text-sm text-muted-foreground">Lucro Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Sales List */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas Detalhadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.sales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">#{sale.id.slice(0, 8)}</span>
                      <Badge variant="outline">{sale.status}</Badge>
                      <Badge variant="outline">{sale.payment_method}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Cliente: {sale.customers?.name || "Cliente avulso"}</p>
                    <p className="text-sm text-gray-600">Data: {new Date(sale.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(sale.total_amount)}
                    </p>
                    <p className="text-sm text-gray-600">{sale.sale_items.length} itens</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderProductsReport = () => {
    // Process products data
    const productStats = new Map()
    reportData.products.forEach((item) => {
      const productId = item.products?.id
      if (!productId) return

      const current = productStats.get(productId) || {
        name: item.products.name,
        totalQuantity: 0,
        totalRevenue: 0,
        totalProfit: 0,
        currentStock: item.products.current_stock,
      }

      const profit = (item.unit_price - (item.products.cost_price || 0)) * item.quantity

      productStats.set(productId, {
        ...current,
        totalQuantity: current.totalQuantity + item.quantity,
        totalRevenue: current.totalRevenue + item.total_price,
        totalProfit: current.totalProfit + profit,
      })
    })

    const productsList = Array.from(productStats.values()).sort((a, b) => b.totalRevenue - a.totalRevenue)

    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productsList.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{product.name}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <Badge variant="outline">{product.totalQuantity} vendidos</Badge>
                    <Badge variant="outline">Estoque: {product.currentStock}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      product.totalRevenue,
                    )}
                  </p>
                  <p className="text-sm text-blue-600">
                    Lucro:{" "}
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.totalProfit)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/reports">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Vendas</SelectItem>
                  <SelectItem value="products">Produtos</SelectItem>
                  <SelectItem value="inventory">Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data Inicial</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div>
              <Label>Data Final</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={generateReport} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                <Calendar className="h-4 w-4 mr-2" />
                {isLoading ? "Gerando..." : "Gerar Relatório"}
              </Button>
              <Button onClick={exportToPDF} variant="outline" disabled={reportData.sales.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {reportType === "sales" && reportData.sales.length > 0 && renderSalesReport()}
      {reportType === "products" && reportData.products.length > 0 && renderProductsReport()}
      {reportType === "inventory" && reportData.stockMovements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Movimentações de Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.stockMovements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{movement.products?.name || "Produto removido"}</h4>
                    <p className="text-sm text-gray-600">{movement.reason}</p>
                    <p className="text-sm text-gray-600">{new Date(movement.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={movement.movement_type === "in" ? "default" : "secondary"}>
                      {movement.movement_type === "in" ? "+" : "-"}
                      {movement.quantity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
