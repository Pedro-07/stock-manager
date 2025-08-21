"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Bell, Database, Download, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    whatsapp_token: "",
    whatsapp_phone: "",
    auto_reports: false,
    report_time: "09:00",
    low_stock_alert: true,
    low_stock_threshold: 10,
    currency: "BRL",
    tax_rate: 0,
    receipt_footer: "Obrigado pela preferência!",
    backup_enabled: true,
    backup_frequency: "daily",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.from("stores").select("settings").eq("owner_id", user.id).single()

      if (error) throw error
      if (data?.settings) {
        setSettings({ ...settings, ...data.settings })
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { error } = await supabase.from("stores").update({ settings }).eq("owner_id", user.id)

      if (error) throw error

      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testWhatsApp = async () => {
    if (!settings.whatsapp_token || !settings.whatsapp_phone) {
      toast({
        title: "Configuração incompleta",
        description: "Configure o token e telefone do WhatsApp primeiro.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: settings.whatsapp_token,
          phone: settings.whatsapp_phone,
        }),
      })

      if (response.ok) {
        toast({
          title: "Teste realizado",
          description: "Mensagem de teste enviada com sucesso!",
        })
      } else {
        throw new Error("Falha no teste")
      }
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Verifique suas configurações do WhatsApp.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações do seu sistema</p>
      </div>

      <Tabs defaultValue="whatsapp" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Integração WhatsApp
              </CardTitle>
              <CardDescription>Configure a integração com WhatsApp para envio automático de relatórios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_token">Token da API</Label>
                  <Input
                    id="whatsapp_token"
                    type="password"
                    placeholder="Seu token do WhatsApp Business API"
                    value={settings.whatsapp_token}
                    onChange={(e) => setSettings({ ...settings, whatsapp_token: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_phone">Número do WhatsApp</Label>
                  <Input
                    id="whatsapp_phone"
                    placeholder="+5511999999999"
                    value={settings.whatsapp_phone}
                    onChange={(e) => setSettings({ ...settings, whatsapp_phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>Relatórios Automáticos</Label>
                  <p className="text-sm text-gray-600">Enviar relatórios diários automaticamente</p>
                </div>
                <Switch
                  checked={settings.auto_reports}
                  onCheckedChange={(checked) => setSettings({ ...settings, auto_reports: checked })}
                />
              </div>

              {settings.auto_reports && (
                <div className="space-y-2">
                  <Label htmlFor="report_time">Horário do Relatório</Label>
                  <Input
                    id="report_time"
                    type="time"
                    value={settings.report_time}
                    onChange={(e) => setSettings({ ...settings, report_time: e.target.value })}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={testWhatsApp} variant="outline">
                  Testar Conexão
                </Button>
                <Button onClick={saveSettings} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Configurações de Alertas
              </CardTitle>
              <CardDescription>Configure quando e como receber alertas do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>Alerta de Estoque Baixo</Label>
                  <p className="text-sm text-gray-600">Receber alertas quando produtos estiverem com estoque baixo</p>
                </div>
                <Switch
                  checked={settings.low_stock_alert}
                  onCheckedChange={(checked) => setSettings({ ...settings, low_stock_alert: checked })}
                />
              </div>

              {settings.low_stock_alert && (
                <div className="space-y-2">
                  <Label htmlFor="low_stock_threshold">Limite de Estoque Baixo</Label>
                  <Input
                    id="low_stock_threshold"
                    type="number"
                    min="1"
                    value={settings.low_stock_threshold}
                    onChange={(e) => setSettings({ ...settings, low_stock_threshold: Number.parseInt(e.target.value) })}
                  />
                  <p className="text-sm text-gray-600">Alertar quando estoque for menor ou igual a este valor</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>Configure as preferências gerais do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => setSettings({ ...settings, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (R$)</SelectItem>
                      <SelectItem value="USD">Dólar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Taxa de Imposto (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={settings.tax_rate}
                    onChange={(e) => setSettings({ ...settings, tax_rate: Number.parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt_footer">Rodapé do Recibo</Label>
                <Textarea
                  id="receipt_footer"
                  placeholder="Mensagem que aparecerá no final dos recibos"
                  value={settings.receipt_footer}
                  onChange={(e) => setSettings({ ...settings, receipt_footer: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-600" />
                Backup e Exportação
              </CardTitle>
              <CardDescription>Configure backups automáticos e exporte seus dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>Backup Automático</Label>
                  <p className="text-sm text-gray-600">Fazer backup automático dos dados</p>
                </div>
                <Switch
                  checked={settings.backup_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, backup_enabled: checked })}
                />
              </div>

              {settings.backup_enabled && (
                <div className="space-y-2">
                  <Label htmlFor="backup_frequency">Frequência do Backup</Label>
                  <Select
                    value={settings.backup_frequency}
                    onValueChange={(value) => setSettings({ ...settings, backup_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Exportar Dados
                </Button>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Upload className="h-4 w-4" />
                  Importar Dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={loading} size="lg">
          {loading ? "Salvando..." : "Salvar Todas as Configurações"}
        </Button>
      </div>
    </div>
  )
}
