"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, RotateCcw, Search, Filter, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Movement {
  id: string
  movement_type: "in" | "out" | "adjustment"
  quantity: number
  reason: string | null
  reference_id: string | null
  created_at: string
  products: {
    id: string
    name: string
    sku: string | null
  } | null
}

interface MovementsHistoryProps {
  movements: Movement[]
}

export function MovementsHistory({ movements: initialMovements }: MovementsHistoryProps) {
  const [movements] = useState(initialMovements)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  const filteredMovements = movements.filter((movement) => {
    const matchesSearch =
      !searchTerm ||
      movement.products?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.products?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || movement.movement_type === filterType

    const matchesDate = (() => {
      if (dateFilter === "all") return true
      const movementDate = new Date(movement.created_at)
      const now = new Date()

      switch (dateFilter) {
        case "today":
          return movementDate.toDateString() === now.toDateString()
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return movementDate >= weekAgo
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return movementDate >= monthAgo
        default:
          return true
      }
    })()

    return matchesSearch && matchesType && matchesDate
  })

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <ArrowUp className="h-4 w-4 text-green-600" />
      case "out":
        return <ArrowDown className="h-4 w-4 text-red-600" />
      case "adjustment":
        return <RotateCcw className="h-4 w-4 text-blue-600" />
      default:
        return <RotateCcw className="h-4 w-4 text-gray-600" />
    }
  }

  const getMovementColor = (type: string) => {
    switch (type) {
      case "in":
        return "default"
      case "out":
        return "secondary"
      case "adjustment":
        return "outline"
      default:
        return "outline"
    }
  }

  const getMovementLabel = (type: string) => {
    switch (type) {
      case "in":
        return "Entrada"
      case "out":
        return "Saída"
      case "adjustment":
        return "Ajuste"
      default:
        return "Movimento"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/inventory">
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
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por produto, SKU ou motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de movimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="in">Entradas</SelectItem>
                <SelectItem value="out">Saídas</SelectItem>
                <SelectItem value="adjustment">Ajustes</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o período</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Movements List */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações ({filteredMovements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMovements.length === 0 ? (
            <div className="text-center py-8">
              <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma movimentação encontrada</h3>
              <p className="text-gray-600">Tente ajustar os filtros de busca</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMovements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getMovementIcon(movement.movement_type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{movement.products?.name || "Produto removido"}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant={getMovementColor(movement.movement_type) as any}>
                          {getMovementLabel(movement.movement_type)}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {movement.movement_type === "out" ? "-" : "+"}
                          {movement.quantity} unidades
                        </span>
                        {movement.products?.sku && (
                          <Badge variant="outline" className="text-xs">
                            {movement.products.sku}
                          </Badge>
                        )}
                      </div>
                      {movement.reason && <p className="text-sm text-gray-500 mt-1">{movement.reason}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatDate(movement.created_at)}</p>
                    {movement.reference_id && (
                      <p className="text-xs text-gray-500">Ref: {movement.reference_id.slice(0, 8)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
