// Mock WebSocket service for real-time updates

class SocketService {
  constructor() {
    this.listeners = new Map();
    this.connected = false;
  }

  connect() {
    this.connected = true;
    console.log('🔌 WebSocket connected (mock)');

    // Simulate incoming messages
    this.simulateRealTimeUpdates();
  }

  disconnect() {
    this.connected = false;
    console.log('🔌 WebSocket disconnected');
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    console.log(`📡 Emitting ${event}:`, data);
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  simulateRealTimeUpdates() {
    // Simulate new messages every 30 seconds
    setInterval(() => {
      if (this.connected && Math.random() > 0.7) {
        this.emit('new_message', {
          id: `msg-${Date.now()}`,
          conversationId: 'conv-1',
          senderId: 'cust-1',
          senderName: 'Sarah Johnson',
          senderType: 'customer',
          content: 'Are there any promotions right now?',
          timestamp: new Date(),
          read: false
        });
      }
    }, 30000);

    // Simulate order updates
    setInterval(() => {
      if (this.connected && Math.random() > 0.8) {
        this.emit('order_update', {
          orderId: 'ord-001',
          status: 'confirmed'
        });
      }
    }, 45000);
  }
}

export const socketService = new SocketService();
