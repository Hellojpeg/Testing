
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';


import { fetchPmdFromDescriptionAction } from '@/lib/actions';
import { 
  GeneratePmdFromDescriptionInputSchema, 
  type GeneratePmdFromDescriptionInput 
} from '@/lib/schemas/pmd';


import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { ClipboardEdit, FileText, Download, Sparkles, ArrowLeft, Edit3, RotateCcw, Lightbulb, Printer } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type CreationMode = 'undecided' | 'ai' | 'manual';

type AiFreeFormPmdValues = GeneratePmdFromDescriptionInput;

export default function ProjectMakerPage() {
  const [creationMode, setCreationMode] = useState<CreationMode>('undecided');
  const [isLoading, setIsLoading] = useState(false);
  const [pmdContent, setPmdContent] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<AiFreeFormPmdValues>({
    resolver: zodResolver(GeneratePmdFromDescriptionInputSchema), 
    defaultValues: {
      description: '',
    },
  });

  const onSubmitAiForm = async (data: AiFreeFormPmdValues) => {
    setIsLoading(true);
    setPmdContent(null);
    try {
      const result = await fetchPmdFromDescriptionAction(data);
      if (result.pmdContent) {
        setPmdContent(result.pmdContent);
        toast({
          title: 'PMD Generated!',
          description: 'Your Project Management Document is ready.',
        });
      } else {
        toast({
          title: 'Generation Failed',
          description: result.pmdContent || 'Could not generate the PMD from the description. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to generate PMD from description:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while generating the PMD.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!pmdContent) {
      toast({
        title: 'Cannot Export',
        description: 'No PMD content to export.',
        variant: 'destructive',
      });
      return;
    }
    const titleMatch = pmdContent.match(/^#\s*(.*)/m);
    const projectTitle = titleMatch && titleMatch[1] ? titleMatch[1].trim() : 'Generated_Project_Document';
    const filename = `${projectTitle.replace(/\s+/g, '_')}_PMD.md`;

    const blob = new Blob([pmdContent], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: 'Exported!',
        description: `${filename} has been downloaded.`,
      });
    } else {
      toast({
        title: 'Export Failed',
        description: 'Your browser does not support direct file downloads.',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Printing Initiated",
      description: "Your browser's print dialog should appear. For best results, you might want to adjust print settings (e.g., scale, layout).",
    });
  };

  const handleSetMode = (mode: CreationMode) => {
    setCreationMode(mode);
    setPmdContent(null);
    setIsLoading(false);
    form.reset({ description: '' }); 
  };
  
  const pageDescription = creationMode === 'undecided' 
    ? "Choose how you'd like to create your Project Management Document."
    : creationMode === 'ai'
    ? "Describe your project, vision, or problem, and our AI will craft a PMD for you."
    : "Manually create your PMD (feature coming soon).";

  return (
    <div className="space-y-12">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <ClipboardEdit className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Project Document Creator
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {pageDescription}
        </p>
      </section>

      {creationMode === 'undecided' && (
        <Card className="shadow-md border">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Creation Method</CardTitle>
            <CardDescription className="text-center">
              Select how you want to generate your PMD.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-center items-center gap-6 py-10">
            <Button size="lg" onClick={() => handleSetMode('ai')} className="w-full sm:w-auto">
              <Lightbulb className="mr-2 h-5 w-5" />
              Generate with AI
            </Button>
            <Button size="lg" variant="outline" onClick={() => handleSetMode('manual')} className="w-full sm:w-auto">
              <Edit3 className="mr-2 h-5 w-5" />
              Create Manually
            </Button>
          </CardContent>
        </Card>
      )}

      {creationMode === 'manual' && (
        <Card className="shadow-md border">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Manual PMD Creation</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-10">
            <Edit3 className="mx-auto h-12 w-12 text-primary mb-4" />
            <p className="text-lg text-muted-foreground mb-6">
              The manual PMD creation feature is currently under development.
              <br />
              Please check back later, or try our AI generation!
            </p>
            <Button onClick={() => handleSetMode('undecided')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Choices
            </Button>
          </CardContent>
        </Card>
      )}

      {creationMode === 'ai' && !pmdContent && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitAiForm)} className="space-y-8">
            <Card className="shadow-md border overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <FileText className="h-6 w-6 text-primary" />
                    Describe Your Project
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleSetMode('undecided')} type="button">
                     <RotateCcw className="mr-2 h-4 w-4" /> Change Method
                  </Button>
                </div>
                <CardDescription>
                  Tell us about your product, vision, problem, or solution. The AI will use this to generate a draft PMD.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6 min-h-[200px]">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., We are building a mobile app to help users find local community events. It should allow event discovery, RSVPs, and user profiles..." 
                          {...field} 
                          rows={10}
                          className="text-base" 
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
                  {isLoading ? 'Generating Document...' : 'Generate PMD with AI'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}
      
      {isLoading && creationMode === 'ai' && !pmdContent && ( 
        <div className="text-center py-10">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">AI is drafting your PMD, please wait...</p>
        </div>
      )}

      {pmdContent && (
        <Card className="shadow-md border mt-12">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Generated Project Management Document</CardTitle>
              <CardDescription>Review and edit the generated PMD. You can copy, export, or print it.</CardDescription>
            </div>
            <TooltipProvider>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => handleSetMode('undecided')} variant="outline" size="icon">
                        <RotateCcw className="h-5 w-5" />
                        <span className="sr-only">Start New Document</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start New Document</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleExport} variant="default" size="icon" disabled={!pmdContent}>
                        <Download className="h-5 w-5" />
                        <span className="sr-only">Export as Markdown</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export as .md</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handlePrint} variant="outline" size="icon" disabled={!pmdContent}>
                        <Printer className="h-5 w-5" />
                        <span className="sr-only">Print Document</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Print Document</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div data-color-mode="light" className="prose max-w-none">
              <MDEditor
                value={pmdContent}
                onChange={(value) => setPmdContent(value || '')}
                preview="edit" 
                height={600}
                rehypePlugins={[rehypeSanitize]}
                visibleDragbar={false}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

