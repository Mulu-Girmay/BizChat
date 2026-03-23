import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus } from '../store/slices/orderSlice';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { CheckCircle, Clock, Truck, Package } from 'lucide-react';
import { toast } from 'sonner';

export function OrdersPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: orders, loading } = useSelector((state) => state.orders);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const storeId = user?.store?._id || user?.storeId;
    if (storeId) {
      dispatch(fetchOrders(storeId));
    }
  }, [dispatch, user]);

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  const handleStatusUpdateAction = async (orderId, newStatus) => {
    const resultAction = await dispatch(updateOrderStatus({ orderId, status: newStatus }));
    if (updateOrderStatus.fulfilled.match(resultAction)) {
      toast.success(`Order status updated to ${newStatus}`);
      setSelectedOrder(null);
    } else {
      toast.error('Failed to update order status');
    }
  };

  const statusConfig = {
    pending: { icon: Clock, color: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400' },
    confirmed: { icon: CheckCircle, color: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
    shipped: { icon: Truck, color: 'border-purple-500/30 bg-purple-500/10 text-purple-400' },
    delivered: { icon: Package, color: 'border-green-500/30 bg-green-500/10 text-green-400' }
  };

  const statusFilters = ['all', 'pending', 'confirmed', 'shipped', 'delivered'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
        <p className="text-gray-400">Manage and track all customer orders</p>
      </div>

      <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {statusFilters.map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              onClick={() => setFilterStatus(status)}
              className={filterStatus === status
                ? 'bg-violet-500 hover:bg-violet-600 text-white'
                : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <Badge className="ml-2 bg-white/20 text-white border-0">
                  {orders.filter(o => o.status === status).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        {filteredOrders.map(order => {
          const StatusIcon = statusConfig[order.status]?.icon || Package;
          return (
            <Card
              key={order._id || order.id}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-6 hover:bg-white/10 transition-all cursor-pointer group"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                  order.status === 'pending' ? 'from-yellow-500 to-orange-500' :
                  order.status === 'confirmed' ? 'from-blue-500 to-cyan-500' :
                  order.status === 'shipped' ? 'from-purple-500 to-pink-500' :
                  'from-green-500 to-emerald-500'
                } flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/20`}>
                  <StatusIcon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white truncate">Order #{order._id?.slice(-6) || order.id}</h3>
                    <Badge variant="outline" className={statusConfig[order.status]?.color}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">{order.customerName} • {order.customerEmail}</p>
                  <p className="text-gray-500 text-xs font-mono">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-2xl font-bold text-white mb-1">${order.total?.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">{order.items?.length || 0} items Total</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {!loading && filteredOrders.length === 0 && (
        <Card className="bg-white/5 border-dashed border-white/10 p-12 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
          <p className="text-gray-400">Try adjusting your filter</p>
        </Card>
      )}

      {loading && (
        <div className="flex justify-center py-12">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 shadow-lg shadow-violet-500/20"></div>
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-[#13131a] border-white/10 text-white max-w-2xl shadow-2xl overflow-hidden">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <span>Order Details</span>
                  <Badge variant="outline" className={statusConfig[selectedOrder.status]?.color}>
                    {selectedOrder.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer</h4>
                    <p className="text-white font-medium">{selectedOrder.customerName}</p>
                    <p className="text-gray-400 text-sm">{selectedOrder.customerEmail}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tracking Details</h4>
                    <p className="text-white font-mono text-sm mb-1">{selectedOrder.trackingToken}</p>
                    <p className="text-gray-500 text-xs">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-white font-medium truncate">{item.productName}</p>
                          <p className="text-gray-500 text-xs">Quantity: {item.quantity}</p>
                        </div>
                        <p className="text-violet-400 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/10">
                    <span className="text-lg font-semibold text-gray-400">Total Amount</span>
                    <span className="text-3xl font-bold text-white">${selectedOrder.total?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Update Status</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedOrder.status === 'pending' && (
                      <Button
                        onClick={() => handleStatusUpdateAction(selectedOrder._id || selectedOrder.id, 'confirmed')}
                        className="flex-1 bg-blue-500 hover:bg-blue-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm Order
                      </Button>
                    )}
                    {selectedOrder.status === 'confirmed' && (
                      <Button
                        onClick={() => handleStatusUpdateAction(selectedOrder._id || selectedOrder.id, 'shipped')}
                        className="flex-1 bg-purple-500 hover:bg-purple-600"
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Mark as Shipped
                      </Button>
                    )}
                    {selectedOrder.status === 'shipped' && (
                      <Button
                        onClick={() => handleStatusUpdateAction(selectedOrder._id || selectedOrder.id, 'delivered')}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
