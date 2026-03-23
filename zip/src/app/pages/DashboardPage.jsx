import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventory } from '../store/slices/inventorySlice';
import { fetchOrders } from '../store/slices/orderSlice';
import { Link } from 'react-router';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Package, ShoppingCart, TrendingUp, AlertCircle, MessageSquare, ArrowUpRight } from 'lucide-react';
import { socketService } from '../lib/socketService';

export function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: products } = useSelector((state) => state.inventory);
  const { items: orders } = useSelector((state) => state.orders);

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const storeId = user?.store?._id || user?.storeId;
    if (storeId) {
      dispatch(fetchInventory(storeId));
      dispatch(fetchOrders(storeId));
    }
  }, [dispatch, user]);

  useEffect(() => {
    socketService.connect();

    const handleNewMessage = (data) => {
      setNotifications(prev => [
        { id: Date.now().toString(), message: `New message from ${data.senderName}`, time: new Date() },
        ...prev.slice(0, 4)
      ]);
    };

    const handleOrderUpdate = (data) => {
      setNotifications(prev => [
        { id: Date.now().toString(), message: `Order ${data.orderId} status updated`, time: new Date() },
        ...prev.slice(0, 4)
      ]);
    };

    socketService.on('new_message', handleNewMessage);
    socketService.on('order_update', handleOrderUpdate);

    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('order_update', handleOrderUpdate);
    };
  }, []);

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock < 10 || p.stockStatus === 'low' || p.stockStatus === 'out').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  // Using unread messages from notifications for now as we don't have a chat slice yet
  const unreadMessages = notifications.length;

  const kpis = [
    {
      label: 'Products',
      value: totalProducts,
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
      trend: '+12%'
    },
    {
      label: 'Pending Orders',
      value: pendingOrders,
      icon: ShoppingCart,
      color: 'from-violet-500 to-purple-500',
      trend: '+8%'
    },
    {
      label: 'Low Stock',
      value: lowStockCount,
      icon: AlertCircle,
      color: 'from-orange-500 to-red-500',
      trend: '-3%'
    },
    {
      label: 'Live Notifications',
      value: unreadMessages,
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500',
      trend: 'Real-time'
    }
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back, {user?.name}! Here's your store's performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-6 hover:from-white/10 hover:to-white/5 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
              <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400 text-xs">
                {kpi.trend}
              </Badge>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">{kpi.label}</p>
              <p className="text-3xl font-bold text-white tracking-tight">{kpi.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Orders</h2>
            <Link to="/orders">
              <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300">
                View all <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                <p className="text-gray-500">No orders yet</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order._id || order.id}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{order.customerName}</p>
                    <p className="text-sm text-gray-400 truncate">
                      {order.items?.[0]?.productName} {order.items?.length > 1 && `+${order.items.length - 1} more`}
                    </p>
                  </div>
                  <div className="text-right mr-4 shrink-0">
                    <p className="text-white font-semibold">${order.total?.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      order.status === 'pending'
                        ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                        : order.status === 'confirmed'
                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                        : order.status === 'shipped'
                        ? 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                        : 'border-green-500/30 bg-green-500/10 text-green-400'
                    }
                  >
                    {order.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Real-time Notifications */}
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Live Feed</h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-20" />
                <p className="text-gray-500 text-sm">Waiting for updates...</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg animate-in fade-in slide-in-from-right-2 duration-300"
                >
                  <p className="text-sm text-white mb-1">{notif.message}</p>
                  <p className="text-xs text-gray-400 font-mono">{notif.time.toLocaleTimeString()}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20 backdrop-blur-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center shadow-inner">
              <AlertCircle className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">Low Stock Alert</h3>
              <p className="text-gray-300">{lowStockCount} product{lowStockCount !== 1 ? 's' : ''} need restocking</p>
            </div>
            <Link to="/inventory">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-medium">
                View Inventory
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
