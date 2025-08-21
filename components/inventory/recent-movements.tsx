import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, RotateCcw, Eye } from "lucide-react"
import Link from "next/link"

interface Movement {
  id: string
  movement_type: "in" | "out" | "adjustment"
  quantity: number
  reason: string | null
  created_at: string
  products: {
    name: string
  } | null
}

interface RecentMovementsProps {
  movements: Movement[]
}

export function RecentMovements({ movements }: RecentMovementsProps) {
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Movimentações Recentes</CardTitle>
          <CardDescription>Últimas movimentações de estoque</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/inventory/movements">
            <Eye className="h-4 w-4 mr-2" />
            Ver Todas
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <div className="text-center py-8">
            <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma movimentação</h3>
            <p className="text-gray-600">As movimentações de estoque aparecerão aqui</p>
          </div>
        ) : (
          <div className="space-y-4">
            {movements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getMovementIcon(movement.movement_type)}
                  <div>
                    <h4 className="font-medium text-gray-900">{movement.products?.name || "Produto removido"}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getMovementColor(movement.movement_type) as any}>
                        {getMovementLabel(movement.movement_type)}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {movement.movement_type === "out" ? "-" : "+"}
                        {movement.quantity} unidades
                      </span>
                    </div>
                    {movement.reason && <p className="text-sm text-gray-500 mt-1">{movement.reason}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{formatDate(movement.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
