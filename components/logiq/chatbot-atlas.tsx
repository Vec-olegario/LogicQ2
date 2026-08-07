"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, HelpCircle, Bot } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
}

const PERGUNTAS_RAPIDAS = [
  "O que é WMS?",
  "O que é o 5S?",
  "Como funciona o FIFO?",
  "O que é OTIF?",
];

export function ChatbotAtlas() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: "Olá! Sou o Atlas, seu especialista de suporte em Centro de Distribuição. Como posso te ajudar hoje?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (perguntaTexto?: string) => {
    const textToSend = (perguntaTexto || inputValue).trim();
    if (!textToSend) return;

    // Mensagem do usuário
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!perguntaTexto) setInputValue("");

    // Simulando AI
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "No momento, estou operando em modo de simulação no novo LogiQ. Em breve estarei conectado à inteligência artificial para responder sobre: \"" + textToSend + "\".",
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Janela do Chat */}
      {isOpen && (
        <div className="w-[360px] max-w-[calc(100vw-32px)] h-[500px] mb-4 bg-background/95 backdrop-blur-md border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Cabeçalho */}
          <div className="px-4 py-3 border-b border-border bg-card/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center p-1 overflow-hidden shadow-xs">
                <img src="/logiq-logo.png" alt="LogiQ" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-foreground">Atlas AI</h4>
                  <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Beta
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Assistente Operacional</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Fechar chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 p-4 overflow-y-auto bg-muted/20 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm shadow-sm"
                      : "bg-card border border-border text-foreground rounded-bl-sm shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-card border border-border text-foreground rounded-bl-sm shadow-sm flex items-center gap-2">
                  <Bot size={16} className="text-primary animate-pulse" />
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chips de Sugestão */}
          {messages.length === 1 && (
            <div className="px-4 py-3 bg-card border-t border-border flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              {PERGUNTAS_RAPIDAS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSendMessage(p)}
                  className="whitespace-nowrap flex-shrink-0 bg-background border border-border hover:border-primary/50 text-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-sm transition-colors cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input de Texto */}
          <div className="p-3 bg-card border-t border-border flex flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Pergunte ao Atlas..."
                className="flex-1 bg-background border border-input rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors cursor-pointer"
              >
                <Send size={16} className={inputValue.trim() ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
              </button>
            </form>
            <p className="text-[10px] text-center text-muted-foreground leading-tight px-1">
              O Atlas pode cometer erros. Verifique informações importantes.
            </p>
          </div>
        </div>
      )}

      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer ${
          isOpen ? "bg-muted text-muted-foreground rotate-90" : "bg-primary text-primary-foreground hover:shadow-primary/25 hover:shadow-xl"
        }`}
        aria-label="Abrir assistente IA"
      >
        {isOpen ? <X size={24} /> : <HelpCircle size={24} />}
      </button>
    </div>
  );
}
