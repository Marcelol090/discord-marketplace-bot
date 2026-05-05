import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2, Send, Settings } from "lucide-react";

export default function ChannelsTab() {
  const [guildId, setGuildId] = useState("1114181955634876478");
  const [showcaseChannelId, setShowcaseChannelId] = useState("1491670368438583357");
  const [announcementChannelId, setAnnouncementChannelId] = useState("1491670371127136266");
  const [promotionChannelId, setPromotionChannelId] = useState("1491670374381916160");

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementDesc, setAnnouncementDesc] = useState("");
  const [announcementColor, setAnnouncementColor] = useState("3b82f6");

  const [promotionTitle, setPromotionTitle] = useState("");
  const [promotionDiscount, setPromotionDiscount] = useState("10");
  const [promotionEndDate, setPromotionEndDate] = useState("");

  const postShowcaseMutation = trpc.marketplace.channels.postProductShowcase.useMutation();
  const postAnnouncementMutation = trpc.marketplace.channels.postAnnouncement.useMutation();
  const postPromotionMutation = trpc.marketplace.channels.postPromotion.useMutation();

  const handlePostShowcase = async () => {
    try {
      await postShowcaseMutation.mutateAsync({
        guildId,
        showcaseChannelId,
      });
      toast.success("✅ Vitrine postada com sucesso!");
    } catch (error) {
      toast.error("❌ Erro ao postar vitrine");
      console.error(error);
    }
  };

  const handlePostAnnouncement = async () => {
    if (!announcementTitle || !announcementDesc) {
      toast.error("❌ Preencha título e descrição");
      return;
    }

    try {
      await postAnnouncementMutation.mutateAsync({
        guildId,
        announcementChannelId,
        title: announcementTitle,
        description: announcementDesc,
        color: parseInt(announcementColor, 16),
      });
      toast.success("✅ Anúncio postado com sucesso!");
      setAnnouncementTitle("");
      setAnnouncementDesc("");
    } catch (error) {
      toast.error("❌ Erro ao postar anúncio");
      console.error(error);
    }
  };

  const handlePostPromotion = async () => {
    if (!promotionTitle || !promotionEndDate) {
      toast.error("❌ Preencha título e data de término");
      return;
    }

    try {
      await postPromotionMutation.mutateAsync({
        guildId,
        promotionChannelId,
        title: promotionTitle,
        discount: parseInt(promotionDiscount),
        productIds: [1, 2, 3], // TODO: Permitir seleção de produtos
        endDate: promotionEndDate,
      });
      toast.success("✅ Promoção postada com sucesso!");
      setPromotionTitle("");
      setPromotionDiscount("10");
      setPromotionEndDate("");
    } catch (error) {
      toast.error("❌ Erro ao postar promoção");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuração de Canais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuração de Canais
          </CardTitle>
          <CardDescription>
            Configure os IDs dos canais do seu servidor Discord
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guild-id">ID do Servidor</Label>
              <Input
                id="guild-id"
                value={guildId}
                onChange={(e) => setGuildId(e.target.value)}
                placeholder="ID do servidor Discord"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="showcase-channel">Canal de Vitrine</Label>
              <Input
                id="showcase-channel"
                value={showcaseChannelId}
                onChange={(e) => setShowcaseChannelId(e.target.value)}
                placeholder="ID do canal de vitrine"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcement-channel">Canal de Divulgação</Label>
              <Input
                id="announcement-channel"
                value={announcementChannelId}
                onChange={(e) => setAnnouncementChannelId(e.target.value)}
                placeholder="ID do canal de divulgação"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promotion-channel">Canal de Promoção</Label>
              <Input
                id="promotion-channel"
                value={promotionChannelId}
                onChange={(e) => setPromotionChannelId(e.target.value)}
                placeholder="ID do canal de promoção"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Postagens */}
      <Tabs defaultValue="showcase" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="showcase">📦 Vitrine</TabsTrigger>
          <TabsTrigger value="announcement">📢 Anúncio</TabsTrigger>
          <TabsTrigger value="promotion">🎉 Promoção</TabsTrigger>
        </TabsList>

        {/* Vitrine */}
        <TabsContent value="showcase">
          <Card>
            <CardHeader>
              <CardTitle>Postar Vitrine de Produtos</CardTitle>
              <CardDescription>
                Envie todos os produtos disponíveis para o canal de vitrine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ℹ️ Isso irá postar todos os produtos ativos no canal de vitrine com embeds
                  formatados, imagens e preços.
                </p>
              </div>

              <Button
                onClick={handlePostShowcase}
                disabled={postShowcaseMutation.isPending}
                className="w-full"
                size="lg"
              >
                {postShowcaseMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Postando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Postar Vitrine Agora
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anúncio */}
        <TabsContent value="announcement">
          <Card>
            <CardHeader>
              <CardTitle>Postar Anúncio</CardTitle>
              <CardDescription>
                Envie um anúncio personalizado para o canal de divulgação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="announcement-title">Título</Label>
                <Input
                  id="announcement-title"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="Ex: Novos Produtos Chegando!"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="announcement-desc">Descrição</Label>
                <textarea
                  id="announcement-desc"
                  value={announcementDesc}
                  onChange={(e) => setAnnouncementDesc(e.target.value)}
                  placeholder="Descreva o anúncio aqui..."
                  className="w-full p-2 border rounded-md"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="announcement-color">Cor (Hex)</Label>
                <div className="flex gap-2">
                  <Input
                    id="announcement-color"
                    value={announcementColor}
                    onChange={(e) => setAnnouncementColor(e.target.value)}
                    placeholder="3b82f6"
                    maxLength={6}
                  />
                  <div
                    className="w-10 h-10 rounded border"
                    style={{ backgroundColor: `#${announcementColor}` }}
                  />
                </div>
              </div>

              <Button
                onClick={handlePostAnnouncement}
                disabled={postAnnouncementMutation.isPending}
                className="w-full"
                size="lg"
              >
                {postAnnouncementMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Postando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Postar Anúncio
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promoção */}
        <TabsContent value="promotion">
          <Card>
            <CardHeader>
              <CardTitle>Postar Promoção</CardTitle>
              <CardDescription>
                Crie uma promoção com desconto para produtos específicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="promotion-title">Título da Promoção</Label>
                <Input
                  id="promotion-title"
                  value={promotionTitle}
                  onChange={(e) => setPromotionTitle(e.target.value)}
                  placeholder="Ex: Black Friday - 50% OFF!"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="promotion-discount">Desconto (%)</Label>
                  <Input
                    id="promotion-discount"
                    type="number"
                    value={promotionDiscount}
                    onChange={(e) => setPromotionDiscount(e.target.value)}
                    min="1"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promotion-end-date">Data de Término</Label>
                  <Input
                    id="promotion-end-date"
                    type="datetime-local"
                    value={promotionEndDate}
                    onChange={(e) => setPromotionEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  ℹ️ A promoção será postada com os 3 primeiros produtos. Para selecionar
                  produtos específicos, use a página de Produtos.
                </p>
              </div>

              <Button
                onClick={handlePostPromotion}
                disabled={postPromotionMutation.isPending}
                className="w-full"
                size="lg"
              >
                {postPromotionMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Postando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Postar Promoção
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
