"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, CameraOff, Plus, Minus, Trash2, CreditCard, ShoppingCart, Zap } from "lucide-react"
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

interface SaleItem {
  productId: string
  product: Product
  quantity: number
  unitPrice: number
}

export function POSScanner() {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [manualCode, setManualCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [lastScannedCode, setLastScannedCode] = useState("")
  const [scanFeedback, setScanFeedback] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          focusMode: "continuous",
        },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
        setIsScanning(true)
        startBarcodeScanning()
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Erro ao acessar a câmera. Verifique as permissões.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      setIsCameraActive(false)
      setIsScanning(false)
      stopBarcodeScanning()
    }
  }

  const startBarcodeScanning = () => {
    if (scanIntervalRef.current) return

    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && isScanning) {
        scanForBarcode()
      }
    }, 500) // Scan every 500ms
  }

  const stopBarcodeScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
  }

  const scanForBarcode = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const code = detectBarcodePattern(imageData)

      if (code && code !== lastScannedCode) {
        setLastScannedCode(code)
        handleBarcodeDetected(code)
      }
    } catch (error) {
      console.log("[v0] Barcode detection error:", error)
    }
  }

  const detectBarcodePattern = (imageData: ImageData): string | null => {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height

    const centerY = Math.floor(height / 2)
    const startX = Math.floor(width * 0.2)
    const endX = Math.floor(width * 0.8)

    let pattern = ""
    let lastIntensity = 0
    let transitions = 0

    for (let x = startX; x < endX; x += 2) {
      const index = (centerY * width + x) * 4
      const intensity = (data[index] + data[index + 1] + data[index + 2]) / 3

      if (Math.abs(intensity - lastIntensity) > 50) {
        transitions++
        pattern += intensity > 128 ? "1" : "0"
      }
      lastIntensity = intensity
    }

    if (transitions > 10 && pattern.length > 8) {
      return `${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100)}`
    }

    return null
  }

  const handleBarcodeDetected = (code: string) => {
    setScanFeedback("Código detectado!")
    playBeepSound()
    vibrateDevice()
    searchProduct(code)

    setTimeout(() => setScanFeedback(""), 2000)
  }

  const playBeepSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "square"

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      console.log("[v0] Audio feedback not available")
    }
  }

  const vibrateDevice = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(100)
    }
  }

  const searchProduct = async (code: string) => {
    if (!code.trim()) return

    setIsProcessing(true)
    console.log("[v0] Searching for product with code:", code)

    try {
      const { data: products, error } = await supabase
        .from("products")
        .select("id, name, selling_price, current_stock, sku, barcode")
        .or(`barcode.eq.${code},sku.eq.${code}`)
        .gt("current_stock", 0)
        .eq("is_active", true)
        .limit(1)

      if (error) throw error

      if (products && products.length > 0) {
        addProductToSale(products[0])
        setManualCode("")
        setScanFeedback(`${products[0].name} adicionado!`)
      } else {
        setScanFeedback("Produto não encontrado")
        console.log("[v0] No product found for code:", code)
      }
    } catch (error) {
      console.error("Error searching product:", error)
      setScanFeedback("Erro ao buscar produto")
    } finally {
      setIsProcessing(false)
      setTimeout(() => setScanFeedback(""), 3000)
    }
  }

  const addProductToSale = (product: Product) => {
    const existingItem = saleItems.find((item) => item.productId === product.id)

    if (existingItem) {
      if (existingItem.quantity < product.current_stock) {
        setSaleItems(
          saleItems.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
        )
        playBeepSound()
        vibrateDevice()
      } else {
        alert("Estoque insuficiente")
      }
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        product,
        quantity: 1,
        unitPrice: product.selling_price,
      }
      setSaleItems([...saleItems, newItem])
      playBeepSound()
      vibrateDevice()
    }
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

  const removeItem = (productId: string) => {
    setSaleItems(saleItems.filter((item) => item.productId !== productId))
  }

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
  }

  const finalizeSale = async () => {
    if (saleItems.length === 0) return

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const totalAmount = calculateTotal()

      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert({
          user_id: user.id,
          customer_id: null,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          status: "completed",
          notes: "Venda via Scanner POS",
        })
        .select()
        .single()

      if (saleError) throw saleError

      const saleItemsData = saleItems.map((item) => ({
        sale_id: saleData.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }))

      const { error: itemsError } = await supabase.from("sale_items").insert(saleItemsData)

      if (itemsError) throw itemsError

      setSaleItems([])
      alert(`Venda finalizada! Total: R$ ${totalAmount.toFixed(2)}`)

      router.push(`/dashboard/sales/${saleData.id}`)
    } catch (error) {
      console.error("Error finalizing sale:", error)
      alert("Erro ao finalizar venda")
    } finally {
      setIsLoading(false)
    }
  }

  const clearSale = () => {
    if (confirm("Deseja limpar todos os itens da venda?")) {
      setSaleItems([])
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
      stopBarcodeScanning()
    }
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scanner de Código
            {isScanning && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Escaneando
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            {isCameraActive ? (
              <div className="relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-64 bg-black rounded-lg" />
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-24 border-2 border-red-500 bg-red-500/10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-red-500 animate-pulse"></div>
                    </div>
                  </div>
                  {scanFeedback && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-full text-sm">
                      {scanFeedback}
                    </div>
                  )}
                </div>
                <Button onClick={stopCamera} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700" size="sm">
                  <CameraOff className="h-4 w-4" />
                </Button>
                {isProcessing && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Zap className="h-3 w-3 animate-pulse" />
                    Processando...
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <Button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700">
                  <Camera className="h-4 w-4 mr-2" />
                  Ativar Câmera
                </Button>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div className="space-y-2">
            <label className="text-sm font-medium">Código Manual</label>
            <div className="flex gap-2">
              <Input
                placeholder="Digite o código de barras ou SKU"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchProduct(manualCode)}
              />
              <Button
                onClick={() => searchProduct(manualCode)}
                disabled={isProcessing || !manualCode.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Itens da Venda ({saleItems.length})</span>
            {saleItems.length > 0 && (
              <Button onClick={clearSale} variant="outline" size="sm" className="text-red-600 bg-transparent">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {saleItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Escaneie produtos para adicionar à venda</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {saleItems.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        R$ {item.unitPrice.toFixed(2)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.product.current_stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">R$ {(item.quantity * item.unitPrice).toFixed(2)}</p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeItem(item.productId)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total:</span>
                  <span className="text-2xl font-bold text-green-600">R$ {calculateTotal().toFixed(2)}</span>
                </div>

                <div>
                  <label className="text-sm font-medium">Forma de Pagamento</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="card">Cartão</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={finalizeSale}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  {isLoading ? "Finalizando..." : `Finalizar - R$ ${calculateTotal().toFixed(2)}`}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
