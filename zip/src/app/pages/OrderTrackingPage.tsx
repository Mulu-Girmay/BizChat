import { useState } from 'react';
import { useParams } from 'react-router';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckCircle, Clock, Truck, Package } from 'lucide-react';
import { mockOrders } from '../lib/mockData';

export function OrderTrackingPage() {
  const { token } = useParams();
  const order = mockOrders.find(o => o.trackingToken === token);

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0a0a0f] flex items-center justify-center p-4">
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-12 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Order Not Found</h1>
          <p className="text-gray-400">The tracking code you entered is invalid or the order doesn't exist.</p>
        </Card>
      </div>
    );
  }

  const statusSteps = [
    { status: 'pending', label: 'Order Placed', icon: Clock, completed: true },
    { status: 'confirmed', label: 'Confirmed', icon: CheckCircle, completed: order.status !== 'pending' },
    { status: 'shipped', label: 'Shipped', icon: Truck, completed: order.status === 'shipped' || order.status === 'delivered' },
    { status: 'delivered', label: 'Delivered', icon: Package, completed: order.status === 'delivered' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Track Your Order</h1>
          <p className="text-gray-400 mb-4">Order ID: {order.id}</p>
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
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </Card>

        {/* Status Timeline */}
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Order Status</h2>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-white/10"></div>
            <div className="space-y-8">
              {statusSteps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.status} className="relative flex items-center gap-6">
                    <div
                      className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center ${
                        step.completed
                          ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                          : 'bg-white/5 border-2 border-white/10'
                      }`}
                    >
                      <StepIcon className={`w-7 h-7 ${step.completed ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${step.completed ? 'text-white' : 'text-gray-500'}`}>
                        {step.label}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {step.completed ? new Date(order.createdAt).toLocaleString() : 'Pending'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Order Details */}
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Order Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-gray-400">Customer</span>
              <span className="text-white font-medium">{order.customerName}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-gray-400">Email</span>
              <span className="text-white font-medium">{order.customerEmail}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-gray-400">Order Date</span>
              <span className="text-white font-medium">{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-gray-400">Tracking Code</span>
              <span className="text-white font-medium font-mono">{order.trackingToken}</span>
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Items</h2>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">{item.productName}</p>
                  <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                </div>
                <p className="text-white font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/10">
            <span className="text-xl font-semibold text-white">Total</span>
            <span className="text-2xl font-bold text-white">${order.total.toFixed(2)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
