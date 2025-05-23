
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Youtube, MessageCircle, Send, Loader2, Link as LinkIcon, PlayCircle } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { fetchYoutubeChatResponseAction } from '@/lib/actions';

const PLACEHOLDER_TRANSCRIPT = "This is a placeholder transcript for the YouTube video. In a real application, this content would be dynamically fetched and processed from the provided YouTube URL. For now, you can ask questions about general topics, or pretend this is the video's content. For example: What is this video about? (AI will respond based on this placeholder text). This placeholder mentions topics like AI, Next.js, and building applications.";

export default function YouTubeVideoChatPage() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoContext, setVideoContext] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentUserMessage, setCurrentUserMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleLoadVideo = useCallback(async () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a YouTube video URL.',
        variant: 'destructive',
      });
      return;
    }
    // Basic URL validation (very simple)
    if (!youtubeUrl.includes('youtube.com/') && !youtubeUrl.includes('youtu.be/')) {
        toast({
            title: 'Invalid URL',
            description: 'Please enter a valid YouTube video URL.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoadingVideo(true);
    setChatHistory([]); // Reset chat history for new video

    // Simulate video processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setVideoContext(PLACEHOLDER_TRANSCRIPT);
    setIsLoadingVideo(false);
    toast({
      title: 'Video "Processed" (Placeholder)',
      description: 'Ready to chat about the video content!',
    });
  }, [youtubeUrl, toast]);

  const handleSendMessage = useCallback(async () => {
    if (!currentUserMessage.trim() || !videoContext) {
      return;
    }

    const newUserMessage: ChatMessage = { role: 'user', content: currentUserMessage };
    setChatHistory(prev => [...prev, newUserMessage]);
    setCurrentUserMessage('');
    setIsSendingMessage(true);

    try {
      const response = await fetchYoutubeChatResponseAction({
        videoTranscript: videoContext,
        userMessage: newUserMessage.content,
        chatHistory: chatHistory, 
      });

      const aiResponse: ChatMessage = { role: 'model', content: response.aiResponse };
      setChatHistory(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Could not get a response from the AI. Please try again.',
        variant: 'destructive',
      });
      // Optionally add the user's message back to the input or history if failed
      setChatHistory(prev => prev.filter(msg => msg !== newUserMessage)); // Basic rollback
    } finally {
      setIsSendingMessage(false);
    }
  }, [currentUserMessage, videoContext, chatHistory, toast]);

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
        <Youtube className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          YouTube Video Chat
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Enter a YouTube video link, and chat with an AI about its content.
        </p>
      </section>

      <Card className="shadow-md border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <LinkIcon className="h-6 w-6 text-primary" />
            Load YouTube Video
          </CardTitle>
          <CardDescription>
            Paste a YouTube video URL below. The AI will use a placeholder transcript for now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={isLoadingVideo || !!videoContext}
              className="text-base"
            />
            <Button onClick={handleLoadVideo} disabled={isLoadingVideo || !!videoContext || !youtubeUrl.trim()} className="min-w-[120px]">
              {isLoadingVideo ? <Spinner size="sm" className="mr-2" /> : <PlayCircle className="mr-2 h-5 w-5" />}
              {isLoadingVideo ? 'Loading...' : (videoContext ? 'Loaded' : 'Load Video')}
            </Button>
          </div>
           {videoContext && (
            <Button variant="outline" onClick={() => {
                setVideoContext(null);
                setYoutubeUrl('');
                setChatHistory([]);
                toast({ title: 'Video context cleared', description: 'Enter a new URL to load another video.'});
            }}>
                Load Another Video
            </Button>
           )}
        </CardContent>
      </Card>

      {videoContext && (
        <Card className="shadow-md border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MessageCircle className="h-6 w-6 text-primary" />
              Chat with the Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4 mb-4 bg-muted/30" ref={scrollAreaRef}>
              {chatHistory.length === 0 && (
                <p className="text-muted-foreground text-center">No messages yet. Ask something about the video!</p>
              )}
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 p-3 rounded-lg max-w-[80%] ${
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
                placeholder="Ask something about the video..."
                value={currentUserMessage}
                onChange={(e) => setCurrentUserMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                    }
                }}
                disabled={isSendingMessage || !videoContext}
                className="text-base min-h-[60px]"
                rows={2}
              />
              <Button onClick={handleSendMessage} disabled={isSendingMessage || !currentUserMessage.trim() || !videoContext} className="self-end min-w-[100px]">
                {isSendingMessage ? <Spinner size="sm" className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
