
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator as CalculatorIcon, Delete, Sigma, BarChart3, AlertTriangle } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const CalculatorPage = () => {
  const [currentOperand, setCurrentOperand] = useState<string>('0');
  const [previousOperand, setPreviousOperand] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState<boolean>(true);
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState('calculator');
  const [equation, setEquation] = useState('x*x'); // Default equation
  const [graphData, setGraphData] = useState<Array<{x: number, y: number | null }>>([]);
  const [xMin, setXMin] = useState('-10');
  const [xMax, setXMax] = useState('10');
  const [plotError, setPlotError] = useState<string | null>(null);


  const formatOperand = (operand: string | null) => {
    if (operand == null) return '';
    if (operand === "Error") return "Error";
    if (operand === "NaN") return "Error"; 
    const stringOperand = operand.toString();
    const [integerPart, decimalPart] = stringOperand.split('.');
    
    let integerDisplay;
    if (isNaN(parseFloat(integerPart))) {
      integerDisplay = '';
    } else {
      integerDisplay = parseFloat(integerPart).toLocaleString('en', { maximumFractionDigits: 0 });
    }

    if (decimalPart != null) {
      return `${integerDisplay}.${decimalPart}`;
    }
    return integerDisplay;
  };
  
  const displayValue = formatOperand(currentOperand);
  const prevDisplayValue = previousOperand != null ? `${formatOperand(previousOperand)} ${operation || ''}` : '';


  const clear = useCallback(() => {
    setCurrentOperand('0');
    setPreviousOperand(null);
    setOperation(null);
    setOverwrite(true);
  }, []);

  const deleteDigit = useCallback(() => {
    if (currentOperand === "Error" || currentOperand === "NaN") {
      clear();
      return;
    }
    if (overwrite && currentOperand !== '0') { 
       setCurrentOperand('0');
       setOverwrite(true);
       return;
    }
    if (currentOperand === '0' || currentOperand.length === 1) {
      setCurrentOperand('0');
      setOverwrite(true);
      return;
    }
    setCurrentOperand(currentOperand.slice(0, -1));
  }, [currentOperand, overwrite, clear]);

  const appendNumber = useCallback((number: string) => {
    if (currentOperand === "Error" || currentOperand === "NaN") {
       setCurrentOperand(number === '.' ? '0.' : number);
       setOverwrite(false);
       return;
    }
    if (number === '.' && currentOperand.includes('.')) return;
    
    if (overwrite) {
      setCurrentOperand(number === '.' ? '0.' : number);
      setOverwrite(false);
    } else {
      if (currentOperand === '0' && number !== '.') {
        setCurrentOperand(number);
      } else {
        if (currentOperand.replace(/[-.]/g, '').length >= 15 && number !== '.') return; 
        setCurrentOperand(prev => `${prev}${number}`);
      }
    }
  }, [currentOperand, overwrite]);

  const processScientific = useCallback((sciOperation: string) => {
    if (currentOperand === "Error" || currentOperand === "NaN") return;
    let val = parseFloat(currentOperand);
    if (isNaN(val)) {
      setCurrentOperand("Error");
      setOverwrite(true);
      return;
    }
    let result: number | undefined;

    switch(sciOperation) {
      case 'sqrt':
        if (val < 0) { setCurrentOperand("Error"); setOverwrite(true); return; }
        result = Math.sqrt(val);
        break;
      case 'x²':
        result = Math.pow(val, 2);
        break;
      case 'sin':
        result = Math.sin(val * Math.PI / 180); 
        break;
      case 'cos':
        result = Math.cos(val * Math.PI / 180); 
        break;
      case 'tan':
        if (val % 180 === 90) { setCurrentOperand("Error"); setOverwrite(true); return;}
        result = Math.tan(val * Math.PI / 180); 
        break;
      case 'log': 
        if (val <= 0) { setCurrentOperand("Error"); setOverwrite(true); return; }
        result = Math.log10(val);
        break;
      case 'ln': 
        if (val <= 0) { setCurrentOperand("Error"); setOverwrite(true); return; }
        result = Math.log(val);
        break;
      default:
        return; 
    }

    if (result === undefined || isNaN(result) || !isFinite(result)) {
        setCurrentOperand("Error");
    } else {
        const resultString = result.toString();
        if (resultString.includes('.') && resultString.length - resultString.indexOf('.') - 1 > 8) {
            result = parseFloat(result.toFixed(8));
        }
        setCurrentOperand(result.toString());
    }
    setOverwrite(true);
  }, [currentOperand]);


  const compute = useCallback(() => {
    if (previousOperand == null || operation == null || currentOperand == null || currentOperand === "Error" || currentOperand === "NaN") {
      return;
    }

    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);

    if (isNaN(prev) || isNaN(current)) {
      setCurrentOperand("Error");
      setPreviousOperand(null);
      setOperation(null);
      setOverwrite(true);
      return;
    }

    let computation: number = 0;
    switch (operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        computation = prev - current;
        break;
      case '×':
        computation = prev * current;
        break;
      case '÷':
        if (current === 0) {
          setCurrentOperand("Error");
          setPreviousOperand(null);
          setOperation(null);
          setOverwrite(true);
          return;
        }
        computation = prev / current;
        break;
      case '^': 
        computation = Math.pow(prev, current);
        break;
      default:
        return;
    }
    
    const resultString = computation.toString();
    if (resultString.includes('.')) {
        const decimalIndex = resultString.indexOf('.');
        if (resultString.length - decimalIndex - 1 > 8) { 
            computation = parseFloat(computation.toFixed(8));
        }
    } else if (Math.abs(computation) > 1e15) { 
        computation = parseFloat(computation.toExponential(8));
    }
    
    setCurrentOperand(computation.toString());
    setOperation(null);
    setPreviousOperand(null); 
    setOverwrite(true);
  }, [previousOperand, currentOperand, operation]);

  const chooseOperation = useCallback((selectedOperation: string) => {
    if (currentOperand === "Error" || currentOperand === "NaN") {
      clear(); 
      if (previousOperand == null && currentOperand === '0') return;
    }
    if (currentOperand === '0' && previousOperand == null && selectedOperation !== '-') return;

    if (previousOperand != null && operation != null && !overwrite) {
      compute(); 
      setCurrentOperand(currentResult => {
         setPreviousOperand(currentResult); 
         setOperation(selectedOperation);
         setOverwrite(true);
         return currentResult; 
      });
    } else {
      setPreviousOperand(currentOperand);
      setOperation(selectedOperation);
      setOverwrite(true);
    }
  }, [currentOperand, previousOperand, operation, overwrite, clear, compute]);

  useEffect(() => {
  }, [compute]);

  const baseButtons = [
    { label: 'AC', type: 'action', action: clear, className: 'col-span-2 bg-destructive hover:bg-destructive/90 text-primary-foreground' },
    { label: 'DEL', type: 'action', action: deleteDigit, className: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground' },
    { label: '÷', type: 'operator', action: () => chooseOperation('÷') },
    { label: '7', type: 'number', action: () => appendNumber('7') },
    { label: '8', type: 'number', action: () => appendNumber('8') },
    { label: '9', type: 'number', action: () => appendNumber('9') },
    { label: '×', type: 'operator', action: () => chooseOperation('×') },
    { label: '4', type: 'number', action: () => appendNumber('4') },
    { label: '5', type: 'number', action: () => appendNumber('5') },
    { label: '6', type: 'number', action: () => appendNumber('6') },
    { label: '-', type: 'operator', action: () => chooseOperation('-') },
    { label: '1', type: 'number', action: () => appendNumber('1') },
    { label: '2', type: 'number', action: () => appendNumber('2') },
    { label: '3', type: 'number', action: () => appendNumber('3') },
    { label: '+', type: 'operator', action: () => chooseOperation('+') },
    { label: '0', type: 'number', action: () => appendNumber('0'), className: 'col-span-2' },
    { label: '.', type: 'number', action: () => appendNumber('.') },
    { label: '=', type: 'action', action: compute, className: 'bg-primary hover:bg-primary/90 text-primary-foreground' },
  ];

  const advancedButtonsTopRow = [
    { label: 'sin', type: 'scientific', action: () => processScientific('sin') },
    { label: 'cos', type: 'scientific', action: () => processScientific('cos') },
    { label: 'tan', type: 'scientific', action: () => processScientific('tan') },
    { label: 'xʸ', type: 'operator', action: () => chooseOperation('^') },
  ];
  const advancedButtonsBottomRow = [
    { label: 'log', type: 'scientific', action: () => processScientific('log') },
    { label: 'ln', type: 'scientific', action: () => processScientific('ln') },
    { label: '√', type: 'scientific', action: () => processScientific('sqrt') },
    { label: 'x²', type: 'scientific', action: () => processScientific('x²') },
  ];

  const handlePlot = useCallback(() => {
    setPlotError(null);
    const data: Array<{x: number, y: number | null}> = [];
    const numXMin = parseFloat(xMin);
    const numXMax = parseFloat(xMax);

    if (isNaN(numXMin) || isNaN(numXMax) || numXMin >= numXMax) {
      setPlotError("Invalid X-min or X-max values. Ensure X-min is less than X-max and they are numbers.");
      setGraphData([]);
      return;
    }

    if (!equation.trim()) {
        setPlotError("Please enter an equation.");
        setGraphData([]);
        return;
    }

    let func: (x: number) => number | null;
    try {
      // Basic sanitization (very limited for prototype - NOT FOR PRODUCTION)
      // A proper math parser/evaluator is needed for robustness and security.
      const allowedChars = /^[x\d\s.()+\-*/^%MathsqrtpowcotalgexpPIEsincoanE]+$/gi;
      if (!allowedChars.test(equation)) {
          setPlotError("Equation contains invalid characters.");
          setGraphData([]);
          return;
      }
      
      // Replace ^ with ** for power, be careful with order if supporting Math.pow
      const jsEquation = equation.replace(/\^/g, '**');

      func = new Function('x', `
        const { sin, cos, tan, sqrt, pow, log, exp, PI, E } = Math;
        try {
          let result = ${jsEquation};
          return Number.isFinite(result) ? result : null;
        } catch (e) {
          console.error("Evaluation error for x=" + x + ":", e);
          return null; 
        }
      `) as (x: number) => number | null;
    } catch (e) {
      setPlotError("Invalid equation syntax. Please check your function.");
      setGraphData([]);
      console.error("Equation compilation error:", e);
      return;
    }

    const points = 100; 
    const step = (numXMax - numXMin) / (points -1);

    for (let i = 0; i < points; i++) {
      const xVal = numXMin + i * step;
      let yVal: number | null = null;
      try {
        yVal = func(xVal);
         if (yVal !== null && !Number.isFinite(yVal)) { 
            yVal = null;
        }
      } catch (e) {
        yVal = null; 
      }
      data.push({ x: parseFloat(xVal.toFixed(3)), y: yVal === null ? null : parseFloat(yVal.toFixed(3)) });
    }
    setGraphData(data);
  }, [equation, xMin, xMax]);

  useEffect(() => {
    if (activeTab === 'graphing') {
        handlePlot(); // Plot default or current equation when switching to graphing tab
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); // Re-plot if tab changes to graphing, handlePlot has its own deps

  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <CalculatorIcon className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Multi-Function Calculator
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Perform calculations, use scientific functions, or plot graphs.
        </p>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="calculator">
            <CalculatorIcon className="mr-2 h-5 w-5" /> Calculator
          </TabsTrigger>
          <TabsTrigger value="graphing">
            <BarChart3 className="mr-2 h-5 w-5" /> Graphing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Switch
              id="advanced-mode-switch"
              checked={advancedMode}
              onCheckedChange={setAdvancedMode}
              aria-label="Toggle Advanced Mode"
            />
            <Label htmlFor="advanced-mode-switch" className="text-base flex items-center gap-2">
              <Sigma className="h-5 w-5" /> Advanced Mode
            </Label>
          </div>

          <Card className="max-w-xs sm:max-w-md mx-auto shadow-2xl border rounded-lg overflow-hidden">
            <CardContent className="p-0">
              <div 
                className="bg-muted text-right p-4 sm:p-6 break-all min-h-[96px] sm:min-h-[120px] flex flex-col justify-end items-end rounded-t-lg"
                aria-live="polite"
                role="region"
                aria-label="Calculator display"
              >
                <div className="text-muted-foreground text-lg sm:text-xl h-6 sm:h-7 truncate">
                  {prevDisplayValue}
                </div>
                <div className="text-foreground text-3xl sm:text-5xl font-bold">
                  {displayValue}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-px bg-border">
                {advancedMode && (
                  <>
                    {advancedButtonsTopRow.map((btn) => (
                      <Button
                        key={btn.label}
                        onClick={btn.action}
                        variant={'outline'} 
                        className={`
                          text-lg sm:text-xl h-14 sm:h-16 rounded-none border-0 focus:z-10
                          focus:ring-2 focus:ring-ring focus:ring-offset-1
                          transition-colors duration-150 ease-in-out 
                          bg-accent/60 hover:bg-accent/80 text-accent-foreground font-medium
                          ${btn.className || ''}
                        `}
                        aria-label={btn.label}
                      >
                        {btn.label}
                      </Button>
                    ))}
                    {advancedButtonsBottomRow.map((btn) => (
                      <Button
                        key={btn.label}
                        onClick={btn.action}
                        variant={'outline'} 
                        className={`
                          text-lg sm:text-xl h-14 sm:h-16 rounded-none border-0 focus:z-10
                          focus:ring-2 focus:ring-ring focus:ring-offset-1
                          transition-colors duration-150 ease-in-out 
                          bg-accent/60 hover:bg-accent/80 text-accent-foreground font-medium
                          ${btn.className || ''}
                        `}
                        aria-label={btn.label}
                      >
                        {btn.label}
                      </Button>
                    ))}
                  </>
                )}
                {baseButtons.map((btn) => (
                  <Button
                    key={btn.label}
                    onClick={btn.action}
                    variant={'outline'} 
                    className={`
                      text-xl sm:text-2xl h-16 sm:h-20 rounded-none border-0 focus:z-10
                      focus:ring-2 focus:ring-ring focus:ring-offset-1
                      transition-colors duration-150 ease-in-out 
                      ${btn.className || ''}
                      ${btn.type === 'number' || btn.label === '.' ? 'bg-card hover:bg-muted text-card-foreground' : ''}
                      ${btn.type === 'operator' && !btn.className?.includes('bg-') ? 'bg-accent hover:bg-accent/80 text-accent-foreground font-semibold' : ''}
                      ${(btn.label === 'AC' || btn.label === '=') && !btn.className?.includes('text-') ? 'text-primary-foreground' : ''}
                      ${(btn.label === 'DEL') && !btn.className?.includes('text-') ? 'text-secondary-foreground' : ''}
                    `}
                    aria-label={
                        btn.label === 'AC' ? 'All Clear' 
                      : btn.label === 'DEL' ? 'Delete' 
                      : btn.label === '×' ? 'Multiply' 
                      : btn.label === '÷' ? 'Divide' 
                      : btn.label === '+' ? 'Add'
                      : btn.label === '-' ? 'Subtract'
                      : btn.label === '=' ? 'Equals'
                      : btn.label === '.' ? 'Decimal'
                      : btn.label === 'xʸ' ? 'Power'
                      : `Number ${btn.label}`
                    }
                  >
                    {btn.label === 'DEL' ? <Delete className="h-5 w-5 sm:h-6 sm:w-6" /> : btn.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graphing">
          <Card className="shadow-xl border rounded-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Function Plotter
              </CardTitle>
              <CardDescription>
                Enter a function of x (e.g., <code className="bg-muted px-1 py-0.5 rounded text-xs">x*x - 2*x + 1</code> or <code className="bg-muted px-1 py-0.5 rounded text-xs">Math.sin(x)</code>).
                Uses JavaScript syntax. See note below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {plotError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Plotting Error</AlertTitle>
                  <AlertDescription>{plotError}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="sm:col-span-2">
                  <Label htmlFor="equation">Equation y = f(x)</Label>
                  <Input
                    id="equation"
                    value={equation}
                    onChange={(e) => setEquation(e.target.value)}
                    placeholder="e.g., x**2 or Math.sin(x/2)"
                    className="mt-1"
                  />
                </div>
                <Button onClick={handlePlot} className="w-full sm:w-auto">
                  <BarChart3 className="mr-2 h-4 w-4" /> Plot Function
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="xMin">X Min</Label>
                  <Input
                    id="xMin"
                    type="text" 
                    value={xMin}
                    onChange={(e) => setXMin(e.target.value)}
                    placeholder="-10"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="xMax">X Max</Label>
                  <Input
                    id="xMax"
                    type="text"
                    value={xMax}
                    onChange={(e) => setXMax(e.target.value)}
                    placeholder="10"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="h-[400px] w-full bg-muted/30 p-2 sm:p-4 rounded-md border shadow-inner">
                {graphData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={graphData.filter(p => p.y !== null)}
                      margin={{ top: 5, right: 20, left: -25, bottom: 5 }} 
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="x"
                        type="number"
                        stroke="hsl(var(--foreground))"
                        tickFormatter={(val) => val.toFixed(val % 1 === 0 ? 0 : 1)} // Simpler tick format
                        domain={['dataMin', 'dataMax']}
                        interval="preserveStartEnd" // Attempt to show min/max ticks
                        tickCount={7} // Suggest number of ticks
                      />
                      <YAxis
                        stroke="hsl(var(--foreground))"
                        tickFormatter={(val) => val.toFixed(val % 1 === 0 ? 0 : 1)}
                        domain={['auto', 'auto']} 
                        allowDataOverflow={false} // Prevent y-axis from expanding too much for extreme values
                        scale="linear" // Ensure linear scale
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                          boxShadow: 'hsl(var(--shadow))',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                        itemStyle={{ color: 'hsl(var(--primary))' }}
                        formatter={(value: number, name: string) => [value.toFixed(3), name]}
                        labelFormatter={(label: number) => `x: ${label.toFixed(3)}`}
                      />
                      <Legend wrapperStyle={{ color: 'hsl(var(--foreground))', paddingTop: '10px' }}/>
                      <Line
                        type="monotone"
                        dataKey="y"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={false} 
                        name="f(x)"
                        isAnimationActive={false} // Disable animation for faster rendering
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-center">
                      {plotError ? "Cannot render graph due to error." : "Enter an equation (e.g., x**2 - 1) and set X-range, then click 'Plot Function'."}
                    </p>
                  </div>
                )}
              </div>
               <Alert variant="default" className="mt-4 text-xs sm:text-sm">
                  <AlertTriangle className="h-4 w-4"/>
                  <AlertTitle className="text-sm sm:text-base">Graphing Tips</AlertTitle>
                  <AlertDescription>
                    Use JavaScript's <code className="font-mono text-xs bg-muted px-1 rounded">Math</code> object: <code className="font-mono text-xs bg-muted px-1 rounded">Math.sin(x)</code>, <code className="font-mono text-xs bg-muted px-1 rounded">Math.cos(x)</code>, <code className="font-mono text-xs bg-muted px-1 rounded">Math.pow(base, exp)</code>, <code className="font-mono text-xs bg-muted px-1 rounded">Math.sqrt(x)</code>, <code className="font-mono text-xs bg-muted px-1 rounded">Math.log(x)</code> (natural), <code className="font-mono text-xs bg-muted px-1 rounded">Math.exp(x)</code>. Constants: <code className="font-mono text-xs bg-muted px-1 rounded">Math.PI</code>, <code className="font-mono text-xs bg-muted px-1 rounded">Math.E</code>.
                    <br/>
                    Use <code className="font-mono text-xs bg-muted px-1 rounded">**</code> for power (e.g. <code className="font-mono text-xs bg-muted px-1 rounded">x**2</code> for x²). Basic input sanitization is applied. Complex or invalid syntax may cause errors.
                  </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalculatorPage;


    