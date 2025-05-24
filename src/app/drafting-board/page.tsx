
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Eraser, PenTool, RectangleHorizontal, Palette, DraftingCompass, MousePointer2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

type Tool = 'select' | 'line' | 'rectangle';

interface Point {
  x: number;
  y: number;
}

interface Shape {
  id: string;
  type: 'line' | 'rectangle';
  points: Point[];
  color: string;
  lineWidth: number;
}

const DEFAULT_COLOR = '#333333'; // Dark Gray
const DEFAULT_LINE_WIDTH = 2;

export default function DraftingBoardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('line');
  const [currentColor, setCurrentColor] = useState(DEFAULT_COLOR);
  const [currentLineWidth, setCurrentLineWidth] = useState(DEFAULT_LINE_WIDTH);
  
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentEndPoint, setCurrentEndPoint] = useState<Point | null>(null); // For preview
  const [shapes, setShapes] = useState<Shape[]>([]); // Store drawn shapes

  const getMousePosition = (event: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const drawShape = useCallback((ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.lineWidth;
    ctx.beginPath();
    if (shape.type === 'line' && shape.points.length >= 2) {
      ctx.moveTo(shape.points[0].x, shape.points[0].y);
      ctx.lineTo(shape.points[1].x, shape.points[1].y);
    } else if (shape.type === 'rectangle' && shape.points.length >= 2) {
      const start = shape.points[0];
      const end = shape.points[1];
      ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
    }
    ctx.stroke();
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    ctx.fillStyle = 'hsl(var(--card))'; // Match card background
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    shapes.forEach(shape => drawShape(ctx, shape));

    // Draw preview of current shape
    if (isDrawing && startPoint && currentEndPoint) {
        const previewShape: Shape = {
            id: 'preview',
            type: currentTool === 'line' ? 'line' : 'rectangle',
            points: [startPoint, currentEndPoint],
            color: currentColor,
            lineWidth: currentLineWidth,
        };
        drawShape(ctx, previewShape);
    }

  }, [shapes, isDrawing, startPoint, currentEndPoint, currentColor, currentLineWidth, currentTool, drawShape]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Set canvas size based on parent, adapt on resize
    const resizeCanvas = () => {
        if (canvas.parentElement) {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
            redrawCanvas();
        }
    };
    resizeCanvas(); // Initial size
    
    const debouncedResize = setTimeout(resizeCanvas, 100); // Debounce resize
    window.addEventListener('resize', () => {
        clearTimeout(debouncedResize);
        setTimeout(resizeCanvas,100);
    });

    redrawCanvas(); // Initial draw

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(debouncedResize);
    }
  }, [redrawCanvas]);


  useEffect(() => {
    redrawCanvas();
  }, [shapes, redrawCanvas]);


  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'select') return;
    setIsDrawing(true);
    const pos = getMousePosition(event);
    setStartPoint(pos);
    setCurrentEndPoint(pos); // Initialize endpoint for preview
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || currentTool === 'select') return;
    const pos = getMousePosition(event);
    setCurrentEndPoint(pos);
    redrawCanvas(); // Redraw with preview
  };

  const handleMouseUp = () => {
    if (!isDrawing || !startPoint || !currentEndPoint || currentTool === 'select') {
        setIsDrawing(false);
        setStartPoint(null);
        setCurrentEndPoint(null);
        return;
    }

    const newShape: Shape = {
      id: `shape-${Date.now()}`,
      type: currentTool === 'line' ? 'line' : 'rectangle',
      points: [startPoint, currentEndPoint],
      color: currentColor,
      lineWidth: currentLineWidth,
    };
    setShapes(prevShapes => [...prevShapes, newShape]);

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentEndPoint(null);
  };

  const handleMouseLeave = () => {
    // Optional: if you want to cancel drawing if mouse leaves canvas while drawing
    // if (isDrawing) {
    //   setIsDrawing(false);
    //   setStartPoint(null);
    //   setCurrentEndPoint(null);
    //   redrawCanvas(); // Clear any preview
    // }
  };

  const clearCanvas = () => {
    setShapes([]);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'hsl(var(--card))';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleUndo = () => {
    setShapes(prevShapes => prevShapes.slice(0, -1));
  };

  return (
    <div className="space-y-8 flex flex-col h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)]">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <DraftingCompass className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-primary mb-3 sm:mb-4" />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2 sm:mb-3">
          2D Drafting Board
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          A simple tool for creating 2D architectural plans. Select a tool, customize your stroke, and start drawing.
        </p>
      </section>

      <Card className="shadow-md border flex-grow flex flex-col overflow-hidden">
        <CardHeader className="p-3 sm:p-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              {/* Tool Selection */}
              <Button
                variant={currentTool === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentTool('line')}
                className="px-2 sm:px-3"
              >
                <PenTool className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-1.5" />
                <span className="hidden sm:inline">Line</span>
              </Button>
              <Button
                variant={currentTool === 'rectangle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentTool('rectangle')}
                className="px-2 sm:px-3"
              >
                <RectangleHorizontal className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-1.5" />
                 <span className="hidden sm:inline">Rectangle</span>
              </Button>
              <div className="h-6 w-px bg-border mx-1 sm:mx-2"></div>
              {/* Color Picker */}
               <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="px-2 sm:px-3">
                    <Palette className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Color</span>
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm border ml-1.5 sm:ml-2" 
                      style={{ backgroundColor: currentColor }}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <Input
                    type="color"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    className="h-8 sm:h-10 w-20 sm:w-24 p-0.5 sm:p-1 border-none"
                  />
                </PopoverContent>
              </Popover>

              {/* Line Width */}
              <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
                <Label htmlFor="lineWidth" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Width:</Label>
                <Slider
                    id="lineWidth"
                    min={1}
                    max={20}
                    step={1}
                    value={[currentLineWidth]}
                    onValueChange={(value) => setCurrentLineWidth(value[0])}
                    className="w-20 sm:w-28"
                />
                <span className="text-xs sm:text-sm text-muted-foreground w-5 sm:w-6 text-right">{currentLineWidth}px</span>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
                <Button variant="outline" size="sm" onClick={handleUndo} disabled={shapes.length === 0} className="px-2 sm:px-3">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-undo sm:mr-1.5 h-4 w-4 sm:h-5 sm:w-5"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                     <span className="hidden sm:inline">Undo</span>
                </Button>
                <Button variant="destructive" size="sm" onClick={clearCanvas} className="px-2 sm:px-3">
                    <Eraser className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Clear</span>
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-grow relative bg-card-foreground/5">
          {/* Canvas takes full available space within CardContent */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave} // Or onMouseOut
            className={cn(
                "cursor-crosshair w-full h-full touch-none",
                currentTool === 'select' && "cursor-default"
            )}
            // Width and height are set by useEffect to fill parent
          />
        </CardContent>
      </Card>
    </div>
  );
}

