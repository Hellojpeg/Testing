
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Brain, Sparkles, Download, Printer, FileText, Lightbulb, HelpCircle, BookOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { fetchStudyGuideAction } from '@/lib/actions';
import type { GenerateStudyGuideInput, GenerateStudyGuideOutput } from '@/ai/flows/generate-study-guide-flow';
import type { StudyGuideData, FlashcardItem, DefinitionItem, PracticeQuestionItem } from '@/lib/types';


const CreateStudyGuideFormSchema = z.object({
  sourceContent: z.string().min(50, "Source content must be at least 50 characters to generate a meaningful study guide."),
});
type CreateStudyGuideFormValues = z.infer<typeof CreateStudyGuideFormSchema>;


export default function StudyGuideCreatorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<StudyGuideData | null>(null);
  const { toast } = useToast();

  const form = useForm<CreateStudyGuideFormValues>({
    resolver: zodResolver(CreateStudyGuideFormSchema),
    defaultValues: {
      sourceContent: '',
    },
  });

  const onSubmit = async (data: CreateStudyGuideFormValues) => {
    setIsLoading(true);
    setGeneratedData(null);
    try {
      const result = await fetchStudyGuideAction(data as GenerateStudyGuideInput);
      if (result.studyGuideMarkdown && !result.studyGuideMarkdown.startsWith("# Error")) {
        setGeneratedData(result);
        toast({
          title: 'Study Guide Generated!',
          description: 'Your study materials are ready below.',
        });
      } else {
        setGeneratedData(null); // Clear previous data if generation fails
        toast({
          title: 'Generation Failed',
          description: result.studyGuideMarkdown || 'Could not generate the study guide. Please check the content or try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to generate study guide:', error);
      setGeneratedData(null);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExport = () => {
    if (!generatedData?.studyGuideMarkdown) {
      toast({ title: 'Nothing to Export', variant: 'destructive' });
      return;
    }
    const titleMatch = generatedData.studyGuideMarkdown.match(/^#\s*(.*)/m);
    const guideTitle = titleMatch && titleMatch[1] ? titleMatch[1].trim() : 'Generated_Study_Guide';
    const filename = `${guideTitle.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.md`;
    
    const blob = new Blob([generatedData.studyGuideMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast({ title: 'Exported!', description: `${filename} downloaded.` });
  };

  const handlePrint = () => {
    if (!generatedData?.studyGuideMarkdown) {
      toast({ title: 'Nothing to Print', variant: 'destructive' });
      return;
    }
    // This prints the whole page. For better printing, one might isolate the content.
    window.print();
     toast({
      title: "Printing Initiated",
      description: "Your browser's print dialog should appear. For best results, adjust print settings (e.g., scale, layout, print selection).",
    });
  };

  const handleSetGeneratedData = (data: StudyGuideData | null) => {
    setGeneratedData(data);
  }

  return (
    <div className="space-y-12">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <Brain className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Deep Study Guide Creator
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Paste any text content below, and let AI create a comprehensive study guide, flashcards, definitions, and practice questions for you.
        </p>
      </section>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-md border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                Input Your Content
              </CardTitle>
              <CardDescription>
                Paste the text material you want to study. The more comprehensive the text, the better the study guide. Minimum 50 characters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="sourceContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Source Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your article, notes, or any text content here..."
                        {...field}
                        rows={15}
                        className="text-sm leading-relaxed p-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button size="lg" type="submit" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" className="mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />}
                {isLoading ? 'Generating Materials...' : 'Generate Study Materials'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      
      {isLoading && !generatedData && ( 
        <div className="text-center py-10">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">AI is crafting your study materials, this may take a moment...</p>
        </div>
      )}

      {generatedData && (
        <Card className="shadow-md border mt-12">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Your Study Materials</CardTitle>
              <CardDescription>Review, edit, and use your generated study content.</CardDescription>
            </div>
            <TooltipProvider>
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button onClick={handleExport} variant="default" size="icon">
                            <Download className="h-5 w-5" />
                            <span className="sr-only">Export Study Guide as Markdown</span>
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Export Study Guide (.md)</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button onClick={handlePrint} variant="outline" size="icon">
                            <Printer className="h-5 w-5" />
                            <span className="sr-only">Print Document</span>
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Print Document</p></TooltipContent>
                    </Tooltip>
                </div>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="guide" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
                <TabsTrigger value="guide"><BookOpen className="mr-2 h-4 w-4" />Study Guide</TabsTrigger>
                <TabsTrigger value="flashcards"><Lightbulb className="mr-2 h-4 w-4"/>Flashcards</TabsTrigger>
                <TabsTrigger value="definitions"><FileText className="mr-2 h-4 w-4"/>Definitions</TabsTrigger>
                <TabsTrigger value="questions"><HelpCircle className="mr-2 h-4 w-4"/>Practice Qs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="guide">
                <div data-color-mode="light" className="prose max-w-none border rounded-md p-1">
                  <MDEditor
                    value={generatedData.studyGuideMarkdown}
                    onChange={(value) => handleSetGeneratedData({...generatedData, studyGuideMarkdown: value || ''})}
                    preview="edit"
                    height={600}
                    previewOptions={{
                      rehypePlugins: [[rehypeSanitize]],
                    }}
                    visibleDragbar={false}
                  />
                </div>
              </TabsContent>

              <TabsContent value="flashcards">
                <Accordion type="single" collapsible className="w-full">
                  {generatedData.flashcards.length > 0 ? generatedData.flashcards.map((fc, index) => (
                    <AccordionItem value={`flashcard-${index}`} key={index}>
                      <AccordionTrigger className="text-left hover:no-underline p-4 text-base font-medium">
                        {fc.question}
                      </AccordionTrigger>
                      <AccordionContent className="p-4 pt-0 text-sm text-muted-foreground bg-muted/30 rounded-b-md">
                        <p className="whitespace-pre-line">{fc.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  )) : <p className="text-muted-foreground p-4">No flashcards generated for this content.</p>}
                </Accordion>
              </TabsContent>

              <TabsContent value="definitions">
                <div className="space-y-4">
                  {generatedData.definitions.length > 0 ? generatedData.definitions.map((def, index) => (
                    <Card key={index} className="bg-secondary/30">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-lg">{def.term}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4 px-4">
                        <p className="text-sm text-foreground">{def.definition}</p>
                      </CardContent>
                    </Card>
                  )) : <p className="text-muted-foreground p-4">No definitions generated for this content.</p>}
                </div>
              </TabsContent>

              <TabsContent value="practiceQuestions">
                <div className="space-y-4">
                {generatedData.practiceQuestions.length > 0 ? generatedData.practiceQuestions.map((pq, index) => (
                    <Card key={index} className="shadow-sm border">
                        <CardHeader className="pb-3 pt-4 px-4">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base font-semibold">Question {index + 1}</CardTitle>
                                {pq.questionType && <span className="text-xs uppercase text-muted-foreground font-medium bg-muted px-2 py-1 rounded-full">{pq.questionType}</span>}
                            </div>
                        </CardHeader>
                        <CardContent className="pb-4 px-4">
                            <p className="text-sm text-foreground mb-2">{pq.questionText}</p>
                            {pq.options && (
                                <p className="text-xs text-muted-foreground mt-1">Options: {pq.options}</p>
                            )}
                            {pq.correctAnswer && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">Answer: {pq.correctAnswer}</p>
                            )}
                        </CardContent>
                    </Card>
                )) : <p className="text-muted-foreground p-4">No practice questions generated for this content.</p>}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

