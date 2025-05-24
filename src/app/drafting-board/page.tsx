
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Eraser, PenTool, RectangleHorizontal, Palette, DraftingCompass, MousePointer2, Grid3x3, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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
const DEFAULT_GRID_SIZE = 20; // pixels

export default function DraftingBoardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('line');
  const [currentColor, setCurrentColor] = useState(DEFAULT_COLOR);
  const [currentLineWidth, setCurrentLineWidth] = useState(DEFAULT_LINE_WIDTH);
  
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentEndPoint, setCurrentEndPoint] = useState<Point | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);

  const [gridSize, setGridSize] = useState<number>(DEFAULT_GRID_SIZE);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 });

  const getSnappedCoordinates = useCallback((x: number, y: number): Point => {
    if (!snapToGrid || gridSize <= 0) return { x, y };
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    };
  }, [snapToGrid, gridSize]);

  const getMouseCanvasPosition = (event: React.MouseEvent<HTMLCanvasElement> | MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX, clientY;
    if ('clientX' in event) {
        clientX = event.clientX;
        clientY = event.clientY;
    } else { // For touch events if adapted later
        clientX = (event as unknown as TouchEvent).touches[0].clientX;
        clientY = (event as unknown as TouchEvent).touches[0].clientY;
    }
    const rawX = (clientX - rect.left) * scaleX;
    const rawY = (clientY - rect.top) * scaleY;
    return getSnappedCoordinates(rawX, rawY);
  };


  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!showGrid || gridSize <= 0) return;
    ctx.beginPath();
    ctx.strokeStyle = 'hsl(var(--border))'; // Lighter grid lines
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }, [showGrid, gridSize]);


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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'hsl(var(--card))';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx, canvas.width, canvas.height);

    shapes.forEach(shape => drawShape(ctx, shape));

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
  }, [shapes, isDrawing, startPoint, currentEndPoint, currentColor, currentLineWidth, currentTool, drawShape, drawGrid]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
        if (canvas.parentElement) {
            const newWidth = canvas.parentElement.clientWidth;
            const newHeight = canvas.parentElement.clientHeight;
            if (canvas.width !== newWidth || canvas.height !== newHeight) {
                canvas.width = newWidth;
                canvas.height = newHeight;
                redrawCanvas();
            }
        }
    };
    
    resizeCanvas(); 
    
    const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (entry.target === canvas.parentElement) {
                resizeCanvas();
            }
        }
    });

    if (canvas.parentElement) {
        observer.observe(canvas.parentElement);
    }
    
    // Mouse move listener for coordinate display
    const handleGlobalMouseMove = (event: MouseEvent) => {
        const pos = getMouseCanvasPosition(event);
        setMousePosition(pos);
    };
    canvas.addEventListener('mousemove', handleGlobalMouseMove);


    redrawCanvas();

    return () => {
      if (canvas.parentElement) {
        observer.unobserve(canvas.parentElement);
      }
      observer.disconnect();
      canvas.removeEventListener('mousemove', handleGlobalMouseMove);
    }
  }, [redrawCanvas, getMouseCanvasPosition]);


  useEffect(() => {
    redrawCanvas();
  }, [shapes, redrawCanvas, showGrid, snapToGrid, gridSize]); // Redraw if grid settings change


  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'select') return;
    setIsDrawing(true);
    const pos = getMouseCanvasPosition(event);
    setStartPoint(pos);
    setCurrentEndPoint(pos);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMouseCanvasPosition(event); // Get snapped position for display
    setMousePosition(pos);

    if (!isDrawing || !startPoint || currentTool === 'select') return;
    setCurrentEndPoint(pos); // Use snapped position for drawing
    redrawCanvas();
  };

  const handleMouseUp = () => {
    if (!isDrawing || !startPoint || !currentEndPoint || currentTool === 'select') {
        setIsDrawing(false);
        setStartPoint(null);
        setCurrentEndPoint(null);
        return;
    }

    // Prevent creating zero-size shapes if start and end are the same after snapping
    if (startPoint.x === currentEndPoint.x && startPoint.y === currentEndPoint.y) {
        setIsDrawing(false);
        setStartPoint(null);
        setCurrentEndPoint(null);
        redrawCanvas(); // Clear preview
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

  const handleMouseLeave = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setMousePosition({ x: 0, y: 0 }); // Reset display or set to last known
    // if (isDrawing) {
    //   setIsDrawing(false);
    //   setStartPoint(null);
    //   setCurrentEndPoint(null);
    //   redrawCanvas(); 
    // }
  };

  const clearCanvas = () => {
    setShapes([]);
  };

  const handleUndo = () => {
    setShapes(prevShapes => prevShapes.slice(0, -1));
  };

  return (
    <div className="space-y-4 sm:space-y-6 flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)]">
      <section className="text-center py-4 sm:py-6 bg-card shadow-lg rounded-xl border">
        <DraftingCompass className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-primary mb-2 sm:mb-3" />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1 sm:mb-2">
          2D Drafting Board
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm">
          Simple tool for 2D plans. Select a tool, customize, and draw.
        </p>
      </section>

      <Card className="shadow-md border flex-grow flex flex-col overflow-hidden">
        <CardHeader className="p-2 sm:p-3 border-b">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-2">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1">
              {/* Tool Selection */}
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={currentTool === 'line' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentTool('line')}
                            className="px-2"
                        >
                            <PenTool className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="sr-only sm:not-sr-only sm:ml-1.5">Line</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Line Tool</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={currentTool === 'rectangle' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentTool('rectangle')}
                            className="px-2"
                        >
                            <RectangleHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="sr-only sm:not-sr-only sm:ml-1.5">Rect</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Rectangle Tool</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Separator orientation="vertical" className="h-6 mx-1" />
              
              {/* Color Picker */}
               <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="px-2">
                    <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                     <span className="sr-only sm:not-sr-only sm:ml-1.5">Color</span>
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm border ml-1 sm:ml-1.5" 
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
              <div className="flex items-center gap-1 ml-1">
                <Label htmlFor="lineWidth" className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap sr-only sm:not-sr-only">Width:</Label>
                <Slider
                    id="lineWidth"
                    min={1}
                    max={20}
                    step={1}
                    value={[currentLineWidth]}
                    onValueChange={(value) => setCurrentLineWidth(value[0])}
                    className="w-16 sm:w-24"
                />
                <span className="text-xs text-muted-foreground w-5 text-right">{currentLineWidth}px</span>
              </div>
            </div>
            
            <Separator orientation="vertical" className="h-6 mx-1 hidden lg:block" />

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1">
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)} className="px-2">
                                <Grid3x3 className={cn("h-4 w-4 sm:h-5 sm:w-5", !showGrid && "opacity-50")} />
                                <span className="sr-only">Toggle Grid</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{showGrid ? "Hide" : "Show"} Grid</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSnapToGrid(!snapToGrid)} className="px-2" data-state={snapToGrid ? 'on' : 'off'}>
                                {snapToGrid ? <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary"/> : <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5 opacity-50" /> }
                                <span className="sr-only">Toggle Snap</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{snapToGrid ? "Disable" : "Enable"} Snap to Grid</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    <Label htmlFor="gridSizeInput" className="sr-only sm:not-sr-only">Grid:</Label>
                    <Input 
                        id="gridSizeInput"
                        type="number" 
                        value={gridSize} 
                        onChange={(e) => setGridSize(Math.max(5, parseInt(e.target.value,10)) || DEFAULT_GRID_SIZE)} 
                        className="w-12 h-6 p-1 text-xs bg-background"
                        min="5"
                        step="5"
                    />
                    <span className="sr-only sm:not-sr-only">px</span>
                </div>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button variant="outline" size="sm" onClick={handleUndo} disabled={shapes.length === 0} className="px-2">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-undo sm:mr-1 h-4 w-4"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                     <span className="sr-only sm:not-sr-only sm:ml-1">Undo</span>
                </Button>
                <Button variant="destructive" size="sm" onClick={clearCanvas} className="px-2">
                    <Eraser className="h-4 w-4 sm:mr-1" />
                    <span className="sr-only sm:not-sr-only sm:ml-1">Clear</span>
                </Button>
            </div>
          </div>
           <div className="text-xs text-muted-foreground text-center lg:text-right px-2 py-1">
             Coords: ({mousePosition.x.toFixed(0)}, {mousePosition.y.toFixed(0)})
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-grow relative bg-background border-t">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "cursor-crosshair w-full h-full touch-none block", // Added 'block'
                currentTool === 'select' && "cursor-default"
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

    