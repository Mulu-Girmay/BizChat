export const mockProducts = [
  {
    id: 'p1',
    name: 'Wireless Headphones Pro',
    sku: 'WHP-001',
    price: 149.99,
    stock: 45,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    stockStatus: 'high'
  },
  {
    id: 'p2',
    name: 'Smart Watch Ultra',
    sku: 'SWU-002',
    price: 399.99,
    stock: 8,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    stockStatus: 'low'
  },
  {
    id: 'p3',
    name: 'Laptop Stand Aluminum',
    sku: 'LSA-003',
    price: 79.99,
    stock: 0,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    stockStatus: 'out'
  },
  {
    id: 'p4',
    name: 'Mechanical Keyboard RGB',
    sku: 'MKR-004',
    price: 129.99,
    stock: 32,
    category: 'Peripherals',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400',
    stockStatus: 'high'
  },
  {
    id: 'p5',
    name: 'Wireless Mouse Pro',
    sku: 'WMP-005',
    price: 59.99,
    stock: 67,
    category: 'Peripherals',
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
    stockStatus: 'high'
  },
  {
    id: 'p6',
    name: '4K Webcam HD',
    sku: 'WCH-006',
    price: 199.99,
    stock: 5,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400',
    stockStatus: 'low'
  }
];

export const mockOrders = [
  {
    id: 'ord-001',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@email.com',
    items: [
      { productId: 'p1', productName: 'Wireless Headphones Pro', quantity: 1, price: 149.99 }
    ],
    total: 149.99,
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60000),
    trackingToken: 'TRK-001-XYZ'
  },
  {
    id: 'ord-002',
    customerName: 'Michael Chen',
    customerEmail: 'mchen@email.com',
    items: [
      { productId: 'p2', productName: 'Smart Watch Ultra', quantity: 1, price: 399.99 },
      { productId: 'p5', productName: 'Wireless Mouse Pro', quantity: 2, price: 59.99 }
    ],
    total: 519.97,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 35 * 60000),
    trackingToken: 'TRK-002-ABC'
  },
  {
    id: 'ord-003',
    customerName: 'Emma Davis',
    customerEmail: 'emma.davis@email.com',
    items: [
      { productId: 'p4', productName: 'Mechanical Keyboard RGB', quantity: 1, price: 129.99 }
    ],
    total: 129.99,
    status: 'shipped',
    createdAt: new Date(Date.now() - 2 * 3600000),
    trackingToken: 'TRK-003-DEF'
  }
];

export const mockConversations = [
  {
    id: 'conv-1',
    customerId: 'cust-1',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@email.com',
    lastMessage: 'Is the Wireless Headphones Pro still in stock?',
    lastMessageTime: new Date(Date.now() - 2 * 60000),
    unreadCount: 1,
    status: 'active'
  },
  {
    id: 'conv-2',
    customerId: 'cust-2',
    customerName: 'Michael Chen',
    customerEmail: 'mchen@email.com',
    lastMessage: 'Thanks! Looking forward to receiving my order.',
    lastMessageTime: new Date(Date.now() - 15 * 60000),
    unreadCount: 0,
    status: 'active'
  },
  {
    id: 'conv-3',
    customerId: 'cust-3',
    customerName: 'Emma Davis',
    customerEmail: 'emma.davis@email.com',
    lastMessage: 'Can I get a discount for bulk orders?',
    lastMessageTime: new Date(Date.now() - 45 * 60000),
    unreadCount: 2,
    status: 'active'
  }
];

export const mockMessages = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'cust-1',
      senderName: 'Sarah Johnson',
      senderType: 'customer',
      content: 'Hi! I\'m interested in the Wireless Headphones Pro.',
      timestamp: new Date(Date.now() - 10 * 60000),
      read: true
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'business-1',
      senderName: 'TechStore Pro',
      senderType: 'business',
      content: 'Hello Sarah! Yes, we have them in stock. They\'re our best-selling model!',
      timestamp: new Date(Date.now() - 8 * 60000),
      read: true
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'cust-1',
      senderName: 'Sarah Johnson',
      senderType: 'customer',
      content: 'Is the Wireless Headphones Pro still in stock?',
      timestamp: new Date(Date.now() - 2 * 60000),
      read: false
    }
  ],
  'conv-2': [
    {
      id: 'msg-4',
      conversationId: 'conv-2',
      senderId: 'cust-2',
      senderName: 'Michael Chen',
      senderType: 'customer',
      content: 'When will my order ship?',
      timestamp: new Date(Date.now() - 20 * 60000),
      read: true
    },
    {
      id: 'msg-5',
      conversationId: 'conv-2',
      senderId: 'business-1',
      senderName: 'TechStore Pro',
      senderType: 'business',
      content: 'Your order has been confirmed and will ship within 24 hours!',
      timestamp: new Date(Date.now() - 17 * 60000),
      read: true
    },
    {
      id: 'msg-6',
      conversationId: 'conv-2',
      senderId: 'cust-2',
      senderName: 'Michael Chen',
      senderType: 'customer',
      content: 'Thanks! Looking forward to receiving my order.',
      timestamp: new Date(Date.now() - 15 * 60000),
      read: true
    }
  ],
  'conv-3': [
    {
      id: 'msg-7',
      conversationId: 'conv-3',
      senderId: 'cust-3',
      senderName: 'Emma Davis',
      senderType: 'customer',
      content: 'Do you offer wholesale pricing?',
      timestamp: new Date(Date.now() - 50 * 60000),
      read: true
    },
    {
      id: 'msg-8',
      conversationId: 'conv-3',
      senderId: 'business-1',
      senderName: 'TechStore Pro',
      senderType: 'business',
      content: 'Yes! For orders over 10 units, we offer 15% off.',
      timestamp: new Date(Date.now() - 47 * 60000),
      read: true
    },
    {
      id: 'msg-9',
      conversationId: 'conv-3',
      senderId: 'cust-3',
      senderName: 'Emma Davis',
      senderType: 'customer',
      content: 'Can I get a discount for bulk orders?',
      timestamp: new Date(Date.now() - 45 * 60000),
      read: false
    }
  ]
};
