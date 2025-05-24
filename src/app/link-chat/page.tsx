
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { MessageCircle, Send, Loader2, Link as LinkIcon, Globe, XCircle, AlertTriangle } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { fetchLinkContentAction, fetchLinkChatResponseAction } from '@/lib/actions';

export default function LinkChatPage() {
  const [linkUrl, setLinkUrl] = useState('');
  const [pageContentContext, setPageContentContext] = useState<string | null>(null);
  const [pageTitleForContext, setPageTitleForContext] = useState<string | null>(null);
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentUserMessage, setCurrentUserMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [attemptedLoadUrl, setAttemptedLoadUrl] = useState<string | null>(null);

  const handleLoadLink = useCallback(async () => {
    if (!linkUrl.trim()) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a web page URL.',
        variant: 'destructive',
      });
      return;
    }
    // Basic URL validation
    try {
      new URL(linkUrl);
    } catch (_) {
      toast({
        title: 'Invalid URL Format',
        description: 'Please enter a valid URL (e.g., https://example.com).',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingLink(true);
    setPageContentContext(null); 
    setPageTitleForContext(null);
    setChatHistory([]); 
    setAttemptedLoadUrl(linkUrl);

    const result = await fetchLinkContentAction(linkUrl);

    if (result.content) {
      setPageContentContext(result.content);
      setPageTitleForContext(result.title || 'the loaded page');
      toast({
        title: 'Page Content Loaded!',
        description: `Ready to chat about: ${result.title || 'the loaded page'}. The AI will attempt to understand the page's HTML.`,
      });
    } else {
      toast({
        title: 'Content Fetch Error',
        description: result.error || 'Could not load content from the URL. The page might be inaccessible or too complex.',
        variant: 'destructive',
      });
    }
    
    setIsLoadingLink(false);
  }, [linkUrl, toast]);

  const handleSendMessage = useCallback(async () => {
    if (!currentUserMessage.trim() || !pageContentContext) {
      if (!pageContentContext) {
        toast({
          title: 'No Page Loaded',
          description: 'Please load a web page first or ensure its content could be fetched.',
          variant: 'destructive'
        });
      }
      return;
    }

    const newMessage: ChatMessage = { role: 'user', content: currentUserMessage };
    setChatHistory(prev => [...prev, newMessage]);
    setCurrentUserMessage('');
    setIsSendingMessage(true);

    try {
      const response = await fetchLinkChatResponseAction({
        pageHtmlContent: pageContentContext, // Send HTML content
        userMessage: newMessage.content,
        chatHistory: chatHistory, 
      });

      const aiResponse: ChatMessage = { role: 'model', content: response.aiResponse };
      setChatHistory(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message to link chat:', error);
      toast({
        title: 'Error',
        description: 'Could not get a response from the AI for this link. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingMessage(false);
    }
  }, [pageContentContext, currentUserMessage, chatHistory, toast]);

  const clearLinkContext = () => {
    setPageContentContext(null);
    setPageTitleForContext(null);
    setLinkUrl('');
    setChatHistory([]);
    setAttemptedLoadUrl(null);
    toast({ title: 'Link context cleared', description: 'Enter a new URL to load another page.'});
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [chatHistory]);

  return (
    <div className="space-y-12">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <Globe className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Link Chat
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Enter a web page URL to fetch its content, then chat with an AI about it.
        </p>
         <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 max-w-lg mx-auto">
          <AlertTriangle className="inline h-3 w-3 mr-1" />
          Note: Content fetching is basic and may not work for all websites (especially complex, dynamic ones). AI will interpret raw HTML.
        </p>
      </section>

      <Card className="shadow-md border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <LinkIcon className="h-6 w-6 text-primary" />
            Load Web Page
          </CardTitle>
          <CardDescription>
            Paste a URL below. The app will attempt to fetch its HTML content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              disabled={isLoadingLink || !!pageContentContext}
              className="text-base flex-grow"
            />
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={handleLoadLink} 
                disabled={isLoadingLink || !!pageContentContext || !linkUrl.trim()} 
                className="min-w-[120px]"
              >
                {isLoadingLink ? <Spinner size="sm" className="mr-2" /> : <Globe className="mr-2 h-5 w-5" />}
                {isLoadingLink ? 'Loading...' : (pageContentContext ? 'Loaded' : 'Load Link')}
              </Button>
              {pageContentContext && (
                <Button variant="outline" onClick={clearLinkContext} className="min-w-[120px]">
                    <XCircle className="mr-2 h-5 w-5" /> Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {pageContentContext && (
        <Card className="shadow-md border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MessageCircle className="h-6 w-6 text-primary" />
              Chat with: <span className="truncate max-w-md">{pageTitleForContext || "the loaded page"}</span>
            </CardTitle>
            <CardDescription>
              The AI is using the fetched HTML content from <span className="font-semibold truncate max-w-md inline-block align-bottom">{attemptedLoadUrl}</span> as its knowledge base.
              Accuracy depends on page structure and AI model capabilities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4 mb-4 bg-muted/30" ref={scrollAreaRef}>
              {chatHistory.length === 0 && (
                <p className="text-muted-foreground text-center">No messages yet. Ask something about the page content!</p>
              )}
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 p-3 rounded-lg max-w-[80%] break-words ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-secondary text-secondary-foreground mr-auto'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
               {isSendingMessage && chatHistory[chatHistory.length-1]?.role === 'user' && (
                <div className="mb-3 p-3 rounded-lg max-w-[80%] bg-secondary text-secondary-foreground mr-auto animate-pulse">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm">AI is thinking...</p>
                  </div>
                </div>
              )}
            </ScrollArea>
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask something about the page..."
                value={currentUserMessage}
                onChange={(e) => setCurrentUserMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (currentUserMessage.trim()) handleSendMessage();
                    }
                }}
                disabled={isSendingMessage || !pageContentContext}
                className="text-base min-h-[60px]"
                rows={2}
              />
              <Button onClick={handleSendMessage} disabled={isSendingMessage || !currentUserMessage.trim() || !pageContentContext} className="self-end min-w-[100px]">
                {isSendingMessage ? <Spinner size="sm" className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

       {isLoadingLink && (
         <div className="text-center py-10">
            <Spinner size="lg" />
            <p className="text-muted-foreground mt-4">Fetching page content from <span className="font-medium">{attemptedLoadUrl || 'your link'}</span>, please wait...</p>
         </div>
       )}

       {!isLoadingLink && attemptedLoadUrl && !pageContentContext && (
         <Card className="shadow-md border">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Could not load content for <span className="font-medium">{attemptedLoadUrl}</span>. 
                The page might be inaccessible, block automated fetching, or be too complex for basic extraction.
                <br />Try a different URL or check the console for more details.
              </p>
            </CardContent>
         </Card>
       )}

       {!attemptedLoadUrl && !pageContentContext && !isLoadingLink && (
         <Card className="shadow-md border">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Enter a web page URL above and click "Load Link" to begin chatting.
              </p>
            </CardContent>
         </Card>
       )}
    </div>
  );
}

    