
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Zap, Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code, Minus, Undo, Redo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';

const TiptapToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border border-input rounded-t-md bg-card shadow-sm">
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        aria-label="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>

      <div className="h-6 border-l border-border mx-1"></div>

      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 1 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        aria-label="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria-label="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        aria-label="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Toggle>
      
      <div className="h-6 border-l border-border mx-1"></div>

      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Bullet List"
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('blockquote')}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        aria-label="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('codeBlock')}
        onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
        aria-label="Code Block"
      >
        <Code className="h-4 w-4" />
      </Toggle>

      <div className="h-6 border-l border-border mx-1"></div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        aria-label="Horizontal Rule"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <div className="h-6 border-l border-border mx-1"></div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        aria-label="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        aria-label="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};


export default function DealOutPage() {
  const [isLoadingAiAction, setIsLoadingAiAction] = useState(false);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable StarterKit's heading to use the custom one below
      }),
      Heading.configure({ // Configure Heading extension separately to ensure levels are available
        levels: [1, 2, 3],
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
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none p-4 border border-input rounded-b-md min-h-[400px] bg-card text-card-foreground shadow-sm w-full overflow-auto',
      },
    },
  });

  // Cleanup editor instance
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const handleAiAction = async () => {
    if (!editor) {
      toast({
        title: 'Editor Not Ready',
        description: 'The editor is not yet available. Please wait a moment and try again.',
        variant: 'destructive',
      });
      return;
    }

    const content = editor.getHTML(); 

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
          <TiptapToolbar editor={editor} />
          <div className="w-full">
            <EditorContent editor={editor} />
          </div>
          
          <Button onClick={handleAiAction} disabled={isLoadingAiAction || !editor?.isEditable}>
            {isLoadingAiAction ? <Spinner size="sm" className="mr-2" /> : <Zap className="mr-2 h-4 w-4" />}
            {isLoadingAiAction ? 'Processing...' : 'AI Refine (Placeholder)'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
