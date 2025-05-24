
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator as CalculatorIcon, Trash2, Delete } from 'lucide-react'; // Using Delete for backspace

const CalculatorPage = () => {
  const [currentOperand, setCurrentOperand] = useState<string>('0');
  const [previousOperand, setPreviousOperand] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState<boolean>(true); // If true, next number input overwrites currentOperand

  const formatOperand = (operand: string | null) => {
    if (operand == null) return '';
    const stringOperand = operand.toString();
    const integerDigits = parseFloat(stringOperand.split('.')[0]);
    const decimalDigits = stringOperand.split('.')[1];
    let integerDisplay;
    if (isNaN(integerDigits)) {
      integerDisplay = '';
    } else {
      integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
    }
    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    }
    return integerDisplay;
  };
  
  const displayValue = formatOperand(currentOperand);

  const clear = useCallback(() => {
    setCurrentOperand('0');
    setPreviousOperand(null);
    setOperation(null);
    setOverwrite(true);
  }, []);

  const deleteDigit = useCallback(() => {
    if (overwrite) return; // Don't delete if we're in overwrite mode (e.g. after an operation, showing result)
    if (currentOperand === '0' || currentOperand.length === 1) {
      setCurrentOperand('0');
      setOverwrite(true);
      return;
    }
    setCurrentOperand(currentOperand.slice(0, -1));
  }, [currentOperand, overwrite]);

  const appendNumber = useCallback((number: string) => {
    if (number === '.' && currentOperand.includes('.')) return;
    if (overwrite) {
      setCurrentOperand(number === '.' ? '0.' : number);
      setOverwrite(false);
    } else {
      if (currentOperand === '0' && number !== '.') {
        setCurrentOperand(number);
      } else {
        setCurrentOperand(prev => `${prev}${number}`);
      }
    }
  }, [currentOperand, overwrite]);

  const chooseOperation = useCallback((selectedOperation: string) => {
    if (currentOperand === '0' && previousOperand == null) return;

    if (previousOperand != null && operation != null && !overwrite) {
      compute(); // Compute the previous operation before starting a new one
    }
    
    // After compute, currentOperand holds the result.
    // This result becomes the previousOperand for the new operation.
    // The `compute` function sets `overwrite` to true, so this logic works.
    // If `compute` wasn't called, we are setting up the first part of an operation.

    setOperation(selectedOperation);
    // If compute was called, currentOperand is result. If not, it's the first number.
    // This needs to happen after any potential compute()
    setPreviousOperand(currentOperand); 
    setOverwrite(true); // Next number typed will start a new currentOperand

  }, [currentOperand, previousOperand, operation, overwrite]); // Added compute to dependencies if it was a dep

  const compute = useCallback(() => {
    if (previousOperand == null || operation == null || currentOperand == null) return;

    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    if (isNaN(prev) || isNaN(current)) return;

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
    setCurrentOperand(computation.toString());
    setOperation(null);
    setPreviousOperand(null); // Clear previous operand after computation
    setOverwrite(true);
  }, [previousOperand, currentOperand, operation]);

  const buttons = [
    { label: 'AC', type: 'action', action: clear, className: 'col-span-2 bg-destructive hover:bg-destructive/90' },
    { label: 'DEL', type: 'action', action: deleteDigit },
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
    { label: '=', type: 'action', action: compute, className: 'bg-primary hover:bg-primary/90' },
  ];

  return (
    <div className="space-y-12">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <CalculatorIcon className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Calculator
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          A simple calculator for your everyday needs.
        </p>
      </section>

      <Card className="max-w-md mx-auto shadow-2xl border rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div 
            className="bg-muted text-right p-6 break-all h-24 flex flex-col justify-end items-end rounded-t-lg"
            aria-live="polite"
          >
            <div className="text-muted-foreground text-xl">
              {previousOperand != null ? `${formatOperand(previousOperand)} ${operation || ''}` : ''}
            </div>
            <div className="text-foreground text-4xl font-bold">
              {displayValue}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-px bg-border">
            {buttons.map((btn) => (
              <Button
                key={btn.label}
                onClick={btn.action}
                variant={btn.type === 'operator' ? 'secondary' : 'outline'}
                className={`
                  text-2xl h-20 rounded-none border-0 focus:z-10
                  ${btn.className || ''}
                  ${btn.type === 'number' || btn.label === '.' ? 'bg-card hover:bg-card/90' : ''}
                  ${btn.type === 'operator' ? 'bg-secondary hover:bg-secondary/80 text-primary font-semibold' : ''}
                  ${btn.label === 'AC' || btn.label === '=' ? 'text-primary-foreground' : ''}
                `}
                aria-label={btn.label === '×' ? 'Multiply' : btn.label === '÷' ? 'Divide' : btn.label}
              >
                {btn.label === 'DEL' ? <Delete className="h-6 w-6" /> : btn.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalculatorPage;

