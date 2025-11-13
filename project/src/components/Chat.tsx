import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Connection {
  id: string;
  profile: {
    id: string;
    full_name: string;
  };
}

interface ChatProps {
  connection: Connection;
  onClose: () => void;
}

export default function Chat({ connection, onClose }: ChatProps) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`messages:${connection.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `connection_id=eq.${connection.id}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [connection.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('connection_id', connection.id)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile) return;

    setLoading(true);

    try {
      await supabase.from('messages').insert({
        connection_id: connection.id,
        sender_id: profile.id,
        content: newMessage.trim()
      });

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#930200] to-[#ff8e00] text-white rounded-t-2xl">
          <h3 className="font-bold text-lg">{connection.profile.full_name}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  message.sender_id === profile?.id
                    ? 'bg-gradient-to-r from-[#930200] to-[#ff8e00] text-white'
                    : 'bg-white border'
                }`}
              >
                <p className="break-words">{message.content}</p>
                <span className={`text-xs mt-1 block ${
                  message.sender_id === profile?.id ? 'text-white/70' : 'text-gray-400'
                }`}>
                  {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t bg-white rounded-b-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-[#ff8e00] focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-gradient-to-r from-[#930200] to-[#ff8e00] text-white p-3 rounded-full hover:scale-110 transition disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
