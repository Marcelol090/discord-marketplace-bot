import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Package, ShoppingCart, TrendingUp, RefreshCw, CheckCircle, Clock, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: string;
  pendingOrders: number;
  deliveredOrders: number;
  totalProducts: number;
  activeProducts: number;
  digitalProducts: number;
  totalUsers: number;
  digitalDeliveryStats: {
    pending: number;
    failed: number;
  };
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch dashboard metrics
  const getDashboardMetrics = trpc.admin.getDashboardMetrics.useQuery();
  const getSalesAnalytics = trpc.admin.getSalesAnalytics.useQuery({ days: 30 });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      getDashboardMetrics.refetch();
      getSalesAnalytics.refetch();
    }, 30000);

    setRefreshInterval(interval);

    return () => clearInterval(interval);
  }, [getDashboardMetrics, getSalesAnalytics]);

  useEffect(() => {
    if (getDashboardMetrics.data) {
      setMetrics(getDashboardMetrics.data);
      setIsLoading(false);
    }
  }, [getDashboardMetrics.data]);

  const handleManualRefresh = () => {
    setIsLoading(true);
    getDashboardMetrics.refetch();
    getSalesAnalytics.refetch();
  };

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin">
          <RefreshCw className="h-8 w-8 text-primary" />
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Erro ao Carregar Métricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar os dados do dashboard. Tente novamente.
          </p>
          <Button onClick={handleManualRefresh} className="mt-4">
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Admin</h1>
          <p className="text-muted-foreground mt-2">
            Visão geral em tempo real do marketplace
          </p>
        </div>
        <Button
          onClick={handleManualRefresh}
          disabled={getDashboardMetrics.isLoading}
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Pedidos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.deliveredOrders} entregues
            </p>
          </CardContent>
        </Card>

        {/* Receita Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {metrics.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.pendingOrders} pedidos pendentes
            </p>
          </CardContent>
        </Card>

        {/* Produtos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeProducts} ativos, {metrics.digitalProducts} digitais
            </p>
          </CardContent>
        </Card>

        {/* Entrega Digital */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrega Digital</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.digitalDeliveryStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.digitalDeliveryStats.failed} falhadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="delivery">Entrega</TabsTrigger>
        </TabsList>

        {/* Gráfico de Vendas */}
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Vendas nos Últimos 30 Dias</CardTitle>
              <CardDescription>
                Receita e número de pedidos por dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getSalesAnalytics.data ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getSalesAnalytics.data.byDate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      name="Receita (R$)"
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      name="Pedidos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Carregando dados...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Produtos Mais Vendidos */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Produtos</CardTitle>
              <CardDescription>
                Produtos mais vendidos nos últimos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getSalesAnalytics.data && getSalesAnalytics.data.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {getSalesAnalytics.data.topProducts.map((product, index) => (
                    <div key={product.productId} className="flex items-center justify-between pb-4 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-lg">
                          #{index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.quantity} unidades vendidas
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">R$ {product.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status de Entrega */}
        <TabsContent value="delivery">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.digitalDeliveryStats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando entrega
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Falhadas</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.digitalDeliveryStats.failed}</div>
                <p className="text-xs text-muted-foreground">
                  Requer ação manual
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {metrics.totalOrders > 0
                    ? (
                      ((metrics.totalOrders - metrics.digitalDeliveryStats.failed) /
                        metrics.totalOrders) *
                      100
                    ).toFixed(1)
                    : "0"}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  Entregas bem-sucedidas
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total de Usuários:</span>
            <span className="font-medium">{metrics.totalUsers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Produtos Ativos:</span>
            <span className="font-medium">{metrics.activeProducts}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Produtos Digitais:</span>
            <span className="font-medium">{metrics.digitalProducts}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxa de Conversão:</span>
            <span className="font-medium">
              {metrics.totalOrders > 0
                ? ((metrics.deliveredOrders / metrics.totalOrders) * 100).toFixed(1)
                : "0"}
              %
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
