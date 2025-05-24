
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Youtube, MessageCircle, Send, Loader2, Link as LinkIcon, PlayCircle, XCircle, Info } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { fetchYoutubeChatResponseAction, getVideoTranscriptAction } from '@/lib/actions';

export default function YouTubeVideoChatPage() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoContext, setVideoContext] = useState<string | null>(null);
  const [videoTitleForContext, setVideoTitleForContext] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentUserMessage, setCurrentUserMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [attemptedLoadUrl, setAttemptedLoadUrl] = useState<string | null>(null);


  const handleLoadVideo = useCallback(async () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a YouTube video URL.',
        variant: 'destructive',
      });
      return;
    }
    if (!youtubeUrl.includes('youtube.com/') && !youtubeUrl.includes('youtu.be/')) {
        toast({
            title: 'Invalid URL',
            description: 'Please enter a valid YouTube video URL.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoadingVideo(true);
    setVideoContext(null); 
    setVideoTitleForContext(null);
    setChatHistory([]); 
    setAttemptedLoadUrl(youtubeUrl);


    try {
        const urlObj = new URL(youtubeUrl);
        if (urlObj.hostname === 'youtu.be') {
            setVideoTitleForContext(urlObj.pathname.substring(1));
        } else if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
            setVideoTitleForContext(urlObj.searchParams.get('v'));
        } else {
            setVideoTitleForContext('the video');
        }
    } catch (e) {
        setVideoTitleForContext('the video');
    }


    const result = await getVideoTranscriptAction(youtubeUrl);

    if (result.transcript) {
      setVideoContext(result.transcript);
      toast({
        title: 'Transcript Loaded!',
        description: `Ready to chat about the video: ${videoTitleForContext || 'this video'}.`,
      });
    } else {
      toast({
        title: 'Transcript Error',
        description: result.error || 'Could not load transcript for the video.',
        variant: 'destructive',
      });
    }
    
    setIsLoadingVideo(false);
  }, [youtubeUrl, toast, videoTitleForContext]);

  const prepareAndSendMessage = useCallback(async (messageContent: string, isUserInitiated: boolean = true) => {
    if (!messageContent.trim() || !videoContext) {
      if (!videoContext) {
        toast({
          title: 'No Video Loaded',
          description: 'Please load a video first or ensure its transcript could be fetched.',
          variant: 'destructive'
        });
      }
      return;
    }

    const newMessage: ChatMessage = { role: 'user', content: messageContent };
    setChatHistory(prev => [...prev, newMessage]);
    if (isUserInitiated) {
        setCurrentUserMessage('');
    }
    setIsSendingMessage(true);

    try {
      const response = await fetchYoutubeChatResponseAction({
        videoTranscript: videoContext,
        userMessage: newMessage.content,
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
    } finally {
      setIsSendingMessage(false);
    }
  }, [videoContext, chatHistory, toast]);


  const handleSendMessage = useCallback(() => {
    prepareAndSendMessage(currentUserMessage, true);
  }, [currentUserMessage, prepareAndSendMessage]);


  const handleGetVideoInfo = useCallback(() => {
    if (!videoContext) {
      toast({ title: 'No Video Loaded', description: 'Please load a video transcript first.', variant: 'destructive' });
      return;
    }
    const title = videoTitleForContext || "this video";
    const predefinedPrompt = `Regarding the transcript for ${title}:
1. Confirm that you are working with a provided transcript.
2. What are the main topics or key points discussed in this transcript?
3. What is the general tone or style of the content according to the transcript?
4. Based on the text, can you infer the primary language of the transcript?`;
    
    prepareAndSendMessage(predefinedPrompt, false);

  }, [videoContext, videoTitleForContext, prepareAndSendMessage, toast]);


  const clearVideoContext = () => {
    setVideoContext(null);
    setVideoTitleForContext(null);
    setYoutubeUrl('');
    setChatHistory([]);
    setAttemptedLoadUrl(null);
    toast({ title: 'Video context cleared', description: 'Enter a new URL to load another video.'});
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
        <Youtube className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          YouTube Video Chat
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Enter a YouTube video link to fetch its transcript (if available), then chat with an AI about its content.
        </p>
      </section>

      <Card className="shadow-md border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <LinkIcon className="h-6 w-6 text-primary" />
            Load YouTube Video
          </CardTitle>
          <CardDescription>
            Paste a YouTube video URL below. The app will attempt to fetch its transcript.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={isLoadingVideo || !!videoContext}
              className="text-base flex-grow"
            />
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={handleLoadVideo} 
                disabled={isLoadingVideo || !!videoContext || !youtubeUrl.trim()} 
                className="min-w-[120px]"
              >
                {isLoadingVideo ? <Spinner size="sm" className="mr-2" /> : <PlayCircle className="mr-2 h-5 w-5" />}
                {isLoadingVideo ? 'Loading...' : (videoContext ? 'Loaded' : 'Load Video')}
              </Button>
              {videoContext && (
                <Button variant="outline" onClick={clearVideoContext} className="min-w-[120px]">
                    <XCircle className="mr-2 h-5 w-5" /> Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {videoContext && (
        <Card className="shadow-md border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <CardTitle className="flex items-center gap-2 text-2xl">
                <MessageCircle className="h-6 w-6 text-primary" />
                Chat with {videoTitleForContext || "the Video"}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleGetVideoInfo} disabled={isSendingMessage || !videoContext}>
                    <Info className="mr-2 h-4 w-4" />
                    Get Transcript Summary
                </Button>
            </div>
            <CardDescription>
              The AI is using the fetched transcript for <span className="font-semibold">{videoTitleForContext || "this video"}</span> as its knowledge base.
              Accuracy depends on transcript quality and AI model capabilities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4 mb-4 bg-muted/30" ref={scrollAreaRef}>
              {chatHistory.length === 0 && (
                <p className="text-muted-foreground text-center">No messages yet. Ask something about the video!</p>
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
                placeholder="Ask something about the video..."
                value={currentUserMessage}
                onChange={(e) => setCurrentUserMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (currentUserMessage.trim()) handleSendMessage();
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

       {isLoadingVideo && (
         <div className="text-center py-10">
            <Spinner size="lg" />
            <p className="text-muted-foreground mt-4">Fetching video transcript for <span className="font-medium">{attemptedLoadUrl || 'your video'}</span>, please wait...</p>
         </div>
       )}

       {!isLoadingVideo && attemptedLoadUrl && !videoContext && (
         <Card className="shadow-md border">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Could not load video context for <span className="font-medium">{attemptedLoadUrl}</span>. 
                The video might not have a transcript, it might be private, or an error occurred.
                <br />Try a different video or check the console for more details.
              </p>
            </CardContent>
         </Card>
       )}

       {!attemptedLoadUrl && !videoContext && !isLoadingVideo && (
         <Card className="shadow-md border">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Enter a YouTube URL above and click "Load Video" to begin chatting.
              </p>
            </CardContent>
         </Card>
       )}
    </div>
  );
}
