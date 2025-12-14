"use client";
import React, { useState, useRef, useEffect } from "react";
import { useChatAIModalContext } from "@/app/context/ChatAIModalContext";
import { ChatAIService } from "@/services/ChatAIService";
import { useAppSelector } from "@/redux/store";
import { toast } from "react-toastify";
import Image from "next/image";

interface Message {
  id: string;
  text: string;
  image?: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatAIModal = () => {
  const { isOpen, closeChatAIModal } = useChatAIModalContext();
  const { token } = useAppSelector((state) => state.auth);
  const [message, setMessage] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi có thể giúp bạn:\n• Mô tả sản phẩm bạn cần\n• Upload ảnh sản phẩm\n• Hỏi về thông số kỹ thuật",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !uploadedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      image: uploadedImage || undefined,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    const messageText = message.trim();
    const imageBase64 = uploadedImage || undefined;
    
    // Clear input immediately
    setMessage("");
    setUploadedImage(null);
    
    try {
      // Gọi API Chat AI
      const response = await ChatAIService.sendMessage(
        {
          message: messageText,
          image: imageBase64,
          conversationId: conversationId,
        },
        token || undefined
      );

      if (response.status === "SUCCESS" && response.data) {
        // Cập nhật conversationId nếu có
        if (response.data.conversationId) {
          setConversationId(response.data.conversationId);
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.response,
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.message || "Không thể nhận phản hồi từ AI");
      }
    } catch (error: any) {
      console.error("Error sending message to AI:", error);
      
      // Hiển thị thông báo lỗi
      toast.error("Không thể kết nối với AI. Vui lòng thử lại sau.", {
        autoClose: 3000,
        position: "top-right"
      });

      // Hiển thị thông báo lỗi trong chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Xin lỗi, tôi không thể kết nối với hệ thống AI lúc này. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const MessageItem = ({ message }: { message: Message }) => {
    return (
      <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-end gap-2.5 max-w-[75%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-1 ${
            message.isUser 
              ? 'bg-blue' 
              : 'bg-dark'
          }`}>
            {message.isUser ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.35 14.99 2.97 16.28L2 22L7.72 21.03C9.01 21.65 10.46 22 12 22C17.52 22 22 17.52 22 12S17.52 2 12 2Z" fill="white"/>
              </svg>
            )}
          </div>

          <div className={`rounded-lg px-4 py-2.5 shadow-1 ${
            message.isUser 
              ? 'bg-blue-200 text-blue-900' 
              : 'bg-white text-dark-3 rounded-bl-sm border border-gray-3'
          }`}>
            {message.image && (
              <div className="mb-2">
                <Image
                  src={message.image}
                  alt="Message image"
                  width={200}
                  height={200}
                  className="rounded-lg object-cover"
                />
              </div>
            )}
            
            <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
              message.isUser ? 'text-blue-900' : 'text-dark-3'
            }`}>{message.text}</p>
            
            <p className={`text-xs mt-1.5 ${
              message.isUser ? 'text-blue-700' : 'text-dark-5'
            }`}>
              {message.timestamp.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] transition-opacity duration-300"
          onClick={closeChatAIModal}
        />
      )}
      
      <div
        className={`fixed top-9 right-20 w-full sm:w-96 md:w-[420px] z-[9999] transform transition-all duration-300 ease-out flex flex-col bg-white rounded-lg ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
        style={{
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.12)',
          height: 'calc(100vh - 8rem)',
          maxHeight: 'calc(100vh - 8rem)'
        }}
      >
        {/* Header */}
        <div className="relative px-5 py-4 flex-shrink-0 bg-gray-500 shadow-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40 shadow-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.35 14.99 2.97 16.28L2 22L7.72 21.03C9.01 21.65 10.46 22 12 22C17.52 22 22 17.52 22 12S17.52 2 12 2Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              
              <div>
                <h3 className="font-semibold text-base text-white">AI Assistant</h3>
                <p className="text-xs text-white/80">Đang hoạt động</p>
              </div>
            </div>
            
            <button
              onClick={closeChatAIModal}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e0 transparent' }}>
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-end gap-2.5">
                <div className="w-8 h-8 bg-dark rounded-full flex items-center justify-center flex-shrink-0 shadow-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.35 14.99 2.97 16.28L2 22L7.72 21.03C9.01 21.65 10.46 22 12 22C17.52 22 22 17.52 22 12S17.52 2 12 2Z" fill="white"/>
                  </svg>
                </div>
                <div className="bg-white rounded-lg rounded-bl-sm px-4 py-3 shadow-1 border border-gray-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-blue rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview */}
        {uploadedImage && (
          <div className="px-4 py-3 bg-white border-t border-gray-3 flex-shrink-0">
            <div className="relative inline-block">
              <Image
                src={uploadedImage}
                alt="Uploaded"
                width={80}
                height={80} 
                className="rounded-lg object-cover shadow-1"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-1"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 py-3 bg-white border-t border-gray-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 flex items-center justify-center text-dark-5 hover:text-blue hover:bg-gray-1 rounded-lg transition-all duration-200 flex-shrink-0"
              title="Upload ảnh"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="w-full px-5 py-3 border border-gray-3 bg-gray-1 rounded-lg resize-none focus:outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 transition-all duration-200 text-base text-dark-3 placeholder:text-dark-5 scrollbar-hide"
                rows={1}
                style={{ 
                  minHeight: '44px',
                  maxHeight: '120px',
                  lineHeight: '1.5',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={(!message.trim() && !uploadedImage) || isLoading}
              className="w-10 h-10 flex items-center justify-center bg-blue text-white rounded-md hover:bg-blue-dark disabled:bg-gray-3 disabled:text-dark-5 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 shadow-1 font-medium self-start mt-0.5"
            >
              {isLoading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </>
  );
};

export default ChatAIModal;