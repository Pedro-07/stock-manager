import { POSScanner } from "@/components/scanner/pos-scanner"

export default function ScannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Scanner POS</h1>
        <p className="text-gray-600">Sistema de vendas rápido com scanner</p>
      </div>

      <POSScanner />
    </div>
  )
}
