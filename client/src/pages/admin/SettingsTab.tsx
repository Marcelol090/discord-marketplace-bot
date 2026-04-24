import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function SettingsTab() {
  const [settings, setSettings] = useState({
    guildId: "",
    shopChannelId: "",
    logsChannelId: "",
    adminRoleId: "",
    sellerRoleId: "",
    pixKey: "",
    stripePublishableKey: "",
    stripeSecretKey: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement settings save via tRPC
      console.log("Save settings:", settings);
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-muted-foreground">
          Configure os canais, roles e métodos de pagamento do bot
        </p>
      </div>

      <div className="grid gap-6">
        {/* Discord Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuração do Discord</CardTitle>
            <CardDescription>
              Configure os IDs de servidor, canais e roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="guildId">ID do Servidor (Guild ID)</Label>
              <Input
                id="guildId"
                name="guildId"
                value={settings.guildId}
                onChange={handleChange}
                placeholder="Copie o ID do seu servidor Discord"
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Este ID é definido automaticamente
              </p>
            </div>

            <div>
              <Label htmlFor="shopChannelId">ID do Canal da Loja</Label>
              <Input
                id="shopChannelId"
                name="shopChannelId"
                value={settings.shopChannelId}
                onChange={handleChange}
                placeholder="ID do canal onde a vitrine será exibida"
              />
            </div>

            <div>
              <Label htmlFor="logsChannelId">ID do Canal de Logs</Label>
              <Input
                id="logsChannelId"
                name="logsChannelId"
                value={settings.logsChannelId}
                onChange={handleChange}
                placeholder="ID do canal para logs de vendas"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adminRoleId">ID da Role Admin</Label>
                <Input
                  id="adminRoleId"
                  name="adminRoleId"
                  value={settings.adminRoleId}
                  onChange={handleChange}
                  placeholder="ID da role de administrador"
                />
              </div>

              <div>
                <Label htmlFor="sellerRoleId">ID da Role Vendedor</Label>
                <Input
                  id="sellerRoleId"
                  name="sellerRoleId"
                  value={settings.sellerRoleId}
                  onChange={handleChange}
                  placeholder="ID da role de vendedor"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuração de Pagamentos</CardTitle>
            <CardDescription>
              Configure as chaves de pagamento para PIX e Cartão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Textarea
                id="pixKey"
                name="pixKey"
                value={settings.pixKey}
                onChange={handleChange}
                placeholder="Cole sua chave PIX aqui"
                rows={2}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pode ser email, CPF, CNPJ ou chave aleatória
              </p>
            </div>

            <div>
              <Label htmlFor="stripePublishableKey">Stripe Publishable Key</Label>
              <Textarea
                id="stripePublishableKey"
                name="stripePublishableKey"
                value={settings.stripePublishableKey}
                onChange={handleChange}
                placeholder="Cole sua Stripe Publishable Key"
                rows={2}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Encontre em https://dashboard.stripe.com/apikeys
              </p>
            </div>

            <div>
              <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
              <Input
                id="stripeSecretKey"
                name="stripeSecretKey"
                type="password"
                value={settings.stripeSecretKey}
                onChange={(e) => handleChange(e as any)}
                placeholder="Cole sua Stripe Secret Key"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mantenha esta chave em segredo
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </div>
  );
}
