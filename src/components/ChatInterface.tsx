import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types/playground';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  MessageSquare,
  Send,
  Copy,
  Trash2,
  Loader2,
  Wrench,
  User,
  Bot,
  Clock
} from 'lucide-react';
import { toast } from '../lib/toastWithTray';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onClearHistory: () => void;
  isStreaming: boolean;
  isLoading: boolean;
  isConnected: boolean;
}

export function ChatInterface({
  messages,
  onSendMessage,
  onClearHistory,
  isStreaming,
  isLoading,
  isConnected
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading || !isConnected) return;

    const message = inputMessage.trim();
    setInputMessage('');
    
    try {
      await onSendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Error handling is done in parent component
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Chat History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat History
            </CardTitle>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearHistory}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea ref={scrollAreaRef} className="h-[400px] pr-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs mt-1">
                  {isConnected
                    ? 'Start a conversation with the LLM'
                    : 'Connect to an LLM to start chatting'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onCopy={() => copyMessage(message.content)}
                    isLast={index === messages.length - 1}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Textarea
              ref={textareaRef}
              placeholder={
                isConnected
                  ? 'Type your message here... (Shift+Enter for new line)'
                  : 'Connect to an LLM first'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isConnected || isLoading}
              className="min-h-[100px] resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {isStreaming && (
                  <Badge variant="secondary" className="text-xs">
                    Streaming Enabled
                  </Badge>
                )}
                {isLoading && (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Processing...
                  </span>
                )}
              </div>
              <Button
                onClick={handleSend}
                disabled={!isConnected || isLoading || !inputMessage.trim()}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  onCopy: () => void;
  isLast: boolean;
}

function MessageBubble({ message, onCopy, isLast }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isStreaming = !isUser && !message.content && isLast;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 border'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
          <span className="text-xs font-semibold">
            {isUser ? 'You' : 'Assistant'}
          </span>
          <span className="text-xs opacity-70">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        {/* Tool Calls Card - Show before content if tools were used */}
        {!isUser && message.toolsUsed && message.toolsUsed.length > 0 && (
          <div className="mb-3 p-3 rounded-md bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                Tools Used
              </span>
              {message.toolInvocations && message.toolInvocations > 1 && (
                <Badge variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-800">
                  {message.toolInvocations} {message.toolInvocations === 1 ? 'call' : 'calls'}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {message.toolsUsed.map((tool, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 shadow-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {tool}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="whitespace-pre-wrap break-words text-sm">
          {isStreaming ? (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          ) : (
            message.content
          )}
        </div>

        {/* Response Time */}
        {!isUser && message.elapsedMs && (
          <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span>Response time: {(message.elapsedMs / 1000).toFixed(2)}s</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-2 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            className={`h-6 px-2 ${
              isUser
                ? 'text-white hover:bg-blue-600'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>

        {/* Streaming Indicator */}
        {message.isStreaming && (
          <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Streaming...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Made with Bob
