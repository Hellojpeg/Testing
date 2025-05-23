
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function DealOutPage() {
  const [isLoadingAiAction, setIsLoadingAiAction] = useState(false);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: `
      <h2>Hi there,</h2>
      <p>this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:</p>
      <ul>
        <li>That’s a bullet list with one …</li>
        <li>… or two list items.</li>
      </ul>
      <p>Isn't that great? And all of that is editable. But wait, there’s more. Let’s try a code block:</p>
      <pre><code class="language-css">body {
  display: none;
}</code></pre>
      <p>I know, I know, this is impressive. It’s …</p>
      <blockquote>… what you see is what you get.</blockquote>
      <p>But that’s not all. The editor is focusable directly via the component instance.</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none p-4 border border-input rounded-md min-h-[400px] bg-card text-card-foreground shadow-sm w-full overflow-auto',
      },
    },
  });

  const handleAiAction = async () => {
    if (!editor) {
      toast({
        title: 'Editor Not Ready',
        description: 'The editor is not yet available. Please wait a moment and try again.',
        variant: 'destructive',
      });
      return;
    }

    const content = editor.getHTML(); // or editor.getJSON() for structured data

    if (editor.isEmpty) {
      toast({
        title: 'No Content',
        description: 'Please write something in the editor before using AI actions.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingAiAction(true);
    // Placeholder for AI action
    // In a real scenario, you'd call a Genkit flow here:
    // e.g., const result = await yourAiRefinementFlow({ htmlContent: content });
    // editor.commands.setContent(result.refinedHtmlContent);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing
    
    // Example: Appending a note to the content. 
    // For real refinement, you'd likely replace or selectively update.
    editor.commands.insertContentAt(editor.state.doc.content.size, '<p>[AI Refinement Applied - Placeholder]</p>');

    toast({
      title: 'AI Action Complete',
      description: 'Content has been processed (placeholder action).',
    });
    setIsLoadingAiAction(false);
  };

  return (
    <div className="space-y-12">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <Edit className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Deal Out - AI Word Editor
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Craft, refine, and compose with AI assistance. Your next-gen word processing experience.
        </p>
      </section>

      <Card className="shadow-md border">
        <CardHeader>
          <CardTitle className="text-2xl">Editor</CardTitle>
          <CardDescription>
            Start writing your document below. Use the AI tools to enhance your content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Placeholder for Tiptap Toolbar if you add one */}
          {/* <div className="flex space-x-2 border-b pb-2 mb-2">...toolbar buttons...</div> */}
          
          <div className="w-full">
            <EditorContent editor={editor} />
          </div>
          
          <Button onClick={handleAiAction} disabled={isLoadingAiAction || !editor?.isEditable}>
            {isLoadingAiAction ? <Spinner size="sm" className="mr-2" /> : <Zap className="mr-2 h-4 w-4" />}
            {isLoadingAiAction ? 'Processing...' : 'AI Refine (Placeholder)'}
          </Button>
        </CardContent>
      </Card>

      {/* Future sections for AI tools, right-click menus, block notes etc. can be added here */}
    </div>
  );
}
