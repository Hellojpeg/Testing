
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { GeneratePmdInput } from '@/lib/schemas/pmd';
import { GeneratePmdInputSchema } from '@/lib/schemas/pmd';
import { fetchPmdAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label'; // Keep if used, though FormLabel is preferred in Form
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { ClipboardEdit, FileText, Download, Sparkles, ArrowLeft, ArrowRight, Lightbulb, Edit3, RotateCcw, CheckSquare } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const aiFormSteps = [
  {
    id: "basics",
    title: "Project Basics",
    description: "Let's start with the foundational details of your project.",
    fields: ["projectTitle", "industry"] as const,
    icon: <ClipboardEdit className="h-5 w-5" />,
  },
  {
    id: "objective",
    title: "Core Objective",
    description: "What is the primary goal you aim to achieve?",
    fields: ["projectGoal"] as const,
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    id: "scope",
    title: "Scope Definition",
    description: "Detail what the project will and will not include.",
    fields: ["projectScope"] as const,
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    id: "stakeholders",
    title: "Stakeholders",
    description: "Identify the key people involved and their roles.",
    fields: ["keyStakeholders"] as const,
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    id: "timings_finances",
    title: "Timings & Finances (Optional)",
    description: "Outline any estimated timelines or budget considerations.",
    fields: ["timeline", "budget"] as const,
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    id: "risks_success",
    title: "Risks & Success (Optional)",
    description: "Consider potential challenges and how you'll measure success.",
    fields: ["knownRisks", "successMetrics"] as const,
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    id: "final_touches",
    title: "Final Touches (Optional)",
    description: "Add any other relevant information or specific sections.",
    fields: ["additionalInfo"] as const,
    icon: <CheckSquare className="h-5 w-5" />,
  },
];

type CreationMode = 'undecided' | 'ai' | 'manual';

export default function ProjectMakerPage() {
  const [creationMode, setCreationMode] = useState<CreationMode>('undecided');
  const [currentAiFormStep, setCurrentAiFormStep] = useState(0);
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

  const onSubmitAiForm = async (data: GeneratePmdInput) => {
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
          description: result.pmdContent || 'Could not generate the PMD. Please check your inputs or try again.',
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
        description: 'No PMD content to export or project title is missing (if AI generated).',
        variant: 'destructive',
      });
      return;
    }
    const projectTitle = form.getValues('projectTitle') || 'Manual_Project';
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

  const handleSetMode = (mode: CreationMode) => {
    setCreationMode(mode);
    setCurrentAiFormStep(0);
    setPmdContent(null);
    setIsLoading(false);
    if (mode === 'ai') {
      form.reset(); // Reset form for AI mode
    }
  };

  const handleAiFormNext = async () => {
    const currentFields = aiFormSteps[currentAiFormStep].fields;
    const isValid = await form.trigger(currentFields);
    if (isValid) {
      if (currentAiFormStep < aiFormSteps.length - 1) {
        setCurrentAiFormStep(currentAiFormStep + 1);
      }
    } else {
      toast({
        title: "Hold Up!",
        description: "Please fill in all required fields for this step before proceeding.",
        variant: "destructive",
      });
    }
  };

  const handleAiFormPrevious = () => {
    if (currentAiFormStep > 0) {
      setCurrentAiFormStep(currentAiFormStep - 1);
    }
  };

  const progressValue = ((currentAiFormStep + 1) / aiFormSteps.length) * 100;

  const renderAiFormStepContent = () => {
    const stepData = aiFormSteps[currentAiFormStep];
    const fieldsToRender = stepData.fields;

    return (
      <CardContent className="space-y-6 min-h-[300px]">
        {fieldsToRender.includes("projectTitle") && (
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
        )}
        {fieldsToRender.includes("industry") && (
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
        )}
         {fieldsToRender.includes("projectGoal") && (
            <FormField
              control={form.control}
              name="projectGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Project Goal *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the main objective of this project." {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        )}
        {fieldsToRender.includes("projectScope") && (
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
        )}
        {fieldsToRender.includes("keyStakeholders") && (
             <FormField
                control={form.control}
                name="keyStakeholders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Stakeholders & Roles *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., CEO - Project Sponsor, Marketing Lead - User Acquisition" {...field} rows={4}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
        )}
        {fieldsToRender.includes("timeline") && (
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
        )}
        {fieldsToRender.includes("budget") && (
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
        )}
        {fieldsToRender.includes("knownRisks") && (
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
        )}
        {fieldsToRender.includes("successMetrics") && (
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
        )}
        {fieldsToRender.includes("additionalInfo") && (
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
        )}
      </CardContent>
    );
  };

  const pageDescription = creationMode === 'undecided' 
    ? "Choose how you'd like to create your Project Management Document."
    : creationMode === 'ai'
    ? "Follow the steps to provide project details, and our AI will craft a PMD for you."
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
                    {aiFormSteps[currentAiFormStep].icon || <FileText className="h-6 w-6 text-primary" />}
                    {aiFormSteps[currentAiFormStep].title}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleSetMode('undecided')} type="button">
                     <RotateCcw className="mr-2 h-4 w-4" /> Change Method
                  </Button>
                </div>
                <CardDescription>
                  {aiFormSteps[currentAiFormStep].description} Fields marked with * are required.
                  <span className="block text-xs text-muted-foreground mt-1">
                    Step {currentAiFormStep + 1} of {aiFormSteps.length}
                  </span>
                </CardDescription>
                <Progress value={progressValue} className="w-full mt-2 h-2" />
              </CardHeader>
              
              {renderAiFormStepContent()}

              <CardFooter className="flex justify-between border-t pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAiFormPrevious} 
                  disabled={currentAiFormStep === 0 || isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {currentAiFormStep < aiFormSteps.length - 1 ? (
                  <Button 
                    type="button" 
                    onClick={handleAiFormNext} 
                    disabled={isLoading}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="lg" type="submit" disabled={isLoading}>
                    {isLoading ? <Spinner size="sm" className="mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />}
                    {isLoading ? 'Generating Document...' : 'Generate PMD'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}
      
      {isLoading && creationMode === 'ai' && !pmdContent && currentAiFormStep === aiFormSteps.length - 1 && (
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
              <CardDescription>Review the generated PMD. You can copy or export it as Markdown.</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={() => handleSetMode('undecided')} variant="outline" className="w-full sm:w-auto">
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Start New
                </Button>
                <Button onClick={handleExport} variant="default" size="lg" disabled={!pmdContent} className="w-full sm:w-auto">
                    <Download className="mr-2 h-5 w-5" />
                    Export as .md
                </Button>
            </div>
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
    
