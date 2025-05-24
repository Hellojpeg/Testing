
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { BookOpenText, Sparkles, Download, Printer, FileText, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { fetchLessonPlanAction } from '@/lib/actions';
import { AGE_GROUPS, LESSON_FRAMEWORKS } from '@/lib/educationalFramework';
import type { GenerateLessonPlanInput } from '@/ai/flows/generate-lesson-plan-flow'; // Only type import


// Define the Zod schema locally for the form, as types can be imported from the flow
const CreateLessonPlanFormSchema = z.object({
  ageGroup: z.enum(AGE_GROUPS as [string, ...string[]], { required_error: "Age group is required." }),
  lessonFramework: z.enum(LESSON_FRAMEWORKS as [string, ...string[]], { required_error: "Lesson framework is required." }),
  subjectTopic: z.string().min(3, "Subject/Topic must be at least 3 characters."),
  lessonDetailsOrPastedContent: z.string().optional(),
});
type CreateLessonPlanFormValues = z.infer<typeof CreateLessonPlanFormSchema>;


export default function LessonPlanMakerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<CreateLessonPlanFormValues>({
    resolver: zodResolver(CreateLessonPlanFormSchema),
    defaultValues: {
      subjectTopic: '',
      lessonDetailsOrPastedContent: '',
      // ageGroup and lessonFramework will use placeholder
    },
  });

  const onSubmit = async (data: CreateLessonPlanFormValues) => {
    setIsLoading(true);
    setGeneratedPlan(null);
    try {
      // The input type for the action is imported from the flow file
      const result = await fetchLessonPlanAction(data as GenerateLessonPlanInput);
      if (result.lessonPlanMarkdown) {
        setGeneratedPlan(result.lessonPlanMarkdown);
        toast({
          title: 'Lesson Plan Generated!',
          description: 'Your new lesson plan is ready below.',
        });
      } else {
        toast({
          title: 'Generation Failed',
          description: 'Could not generate the lesson plan. Please try again or check logs.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to generate lesson plan:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while generating the lesson plan.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!generatedPlan) {
      toast({ title: 'Nothing to Export', variant: 'destructive' });
      return;
    }
    const titleMatch = generatedPlan.match(/^#\s*(.*)/m);
    const planTitle = titleMatch && titleMatch[1] ? titleMatch[1].trim() : 'Generated_Lesson_Plan';
    const filename = `${planTitle.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.md`;
    const blob = new Blob([generatedPlan], { type: 'text/markdown;charset=utf-8;' });
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
    if (!generatedPlan) {
      toast({ title: 'Nothing to Print', variant: 'destructive' });
      return;
    }
    window.print();
     toast({
      title: "Printing Initiated",
      description: "Your browser's print dialog should appear. For best results, adjust print settings (e.g., scale, layout, print selection).",
    });
  };
  
  const handleStartNew = () => {
    setGeneratedPlan(null);
    form.reset();
    toast({ title: 'New Plan Started', description: 'Form has been cleared.'});
  };


  return (
    <div className="space-y-12">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <BookOpenText className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          AI Lesson Plan Maker
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Craft detailed, pedagogically sound lesson plans aligned with a classical, Christian framework.
          Select your criteria, provide details, and let the AI assist you.
        </p>
      </section>

      {!generatedPlan ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="shadow-md border">
              <CardHeader>
                 <div className="flex justify-between items-center mb-2">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <FileText className="h-6 w-6 text-primary" />
                        Create Your Lesson Plan
                    </CardTitle>
                    {generatedPlan && (
                         <Button variant="outline" size="sm" onClick={handleStartNew} type="button">
                            <RotateCcw className="mr-2 h-4 w-4" /> Start New Plan
                        </Button>
                    )}
                </div>
                <CardDescription>
                  Fill in the details below to generate your lesson plan. The AI will use the comprehensive educational framework you provided.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="ageGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Age Group</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select age group..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {AGE_GROUPS.map(group => (
                              <SelectItem key={group} value={group}>{group}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lessonFramework"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lesson Plan Framework</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select framework..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LESSON_FRAMEWORKS.map(framework => (
                              <SelectItem key={framework} value={framework}>{framework}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="subjectTopic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject / Topic</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Grade 5 Math - Equivalent Fractions" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lessonDetailsOrPastedContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Objectives / Key Details / Paste Document Content Here</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter specific learning objectives, key activities, materials, or paste text from a document to provide context..."
                          {...field}
                          rows={8}
                          className="text-sm"
                        />
                      </FormControl>
                       <p className="text-xs text-muted-foreground mt-1">This content will provide context to the AI for generating the lesson plan.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-6">
                <Button size="lg" type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner size="sm" className="mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  {isLoading ? 'Generating Plan...' : 'Generate Lesson Plan'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      ) : (
        <Card className="shadow-md border mt-12">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Generated Lesson Plan</CardTitle>
              <CardDescription>Review and edit your lesson plan. You can export or print it.</CardDescription>
            </div>
            <TooltipProvider>
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button onClick={handleStartNew} variant="outline" size="icon">
                            <RotateCcw className="h-5 w-5" />
                            <span className="sr-only">Start New Plan</span>
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Start New Plan</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button onClick={handleExport} variant="default" size="icon">
                            <Download className="h-5 w-5" />
                            <span className="sr-only">Export as Markdown</span>
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Export as .md</p></TooltipContent>
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
            <div data-color-mode="light" className="prose max-w-none">
              <MDEditor
                value={generatedPlan}
                onChange={(value) => setGeneratedPlan(value || '')}
                preview="edit"
                height={800}
                previewOptions={{
                  rehypePlugins: [[rehypeSanitize]],
                }}
                visibleDragbar={false}
              />
            </div>
          </CardContent>
        </Card>
      )}
       {isLoading && !generatedPlan && ( 
        <div className="text-center py-10">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">AI is crafting your lesson plan, this may take a moment...</p>
        </div>
      )}
    </div>
  );
}

// Local Zod import for form validation
import { z } from 'zod';
