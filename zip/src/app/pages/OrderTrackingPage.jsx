import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckCircle, Clock, Truck, Package, Loader2, AlertCircle } from 'lucide-react';
import api from '../lib/api';

export function OrderTrackingPage() {
  const { token } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/track/${token}`);
        setOrder(response.data.data);
      } catch (err) {
        setError('Order not found');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOrder();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0a0a0f] flex items-center justify-center p-4">
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-12 text-center max-w-md shadow-2xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold text-white mb-2">Order Not Found</h1>
          <p className="text-gray-400">The tracking code you entered is invalid or the order doesn't exist.</p>
        </Card>
      </div>
    );
  }

  const isCompleted = (status) => {
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
    return statuses.indexOf(order.status) >= statuses.indexOf(status);
  };

  const statusSteps = [
    { status: 'pending', label: 'Order Placed', icon: Clock, completed: isCompleted('pending') },
    { status: 'confirmed', label: 'Confirmed', icon: CheckCircle, completed: isCompleted('confirmed') },
    { status: 'shipped', label: 'Shipped', icon: Truck, completed: isCompleted('shipped') },
    { status: 'delivered', label: 'Delivered', icon: Package, completed: isCompleted('delivered') }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-8 text-center shadow-xl">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/20">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Order Tracking</h1>
          <p className="text-gray-400 mb-6 font-mono border-y border-white/5 py-3 inline-block px-12 uppercase tracking-widest text-sm">
            {order._id?.slice(-8).toUpperCase() || order.id}
          </p>
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={`px-4 py-1 text-xs font-bold uppercase tracking-widest transition-all ${
                order.status === 'pending'
                  ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                  : order.status === 'confirmed'
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                  : order.status === 'shipped'
                  ? 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                  : 'border-green-500/30 bg-green-500/10 text-green-400'
              }`}
            >
              {order.status}
            </Badge>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-10 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <h2 className="text-xl font-bold text-white mb-10 relative z-10">Shipment Timeline</h2>
          <div className="relative">
             <div className="absolute left-9 top-0 bottom-0 w-[2px] bg-white/5"></div>
             <div className="space-y-12">
              {statusSteps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.status} className="relative flex items-center gap-10 group">
                    <div
                      className={`relative z-10 w-18 h-18 rounded-2xl flex items-center justify-center transition-all duration-700 ${
                        step.completed
                          ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/20 ring-4 ring-violet-500/10'
                          : 'bg-white/5 border border-white/10 opacity-30 scale-90'
                      }`}
                    >
                      <StepIcon className={`w-8 h-8 ${step.completed ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold tracking-tight mb-1 transition-colors duration-500 ${step.completed ? 'text-white' : 'text-gray-700'}`}>
                        {step.label}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                        {step.completed ? new Date(order.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Pending Clearance'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-8 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
                <Truck className="w-20 h-20" />
             </div>
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
               Recipient Details
            </h2>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Full Name</p>
                <p className="text-white font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Email Terminal</p>
                <p className="text-white font-medium">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Tracking Token</p>
                <p className="text-violet-400 font-mono text-xs break-all bg-violet-500/5 p-2 rounded-lg border border-violet-500/10">
                   {order.trackingToken}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-8 shadow-xl flex flex-col">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
               Order Content
            </h2>
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.productName}</p>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">Units: {item.quantity} × ${item.price.toFixed(2)}</p>
                  </div>
                  <p className="text-violet-400 font-bold ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-white/10">
               <div className="flex justify-between items-center bg-violet-500/10 p-4 rounded-2xl border border-violet-500/20">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Valuation</span>
                  <span className="text-2xl font-bold text-white shadow-sm ring-1 ring-violet-500/20 px-4 py-1.5 rounded-xl">
                    ${order.total?.toFixed(2)}
                  </span>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
