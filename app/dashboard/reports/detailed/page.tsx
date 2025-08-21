import { DetailedReports } from "@/components/reports/detailed-reports"

export default function DetailedReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios Detalhados</h1>
        <p className="text-gray-600">Análises aprofundadas com filtros personalizados</p>
      </div>

      <DetailedReports />
    </div>
  )
}
