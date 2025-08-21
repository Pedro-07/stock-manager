"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MoreHorizontal, Eye, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  created_at: string
  sales: Array<{
    id: string
    total_amount: number
    created_at: string
  }>
}

interface CustomersListProps {
  customers: Customer[]
  loading: boolean
  onRefresh: () => void
}

export function CustomersList({ customers, loading, onRefresh }: CustomersListProps) {
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!deleteCustomer) return

    try {
      const { error } = await supabase.from("customers").delete().eq("id", deleteCustomer.id)

      if (error) throw error

      toast({
        title: "Cliente removido",
        description: "Cliente foi removido com sucesso.",
      })
      onRefresh()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover cliente.",
        variant: "destructive",
      })
    } finally {
      setDeleteCustomer(null)
    }
  }

  const getCustomerStats = (customer: Customer) => {
    const totalPurchases = customer.sales?.length || 0
    const totalSpent = customer.sales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0
    const lastPurchase = customer.sales?.[0]?.created_at
      ? new Date(customer.sales[0].created_at).toLocaleDateString("pt-BR")
      : "Nunca"

    return { totalPurchases, totalSpent, lastPurchase }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Phone className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum cliente encontrado</h3>
          <p className="text-gray-600 mb-4">Comece adicionando seu primeiro cliente ao sistema.</p>
          <Button asChild>
            <Link href="/dashboard/customers/new">Adicionar Cliente</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => {
          const { totalPurchases, totalSpent, lastPurchase } = getCustomerStats(customer)

          return (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      <p className="text-sm text-gray-600">
                        Cliente desde {new Date(customer.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/customers/${customer.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/customers/${customer.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => setDeleteCustomer(customer)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 mb-4">
                  {customer.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="mr-2 h-4 w-4" />
                      {customer.email}
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="mr-2 h-4 w-4" />
                      {customer.phone}
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="mr-2 h-4 w-4" />
                      {customer.city ? `${customer.address}, ${customer.city}` : customer.address}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalPurchases}</div>
                    <div className="text-xs text-gray-600">Compras</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">R$ {totalSpent.toFixed(2)}</div>
                    <div className="text-xs text-gray-600">Total Gasto</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    Última compra: {lastPurchase}
                  </Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/customers/${customer.id}`}>Ver Detalhes</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={!!deleteCustomer} onOpenChange={() => setDeleteCustomer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o cliente "{deleteCustomer?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
