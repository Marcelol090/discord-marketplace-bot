import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, ShoppingCart, DollarSign, Package } from "lucide-react";
import ClickAnalyticsWidget from "./ClickAnalyticsWidget";

interface SalesData {
  date: string;
  sales: number;
  revenue: number;
}

interface TopProduct {
  id: number;
  name: string;
  quantity: number;
  revenue: number;
}

interface RecentOrder {
  id: number;
  userId: number;
  userName: string;
  totalAmount: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

export default function DashboardTab() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalProducts: 0,
  });

  // Simular dados de vendas (em produção, vir do backend)
  useEffect(() => {
    // Gerar dados de vendas dos últimos 7 dias
    const data: SalesData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
        sales: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 5000) + 1000,
      });
    }
    setSalesData(data);

    // Produtos mais vendidos
    setTopProducts([
      { id: 1, name: "Produto Premium", quantity: 45, revenue: 4500 },
      { id: 2, name: "Pacote Básico", quantity: 32, revenue: 1600 },
      { id: 3, name: "Serviço VIP", quantity: 28, revenue: 8400 },
      { id: 4, name: "Produto Standard", quantity: 15, revenue: 750 },
    ]);

    // Pedidos recentes
    setRecentOrders([
      {
        id: 1001,
        userId: 1,
        userName: "João Silva",
        totalAmount: 299.99,
        status: "paid",
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
      {
        id: 1002,
        userId: 2,
        userName: "Maria Santos",
        totalAmount: 149.99,
        status: "pending",
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: 1003,
        userId: 3,
        userName: "Pedro Costa",
        totalAmount: 599.99,
        status: "shipped",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: 1004,
        userId: 4,
        userName: "Ana Oliveira",
        totalAmount: 199.99,
        status: "delivered",
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
    ]);

    // Calcular estatísticas
    const totalRevenue = recentOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = recentOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setStats({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalProducts: topProducts.length,
    });
  }, []);

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      // Atualizar dados em tempo real
      console.log("Atualizando dados de vendas...");
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      paid: "default",
      shipped: "secondary",
      delivered: "default",
      cancelled: "destructive",
    };

    const labels: Record<string, string> = {
      pending: "Pendente",
      paid: "Pago",
      shipped: "Enviado",
      delivered: "Entregue",
      cancelled: "Cancelado",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Pedidos recentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">Por pedido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topProducts.length}</div>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Dia</CardTitle>
            <CardDescription>Últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" name="Vendas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Receita */}
        <Card>
          <CardHeader>
            <CardTitle>Receita por Dia</CardTitle>
            <CardDescription>Últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Receita (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Produtos Mais Vendidos */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Vendidos</CardTitle>
          <CardDescription>Top 4 produtos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.quantity} vendas</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(product.revenue)}</p>
                  <p className="text-sm text-muted-foreground">{product.quantity} unidades</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pedidos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
          <CardDescription>Últimos pedidos recebidos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium">Pedido #{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.userName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Carregando pedidos...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Análise de Cliques */}
      <div className="border-t pt-6">
        <h2 className="text-2xl font-bold mb-4">Análise de Engajamento</h2>
        <ClickAnalyticsWidget />
      </div>

      {/* Notificações de PIX Pendentes */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-900">Pagamentos PIX Pendentes</CardTitle>
          <CardDescription className="text-yellow-800">Aguardando confirmação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-yellow-900">
              ⏳ 2 pagamentos aguardando confirmação PIX
            </p>
            <p className="text-sm text-yellow-900">
              💰 Valor total: R$ 449,98
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
