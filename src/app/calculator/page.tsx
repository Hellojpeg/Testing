
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator as CalculatorIcon, Delete, Sigma } from 'lucide-react'; // Using Sigma for Advanced Mode
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const CalculatorPage = () => {
  const [currentOperand, setCurrentOperand] = useState<string>('0');
  const [previousOperand, setPreviousOperand] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState<boolean>(true);
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);

  const formatOperand = (operand: string | null) => {
    if (operand == null) return '';
    if (operand === "Error") return "Error";
    if (operand === "NaN") return "Error"; // Handle NaN specifically
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
        if (currentOperand.replace(/[-.]/g, '').length >= 15 && number !== '.') return; // Allow negative sign
        setCurrentOperand(prev => `${prev}${number}`);
      }
    }
  }, [currentOperand, overwrite]);

  const processScientific = (sciOperation: string) => {
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
        result = Math.sin(val * Math.PI / 180); // Degrees to Radians
        break;
      case 'cos':
        result = Math.cos(val * Math.PI / 180); // Degrees to Radians
        break;
      case 'tan':
        // Handle tan(90), tan(270), etc.
        if (val % 180 === 90) { setCurrentOperand("Error"); setOverwrite(true); return;}
        result = Math.tan(val * Math.PI / 180); // Degrees to Radians
        break;
      case 'log': // base 10
        if (val <= 0) { setCurrentOperand("Error"); setOverwrite(true); return; }
        result = Math.log10(val);
        break;
      case 'ln': // natural log
        if (val <= 0) { setCurrentOperand("Error"); setOverwrite(true); return; }
        result = Math.log(val);
        break;
      default:
        return; // Should not happen
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
  };


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
      case '^': // x^y
        computation = Math.pow(prev, current);
        break;
      default:
        return;
    }
    
    const resultString = computation.toString();
    if (resultString.includes('.')) {
        const decimalIndex = resultString.indexOf('.');
        if (resultString.length - decimalIndex - 1 > 8) { // Max 8 decimal places
            computation = parseFloat(computation.toFixed(8));
        }
    } else if (Math.abs(computation) > 1e15) { // Handle very large numbers with scientific notation
        computation = parseFloat(computation.toExponential(8));
    }
    
    setCurrentOperand(computation.toString());
    setOperation(null);
    setPreviousOperand(null); 
    setOverwrite(true);
  }, [previousOperand, currentOperand, operation]);

  const chooseOperation = useCallback((selectedOperation: string) => {
    if (currentOperand === "Error" || currentOperand === "NaN") {
      clear(); // Clear error before starting new operation
      // If currentOperand was Error, it might become '0' after clear().
      // We still want to allow setting an operation if previousOperand is already set from before the error.
      // So, allow proceeding if previousOperand exists, otherwise return if current is '0'.
      if (previousOperand == null && currentOperand === '0') return;
    }
    // If currentOperand is '0' and there's no previous calculation pending, don't set operation unless it's '-' for negative numbers
    if (currentOperand === '0' && previousOperand == null && selectedOperation !== '-') return;


    if (previousOperand != null && operation != null && !overwrite) {
      compute(); 
      // After compute, currentOperand holds the result. This result becomes the new previousOperand.
      // We use functional update for setCurrentOperand after compute.
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
    // This effect is to ensure chooseOperation is updated if compute changes.
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

  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <CalculatorIcon className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Calculator
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Perform calculations with ease. Toggle Advanced Mode for scientific functions.
        </p>
      </section>

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
    </div>
  );
};

export default CalculatorPage;
