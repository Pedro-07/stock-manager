"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, CreditCard, Banknote, Smartphone } from "lucide-react"
import Link from "next/link"

interface SaleDetailsProps {
  sale: {
    id: string
    total_amount: number
    payment_method: string
    status: string
    notes: string | null
    created_at: string
    customers: { id: string; name: string; phone: string | null } | null
    sale_items: Array<{
      id: string
      quantity: number
      unit_price: number
      total_price: number
      products: { id: string; name: string; sku: string | null } | null
    }>
  }
}

export function SaleDetails({ sale }: SaleDetailsProps) {
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

  const handlePrintReceipt = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo - Venda #${sale.id.slice(0, 8)}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { border-top: 2px solid #000; padding-top: 10px; margin-top: 20px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>StockManager</h2>
            <p>Venda #${sale.id.slice(0, 8)}</p>
            <p>${formatDate(sale.created_at)}</p>
          </div>
          
          ${sale.customers ? `<p><strong>Cliente:</strong> ${sale.customers.name}</p>` : ""}
          
          <div class="items">
            ${sale.sale_items
              .map(
                (item) => `
              <div class="item">
                <span>${item.quantity}x ${item.products?.name || "Produto removido"}</span>
                <span>R$ ${item.total_price.toFixed(2)}</span>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <div class="total">
            <div class="item">
              <span>TOTAL:</span>
              <span>R$ ${sale.total_amount.toFixed(2)}</span>
            </div>
            <div class="item">
              <span>Pagamento:</span>
              <span>${getPaymentLabel(sale.payment_method)}</span>
            </div>
          </div>
          
          ${sale.notes ? `<p><strong>Obs:</strong> ${sale.notes}</p>` : ""}
          
          <div class="footer">
            <p>Obrigado pela preferência!</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(receiptHTML)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/sales">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <Button onClick={handlePrintReceipt} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Imprimir Recibo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sale Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações da Venda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">ID da Venda:</span>
                <p className="font-medium">#{sale.id.slice(0, 8)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Data:</span>
                <p className="font-medium">{formatDate(sale.created_at)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status:</span>
                <Badge variant={getStatusColor(sale.status) as any}>{getStatusLabel(sale.status)}</Badge>
              </div>
              <div>
                <span className="text-sm text-gray-500">Pagamento:</span>
                <div className="flex items-center gap-2">
                  {getPaymentIcon(sale.payment_method)}
                  <span className="font-medium">{getPaymentLabel(sale.payment_method)}</span>
                </div>
              </div>
            </div>

            {sale.customers && (
              <div>
                <span className="text-sm text-gray-500">Cliente:</span>
                <div className="mt-1">
                  <p className="font-medium">{sale.customers.name}</p>
                  {sale.customers.phone && <p className="text-sm text-gray-600">{sale.customers.phone}</p>}
                </div>
              </div>
            )}

            {sale.notes && (
              <div>
                <span className="text-sm text-gray-500">Observações:</span>
                <p className="mt-1">{sale.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sale Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total da Venda</p>
              <p className="text-3xl font-bold text-green-600">R$ {sale.total_amount.toFixed(2)}</p>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Itens:</span>
                <span className="font-medium">{sale.sale_items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Quantidade Total:</span>
                <span className="font-medium">{sale.sale_items.reduce((sum, item) => sum + item.quantity, 0)} un.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sale Items */}
      <Card>
        <CardHeader>
          <CardTitle>Itens da Venda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sale.sale_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.products?.name || "Produto removido"}</h4>
                  {item.products?.sku && (
                    <Badge variant="outline" className="mt-1">
                      {item.products.sku}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 text-right">
                  <div>
                    <span className="text-sm text-gray-500">Qtd:</span>
                    <p className="font-medium">{item.quantity}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Preço Unit:</span>
                    <p className="font-medium">R$ {item.unit_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Total:</span>
                    <p className="font-medium text-green-600">R$ {item.total_price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-medium">Total da Venda:</span>
              <span className="text-2xl font-bold text-green-600">R$ {sale.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
