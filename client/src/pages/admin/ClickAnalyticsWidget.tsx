import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp, Users, MousePointerClick } from "lucide-react";

interface ClickAnalytics {
  buttonId: string;
  totalClicks: number;
  uniqueUsers: number;
  clicksByAction: Record<string, number>;
  lastClicked: string;
  conversionRate?: number;
}

export default function ClickAnalyticsWidget() {
  const [analytics, setAnalytics] = useState<ClickAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  // Simular dados de análise (em produção, viria de uma API)
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Simular delay de API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Dados simulados
        const mockAnalytics: ClickAnalytics[] = [
          {
            buttonId: "btn-product-1",
            totalClicks: 156,
            uniqueUsers: 89,
            clicksByAction: { buy: 120, view: 25, add_to_cart: 11 },
            lastClicked: new Date().toISOString(),
            conversionRate: 7.2,
          },
          {
            buttonId: "btn-product-2",
            totalClicks: 98,
            uniqueUsers: 67,
            clicksByAction: { buy: 75, view: 18, add_to_cart: 5 },
            lastClicked: new Date().toISOString(),
            conversionRate: 5.1,
          },
          {
            buttonId: "btn-product-3",
            totalClicks: 234,
            uniqueUsers: 145,
            clicksByAction: { buy: 180, view: 40, add_to_cart: 14 },
            lastClicked: new Date().toISOString(),
            conversionRate: 9.8,
          },
        ];

        setAnalytics(mockAnalytics);
      } catch (error) {
        console.error("Erro ao buscar análise de cliques:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Preparar dados para gráfico de linha (tendência ao longo do tempo)
  const trendData = [
    { time: "00:00", clicks: 12, users: 8 },
    { time: "04:00", clicks: 19, users: 14 },
    { time: "08:00", clicks: 45, users: 32 },
    { time: "12:00", clicks: 78, users: 56 },
    { time: "16:00", clicks: 92, users: 68 },
    { time: "20:00", clicks: 156, users: 89 },
  ];

  // Preparar dados para gráfico de pizza (distribuição de ações)
  const actionDistribution = [
    { name: "Comprar", value: 375, color: "#10b981" },
    { name: "Visualizar", value: 83, color: "#3b82f6" },
    { name: "Adicionar ao Carrinho", value: 30, color: "#f59e0b" },
  ];

  // Calcular estatísticas gerais
  const totalClicks = analytics.reduce((sum, a) => sum + a.totalClicks, 0);
  const totalUsers = analytics.reduce((sum, a) => sum + a.uniqueUsers, 0);
  const avgConversion =
    analytics.length > 0
      ? (analytics.reduce((sum, a) => sum + (a.conversionRate || 0), 0) / analytics.length).toFixed(1)
      : "0";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro de período */}
      <div className="flex gap-2">
        {(["24h", "7d", "30d"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === range
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {range === "24h" ? "Últimas 24h" : range === "7d" ? "Últimos 7 dias" : "Últimos 30 dias"}
          </button>
        ))}
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
            <MousePointerClick className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
            <p className="text-xs text-slate-500 mt-1">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +12% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Únicos</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-slate-500 mt-1">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +8% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConversion}%</div>
            <p className="text-xs text-slate-500 mt-1">
              Média entre produtos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de tendência */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Cliques</CardTitle>
          <CardDescription>Cliques e usuários únicos ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} name="Cliques" />
              <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} name="Usuários" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de distribuição de ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Ações</CardTitle>
            <CardDescription>Proporção de cliques por tipo de ação</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={actionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {actionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Produtos mais clicados */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Clicados</CardTitle>
            <CardDescription>Top 3 produtos por engajamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics
                .sort((a, b) => b.totalClicks - a.totalClicks)
                .slice(0, 3)
                .map((item, index) => (
                  <div key={item.buttonId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">#{index + 1} - {item.buttonId}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.totalClicks} cliques • {item.uniqueUsers} usuários
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{item.conversionRate}%</p>
                      <p className="text-xs text-slate-500">conversão</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de todos os botões */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Detalhada de Botões</CardTitle>
          <CardDescription>Estatísticas completas de cada botão</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium">ID do Botão</th>
                  <th className="text-center py-3 px-4 font-medium">Cliques</th>
                  <th className="text-center py-3 px-4 font-medium">Usuários</th>
                  <th className="text-center py-3 px-4 font-medium">Compras</th>
                  <th className="text-center py-3 px-4 font-medium">Visualizações</th>
                  <th className="text-center py-3 px-4 font-medium">Conversão</th>
                  <th className="text-center py-3 px-4 font-medium">Último Clique</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((item) => (
                  <tr key={item.buttonId} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{item.buttonId}</td>
                    <td className="text-center py-3 px-4">{item.totalClicks}</td>
                    <td className="text-center py-3 px-4">{item.uniqueUsers}</td>
                    <td className="text-center py-3 px-4">{item.clicksByAction.buy || 0}</td>
                    <td className="text-center py-3 px-4">{item.clicksByAction.view || 0}</td>
                    <td className="text-center py-3 px-4">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        {item.conversionRate}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 text-xs text-slate-500">
                      {new Date(item.lastClicked).toLocaleTimeString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
