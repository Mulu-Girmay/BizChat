import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Send, Search, Package } from 'lucide-react';
import { mockConversations, mockMessages, mockProducts } from '../lib/mockData';
import { socketService } from '../lib/socketService';

export function ChatPage() {
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messages, setMessages] = useState(mockMessages[conversations[0]?.id] || []);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socketService.connect();

    const handleNewMessage = (data) => {
      if (selectedConversation && data.conversationId === selectedConversation.id) {
        setMessages(prev => [...prev, data]);

        setConversations(prev =>
          prev.map(conv =>
            conv.id === data.conversationId
              ? { ...conv, lastMessage: data.content, lastMessageTime: new Date(), unreadCount: conv.unreadCount + 1 }
              : conv
          )
        );
      }
    };

    socketService.on('new_message', handleNewMessage);

    return () => {
      socketService.off('new_message', handleNewMessage);
    };
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages(mockMessages[conversation.id] || []);

    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: 'business-1',
      senderName: 'TechStore Pro',
      senderType: 'business',
      content: newMessage,
      timestamp: new Date(),
      read: false
    };

    setMessages(prev => [...prev, message]);

    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: newMessage, lastMessageTime: new Date() }
          : conv
      )
    );

    setNewMessage('');

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Chat</h1>
        <p className="text-gray-400">Communicate with your customers in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
        <Card className="lg:col-span-1 bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-4 flex flex-col shadow-xl">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-violet-500/20 border border-violet-500/30 shadow-lg shadow-violet-500/10'
                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="flex-shrink-0 w-10 h-10 border border-white/10">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-bold">
                      {conversation.customerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {conversation.customerName}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-violet-500 text-white border-0 text-[10px] h-4 px-1.5 min-w-[16px] flex items-center justify-center">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate opacity-70">{conversation.lastMessage}</p>
                    <p className="text-[10px] text-gray-500 mt-1 font-mono">
                      {new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl flex flex-col shadow-2xl relative overflow-hidden">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-white/10 bg-white/[0.02] backdrop-blur-md relative z-10">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-white/10">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold">
                      {selectedConversation.customerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white leading-tight">{selectedConversation.customerName}</p>
                    <p className="text-xs text-gray-500">{selectedConversation.customerEmail}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Online</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-0">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'business' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
                        message.senderType === 'business'
                          ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-br-none shadow-violet-500/10'
                          : 'bg-white/10 text-white rounded-bl-none border border-white/5'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 opacity-50`}>
                        <p className="text-[10px] font-mono">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start animate-in fade-in duration-300">
                    <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-none px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-white/[0.02] relative z-10">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a secure message..."
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:ring-violet-500/50"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20 active:scale-95 transition-transform"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30">
               <MessageSquare className="w-16 h-16 mb-4" />
               <p className="text-gray-400 font-medium">Select a conversation to decrypt messaging</p>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-1 bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-6 shadow-xl overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl"></div>
          <h3 className="text-lg font-bold text-white mb-6 relative z-10">Context Actions</h3>
          <div className="space-y-4 relative z-10">
             <div>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Suggested Products</p>
               <div className="space-y-2">
                {mockProducts.slice(0, 3).map(product => (
                  <div
                    key={product.id}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-lg flex items-center justify-center border border-white/5 group-hover:border-violet-500/30">
                        <Package className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{product.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">${product.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
             </div>
             
             <div className="pt-4 border-t border-white/5">
                <Button variant="outline" className="w-full border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/5">
                   Request Payment
                </Button>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
