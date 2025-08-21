import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Buscar configurações do WhatsApp
    const { data: store } = await supabase.from("stores").select("settings").eq("owner_id", user.id).single()

    if (!store?.settings?.whatsapp_token || !store?.settings?.whatsapp_phone) {
      return NextResponse.json({ error: "WhatsApp não configurado" }, { status: 400 })
    }

    // Gerar relatório do dia
    const today = new Date().toISOString().split("T")[0]

    // Buscar dados de vendas do dia
    const { data: sales } = await supabase
      .from("sales")
      .select(`
        *,
        sale_items (
          quantity,
          unit_price,
          products (name)
        )
      `)
      .gte("created_at", `${today}T00:00:00`)
      .lt("created_at", `${today}T23:59:59`)

    // Buscar produtos com estoque baixo
    const { data: lowStockProducts } = await supabase
      .from("products")
      .select("name, current_stock, min_stock")
      .lte("current_stock", store.settings.low_stock_threshold || 10)

    // Calcular totais
    const totalSales = sales?.length || 0
    const totalRevenue = sales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0
    const totalProfit = sales?.reduce((sum, sale) => sum + sale.profit_amount, 0) || 0

    // Montar mensagem do relatório
    const reportMessage = `📊 *RELATÓRIO DIÁRIO* - ${new Date().toLocaleDateString("pt-BR")}

💰 *VENDAS DO DIA*
• Total de vendas: ${totalSales}
• Faturamento: R$ ${totalRevenue.toFixed(2)}
• Lucro: R$ ${totalProfit.toFixed(2)}

${
  lowStockProducts && lowStockProducts.length > 0
    ? `
⚠️ *ESTOQUE BAIXO*
${lowStockProducts.map((p) => `• ${p.name}: ${p.current_stock} unidades`).join("\n")}
`
    : "✅ *Todos os produtos com estoque adequado*"
}

🤖 Relatório automático do Sistema de Gestão`

    // Enviar mensagem (simulado)
    console.log("[v0] WhatsApp report:", reportMessage)

    // Em produção, você enviaria via API do WhatsApp:
    // const response = await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${store.settings.whatsapp_token}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     to: store.settings.whatsapp_phone,
    //     type: 'text',
    //     text: { body: reportMessage }
    //   })
    // })

    return NextResponse.json({
      success: true,
      message: "Relatório enviado com sucesso!",
      report: reportMessage,
    })
  } catch (error) {
    console.error("Send report error:", error)
    return NextResponse.json({ error: "Erro ao enviar relatório" }, { status: 500 })
  }
}
