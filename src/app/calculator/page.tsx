
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator as CalculatorIcon, Delete } from 'lucide-react'; // Using Delete for backspace

const CalculatorPage = () => {
  const [currentOperand, setCurrentOperand] = useState<string>('0');
  const [previousOperand, setPreviousOperand] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState<boolean>(true); // If true, next number input overwrites currentOperand

  const formatOperand = (operand: string | null) => {
    if (operand == null) return '';
    if (operand === "Error") return "Error";
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
    if (currentOperand === "Error") {
      clear();
      return;
    }
    if (overwrite && currentOperand !== '0') { // Allow deleting result if it's not '0'
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
    if (currentOperand === "Error") {
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
        // Limit total length to prevent overflow, e.g., 15 digits
        if (currentOperand.replace('.', '').length >= 15 && number !== '.') return;
        setCurrentOperand(prev => `${prev}${number}`);
      }
    }
  }, [currentOperand, overwrite]);

  const chooseOperation = useCallback((selectedOperation: string) => {
    if (currentOperand === "Error") {
      clear();
      return;
    }
    if (currentOperand === '0' && previousOperand == null) return;

    if (previousOperand != null && operation != null && !overwrite) {
      compute(); 
      // After compute, currentOperand holds the result.
      // This result needs to become previousOperand for the *new* operation.
      // The 'compute' function sets 'overwrite' to true.
      // We need to update previousOperand with what *was* currentOperand (the result).
      // This needs to be handled carefully: compute() will update currentOperand.
      // So, when compute() finishes, the value in currentOperand IS the result.
      // This value should become the new previousOperand.
      
      // This logic is tricky. The 'compute' function updates currentOperand.
      // If compute runs, then currentOperand (the result) becomes previousOperand.
      // If compute *doesn't* run (because !overwrite was false, or previousOperand was null),
      // then the *current* currentOperand becomes previousOperand.
      
      // Simplified logic:
      // If an operation is already pending and we just typed a number, compute it.
      // Then, set up the new operation.
       setCurrentOperand(currentVal => { // Use functional update to ensure we get the latest state after compute
         setPreviousOperand(currentVal);
         setOperation(selectedOperation);
         setOverwrite(true);
         return currentVal; // currentOperand doesn't change here, it was set by compute or is the first number
       });

    } else {
      // No pending computation, or we're chaining operations after an equals/another op.
      setPreviousOperand(currentOperand);
      setOperation(selectedOperation);
      setOverwrite(true);
    }
  }, [currentOperand, previousOperand, operation, overwrite]); // Removed compute from deps, it's called internally


  const compute = useCallback(() => {
    if (previousOperand == null || operation == null || currentOperand == null || currentOperand === "Error") {
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
      default:
        return;
    }
    // Handle potential floating point inaccuracies for simple cases
    // For more complex scenarios, a BigNumber library would be better
    const resultString = computation.toString();
    if (resultString.includes('.')) {
        // Limit to a reasonable number of decimal places, e.g., 8
        const decimalIndex = resultString.indexOf('.');
        if (resultString.length - decimalIndex - 1 > 8) {
            computation = parseFloat(computation.toFixed(8));
        }
    }
    
    setCurrentOperand(computation.toString());
    setOperation(null);
    setPreviousOperand(null); 
    setOverwrite(true);
  }, [previousOperand, currentOperand, operation]);


  const buttons = [
    { label: 'AC', type: 'action', action: clear, className: 'col-span-2 bg-destructive hover:bg-destructive/90 text-primary-foreground' },
    { label: 'DEL', type: 'action', action: deleteDigit, className: 'bg-secondary hover:bg-secondary/80' },
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

  return (
    <div className="space-y-12">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <CalculatorIcon className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Calculator
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          A simple calculator for your everyday needs. Perform calculations with ease.
        </p>
      </section>

      <Card className="max-w-xs sm:max-w-md mx-auto shadow-2xl border rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div 
            className="bg-muted text-right p-4 sm:p-6 break-all min-h-[96px] sm:min-h-[120px] flex flex-col justify-end items-end rounded-t-lg"
            aria-live="polite"
            role="region"
            aria-label="Calculator display"
          >
            <div className="text-muted-foreground text-lg sm:text-xl h-6 sm:h-7">
              {prevDisplayValue}
            </div>
            <div className="text-foreground text-3xl sm:text-4xl font-bold">
              {displayValue}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-px bg-border">
            {buttons.map((btn) => (
              <Button
                key={btn.label}
                onClick={btn.action}
                variant={'outline'} // All buttons start as outline, specific BGs are applied via className
                className={`
                  text-xl sm:text-2xl h-16 sm:h-20 rounded-none border-0 focus:z-10
                  focus:ring-2 focus:ring-ring focus:ring-offset-1
                  ${btn.className || ''}
                  ${btn.type === 'number' || btn.label === '.' ? 'bg-card hover:bg-card/90 text-card-foreground' : ''}
                  ${btn.type === 'operator' ? 'bg-secondary hover:bg-secondary/80 text-primary font-semibold' : ''}
                  /* Ensure explicit text color for primary/destructive buttons if not handled by global theme */
                  ${(btn.label === 'AC' || btn.label === '=') && !btn.className?.includes('text-') ? 'text-primary-foreground' : ''}
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

    