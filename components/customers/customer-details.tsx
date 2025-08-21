"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Phone, Mail, MapPin, ShoppingCart, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

interface CustomerDetailsProps {
  customer: {
    id: string
    name: string
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zip_code?: string
    notes?: string
    created_at: string
    sales: Array<{
      id: string
      total_amount: number
      profit_amount: number
      created_at: string
      sale_items: Array<{
        quantity: number
        unit_price: number
        products: {
          name: string
          sku: string
        }
      }>
    }>
  }
  onUpdate: () => void
}

export function CustomerDetails({ customer, onUpdate }: CustomerDetailsProps) {
  const totalPurchases = customer.sales?.length || 0
  const totalSpent = customer.sales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0
  const totalProfit = customer.sales?.reduce((sum, sale) => sum + sale.profit_amount, 0) || 0
  const averageTicket = totalPurchases > 0 ? totalSpent / totalPurchases : 0

  const lastPurchase = customer.sales?.[0]
  const firstPurchase = customer.sales?.[customer.sales.length - 1]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Clientes
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/dashboard/customers/${customer.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Cliente
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                {customer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{customer.name}</CardTitle>
            <Badge variant="outline">Cliente desde {new Date(customer.created_at).toLocaleDateString("pt-BR")}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.email && (
              <div className="flex items-center text-sm">
                <Mail className="mr-3 h-4 w-4 text-gray-400" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center text-sm">
                <Phone className="mr-3 h-4 w-4 text-gray-400" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start text-sm">
                <MapPin className="mr-3 h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <div>{customer.address}</div>
                  {customer.city && (
                    <div className="text-gray-600">
                      {customer.city}
                      {customer.state && `, ${customer.state}`}
                      {customer.zip_code && ` - ${customer.zip_code}`}
                    </div>
                  )}
                </div>
              </div>
            )}
            {customer.notes && (
              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm text-gray-900 mb-2">Observações</h4>
                <p className="text-sm text-gray-600">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{totalPurchases}</div>
                <div className="text-xs text-gray-600">Compras</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">R$ {totalSpent.toFixed(2)}</div>
                <div className="text-xs text-gray-600">Total Gasto</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mx-auto mb-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">R$ {averageTicket.toFixed(2)}</div>
                <div className="text-xs text-gray-600">Ticket Médio</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full mx-auto mb-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">R$ {totalProfit.toFixed(2)}</div>
                <div className="text-xs text-gray-600">Lucro Gerado</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="purchases" className="space-y-4">
            <TabsList>
              <TabsTrigger value="purchases">Histórico de Compras</TabsTrigger>
              <TabsTrigger value="products">Produtos Comprados</TabsTrigger>
            </TabsList>

            <TabsContent value="purchases" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Compras</CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.sales && customer.sales.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Itens</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Lucro</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customer.sales.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell>{new Date(sale.created_at).toLocaleDateString("pt-BR")}</TableCell>
                            <TableCell>{sale.sale_items.reduce((sum, item) => sum + item.quantity, 0)} itens</TableCell>
                            <TableCell>R$ {sale.total_amount.toFixed(2)}</TableCell>
                            <TableCell className="text-green-600">R$ {sale.profit_amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/sales/${sale.id}`}>Ver Detalhes</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma compra realizada</h3>
                      <p className="text-gray-600">Este cliente ainda não realizou nenhuma compra.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Mais Comprados</CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.sales && customer.sales.length > 0 ? (
                    <div className="space-y-4">
                      {(() => {
                        const productStats = customer.sales
                          .flatMap((sale) => sale.sale_items)
                          .reduce(
                            (acc, item) => {
                              const key = item.products.sku
                              if (!acc[key]) {
                                acc[key] = {
                                  name: item.products.name,
                                  sku: item.products.sku,
                                  quantity: 0,
                                  total: 0,
                                }
                              }
                              acc[key].quantity += item.quantity
                              acc[key].total += item.quantity * item.unit_price
                              return acc
                            },
                            {} as Record<string, any>,
                          )

                        return Object.values(productStats)
                          .sort((a: any, b: any) => b.quantity - a.quantity)
                          .slice(0, 10)
                          .map((product: any) => (
                            <div key={product.sku} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h4 className="font-medium">{product.name}</h4>
                                <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{product.quantity} unidades</div>
                                <div className="text-sm text-gray-600">R$ {product.total.toFixed(2)}</div>
                              </div>
                            </div>
                          ))
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto comprado</h3>
                      <p className="text-gray-600">Este cliente ainda não comprou nenhum produto.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
