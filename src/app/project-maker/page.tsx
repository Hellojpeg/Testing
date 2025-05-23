
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { GeneratePmdInput } from '@/lib/schemas/pmd'; // Updated import path
import { GeneratePmdInputSchema } from '@/lib/schemas/pmd'; // Updated import path
import { fetchPmdAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { ClipboardEdit, FileText, Download, Sparkles } from 'lucide-react';

export default function ProjectMakerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [pmdContent, setPmdContent] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<GeneratePmdInput>({
    resolver: zodResolver(GeneratePmdInputSchema),
    defaultValues: {
      industry: '',
      projectTitle: '',
      projectGoal: '',
      projectScope: '',
      keyStakeholders: '',
      timeline: '',
      budget: '',
      knownRisks: '',
      successMetrics: '',
      additionalInfo: '',
    },
  });

  const onSubmit = async (data: GeneratePmdInput) => {
    setIsLoading(true);
    setPmdContent(null);
    try {
      const result = await fetchPmdAction(data);
      if (result.pmdContent) {
        setPmdContent(result.pmdContent);
        toast({
          title: 'PMD Generated!',
          description: 'Your Project Management Document is ready.',
        });
      } else {
        toast({
          title: 'Generation Failed',
          description: 'Could not generate the PMD. Please check your inputs or try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to generate PMD:', error);
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
    if (!pmdContent || !form.getValues('projectTitle')) {
      toast({
        title: 'Cannot Export',
        description: 'No PMD content to export or project title is missing.',
        variant: 'destructive',
      });
      return;
    }
    const filename = `${form.getValues('projectTitle').replace(/\s+/g, '_')}_PMD.md`;
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

  return (
    <div className="space-y-12">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <ClipboardEdit className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          AI Project Document Creator
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Fill in your project details below, and our AI will help you craft a comprehensive Project Management Document.
        </p>
      </section>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-md border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                Project Details
              </CardTitle>
              <CardDescription>
                Provide as much detail as possible for a more comprehensive PMD. Fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="projectTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., New Mobile App Development" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Technology, Healthcare, Finance" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="projectGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Project Goal *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the main objective of this project." {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectScope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Scope (Inclusions & Exclusions) *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detail what the project will and will not include." {...field} rows={5}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keyStakeholders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Stakeholders & Roles *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., CEO - Project Sponsor, Marketing Lead - User Acquisition" {...field} rows={3}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <h3 className="text-lg font-medium pt-4 border-t">Optional Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Timeline / Milestones</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Q1: Design, Q2: Development" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Budget / Resources</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., $100,000 or 5 Developers" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="knownRisks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Known Risks / Challenges</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List potential risks like 'Market competition' or 'Technical debt'." {...field} rows={3}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="successMetrics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Success Metrics / KPIs</FormLabel>
                    <FormControl>
                      <Textarea placeholder="How will project success be measured? e.g., 'Achieve 10k active users in 6 months'." {...field} rows={3}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information or Sections</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any other details or specific sections you want in the PMD." {...field} rows={3}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button size="lg" type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? <Spinner size="sm" className="mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />}
                {isLoading ? 'Generating Document...' : 'Generate PMD'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {isLoading && !pmdContent && (
        <div className="text-center py-10">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">AI is drafting your PMD, please wait...</p>
        </div>
      )}

      {pmdContent && (
        <Card className="shadow-md border">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Generated Project Management Document</CardTitle>
              <CardDescription>Review the generated PMD below. You can copy the text or export it as a Markdown file.</CardDescription>
            </div>
            <Button onClick={handleExport} variant="outline" size="lg" disabled={!pmdContent}>
              <Download className="mr-2 h-5 w-5" />
              Export as .md
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={pmdContent}
              className="min-h-[500px] text-sm bg-muted/30 whitespace-pre-wrap font-mono"
              rows={30}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
