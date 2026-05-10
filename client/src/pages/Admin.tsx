import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { ProductsManagement } from "@/pages/admin/ProductsManagement";
import { OrdersManagement } from "@/pages/admin/OrdersManagement";
import CategoriesTab from "@/pages/admin/CategoriesTab";
import SettingsTab from "@/pages/admin/SettingsTab";
import ChannelsTab from "@/pages/admin/ChannelsTab";
import {
  BarChart3,
  ShoppingCart,
  Package,
  Settings,
  LayoutDashboard,
  MessageCircle,
} from "lucide-react";

export default function Admin() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!loading && (!user || user.role !== "admin")) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Acesso negado. Você não tem permissão para acessar esta página.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Painel Administrativo</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Gerencie produtos, categorias, pedidos e configurações do seu
            marketplace
          </p>
        </div>

        {/* Tabs com ícones */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-slate-100 p-1 rounded-lg">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-2 rounded-md"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="flex items-center gap-2 rounded-md"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="flex items-center gap-2 rounded-md"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Categorias</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex items-center gap-2 rounded-md"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger
              value="channels"
              className="flex items-center gap-2 rounded-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Canais</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 rounded-md"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-slate-200">
            <TabsContent value="dashboard" className="p-6 space-y-4">
              <AdminDashboard />
            </TabsContent>

            <TabsContent value="products" className="p-6 space-y-4">
              <ProductsManagement />
            </TabsContent>

            <TabsContent value="categories" className="p-6 space-y-4">
              <CategoriesTab />
            </TabsContent>

            <TabsContent value="orders" className="p-6 space-y-4">
              <OrdersManagement />
            </TabsContent>

            <TabsContent value="channels" className="p-6 space-y-4">
              <ChannelsTab />
            </TabsContent>

            <TabsContent value="settings" className="p-6 space-y-4">
              <SettingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
