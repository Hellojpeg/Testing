
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SlidersHorizontal, Music, Volume2, Mic, Zap, Settings2, ServerCrash, Waves, Plus, Minus, GripVertical, Keyboard } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MIN_PIANO_OCTAVE = 2;
const MAX_PIANO_OCTAVE = 6;

const PIANO_LAYOUT: { note: string; type: 'white' | 'black'; shortLabel?: string, qwertyKey?: string, qwertyDisplay?: string }[] = [
  { note: 'C', type: 'white', qwertyKey: 'a', qwertyDisplay: 'A' }, { note: 'C#', type: 'black', shortLabel: 'C#', qwertyKey: 'w', qwertyDisplay: 'W' },
  { note: 'D', type: 'white', qwertyKey: 's', qwertyDisplay: 'S' }, { note: 'D#', type: 'black', shortLabel: 'D#', qwertyKey: 'e', qwertyDisplay: 'E' },
  { note: 'E', type: 'white', qwertyKey: 'd', qwertyDisplay: 'D' },
  { note: 'F', type: 'white', qwertyKey: 'f', qwertyDisplay: 'F' }, { note: 'F#', type: 'black', shortLabel: 'F#', qwertyKey: 't', qwertyDisplay: 'T' },
  { note: 'G', type: 'white', qwertyKey: 'g', qwertyDisplay: 'G' }, { note: 'G#', type: 'black', shortLabel: 'G#', qwertyKey: 'y', qwertyDisplay: 'Y' },
  { note: 'A', type: 'white', qwertyKey: 'h', qwertyDisplay: 'H' }, { note: 'A#', type: 'black', shortLabel: 'A#', qwertyKey: 'u', qwertyDisplay: 'U' },
  { note: 'B', type: 'white', qwertyKey: 'j', qwertyDisplay: 'J' },
];

// Function to calculate frequency of a note
const getFrequency = (note: string, octave: number, baseA4: number = 440): number => {
  const noteIndex = NOTES.indexOf(note);
  if (noteIndex === -1) return 0;
  let semitones = (noteIndex - NOTES.indexOf('A')) + (octave - 4) * 12;
  return baseA4 * Math.pow(2, semitones / 12);
};


// Function to get note from frequency
const getNoteFromFrequency = (frequency: number, baseA4: number = 440): { noteName: string; octave: number; cents: number } => {
  if (frequency <= 0) return { noteName: '--', octave: 0, cents: 0 };

  const semitonesFromA4 = 12 * Math.log2(frequency / baseA4);
  const roundedSemitones = Math.round(semitonesFromA4);
  const cents = Math.round((semitonesFromA4 - roundedSemitones) * 100);

  let noteIndexA4 = NOTES.indexOf('A');
  let totalNoteIndex = (noteIndexA4 + roundedSemitones) % 12;
  if (totalNoteIndex < 0) {
    totalNoteIndex += 12;
  }
  const noteName = NOTES[totalNoteIndex];
  const octave = 4 + Math.floor((noteIndexA4 + roundedSemitones) / 12);
  
  return { noteName, octave, cents };
};

interface PianoKeyboardProps {
  currentPianoOctave: number;
  onKeyInteraction: (note: string, octave: number, type: 'attack' | 'release') => void;
  activeNotes: Set<string>; // Set of "NoteOctave", e.g., "C4"
}

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ currentPianoOctave, onKeyInteraction, activeNotes }) => {
  return (
    <div className="relative flex justify-center select-none bg-muted p-2 sm:p-4 rounded-lg shadow-inner border my-4">
      {/* White keys */}
      <div className="flex">
        {PIANO_LAYOUT.filter(k => k.type === 'white').map((keyData) => (
          <Button
            key={`white-${keyData.note}`}
            variant="outline"
            onMouseDown={() => onKeyInteraction(keyData.note, currentPianoOctave, 'attack')}
            onMouseUp={() => onKeyInteraction(keyData.note, currentPianoOctave, 'release')}
            onMouseLeave={() => onKeyInteraction(keyData.note, currentPianoOctave, 'release')} 
            onTouchStart={(e) => { e.preventDefault(); onKeyInteraction(keyData.note, currentPianoOctave, 'attack'); }}
            onTouchEnd={(e) => { e.preventDefault(); onKeyInteraction(keyData.note, currentPianoOctave, 'release'); }}

            aria-label={`${keyData.note}${currentPianoOctave}`}
            className={cn(
              "h-32 sm:h-40 w-8 sm:w-10 flex flex-col justify-end items-center p-1 text-xs sm:text-sm border-foreground/30 shadow-sm relative z-0",
              "bg-card hover:bg-accent/80 text-card-foreground rounded-none first:rounded-l-md last:rounded-r-md",
              activeNotes.has(`${keyData.note}${currentPianoOctave}`) && "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-1 z-10"
            )}
          >
            <span className="font-mono text-xs opacity-70 absolute top-1">{keyData.qwertyDisplay}</span>
            <span>{keyData.note}</span>
          </Button>
        ))}
      </div>
      {/* Black keys */}
      {PIANO_LAYOUT.filter(k => k.type === 'black').map((keyData) => {
        
        const getLeft = (note: string) => {
          if (note === 'C#') return `calc(var(--white-key-width) * 0.65 - var(--black-key-width) / 2)`;
          if (note === 'D#') return `calc(var(--white-key-width) * 1.70 - var(--black-key-width) / 2)`;
          if (note === 'F#') return `calc(var(--white-key-width) * 3.65 - var(--black-key-width) / 2)`;
          if (note === 'G#') return `calc(var(--white-key-width) * 4.70 - var(--black-key-width) / 2)`;
          if (note === 'A#') return `calc(var(--white-key-width) * 5.70 - var(--black-key-width) / 2)`;
          return '0px';
        };

        return (
          <Button
            key={`black-${keyData.note}`}
            variant="default"
            onMouseDown={() => onKeyInteraction(keyData.note, currentPianoOctave, 'attack')}
            onMouseUp={() => onKeyInteraction(keyData.note, currentPianoOctave, 'release')}
            onMouseLeave={() => onKeyInteraction(keyData.note, currentPianoOctave, 'release')}
            onTouchStart={(e) => { e.preventDefault(); onKeyInteraction(keyData.note, currentPianoOctave, 'attack'); }}
            onTouchEnd={(e) => { e.preventDefault(); onKeyInteraction(keyData.note, currentPianoOctave, 'release'); }}
            aria-label={`${keyData.note}${currentPianoOctave}`}
            className={cn(
              "absolute top-2 sm:top-4 h-20 sm:h-24 w-5 sm:w-6 flex flex-col justify-start items-center pt-1 text-xs sm:text-sm border border-background shadow-md z-10",
              "bg-foreground text-background hover:bg-foreground/90 rounded-sm",
              activeNotes.has(`${keyData.note}${currentPianoOctave}`) && "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-1 z-20"
            )}
            style={{ 
              left: getLeft(keyData.note),
              '--white-key-width': '2rem', 
              '--black-key-width': '1.25rem'
            } as React.CSSProperties}
          >
            <span className="font-mono text-xs opacity-70 absolute top-1">{keyData.qwertyDisplay}</span>
            <span className="mt-auto mb-1">{keyData.shortLabel || keyData.note}</span>
          </Button>
        );
      })}
       <style jsx>{`
        @media (min-width: 640px) { /* sm breakpoint */
          .flex.justify-center > div > button { /* This targets white keys */
            --white-key-width: 2.5rem; /* sm:w-10 */
          }
          /* For black keys, update style prop directly or through a more complex system if needed for full responsiveness */
          /* The current getLeft uses CSS variables that are updated here for the parent context. */
           div[class*="absolute"] { /* This targets black keys based on their absolute positioning class */
            --black-key-width: 1.5rem;  /* sm:w-6 */
          }
        }
      `}</style>
    </div>
  );
};


export default function ChromaticTunerPage() {
  const { toast } = useToast();

  const [currentPianoOctave, setCurrentPianoOctave] = useState(4);
  const [baseTuningTone, setBaseTuningTone] = useState('440');
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set()); 
  const [toneJsInitialized, setToneJsInitialized] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [tunerError, setTunerError] = useState<string | null>(null);
  const [detectedFrequency, setDetectedFrequency] = useState<number | null>(null);
  const [detectedNoteDisplay, setDetectedNoteDisplay] = useState<{ noteName: string; octave: number; cents: number } | null>(null);
  const [baseTuningTuner, setBaseTuningTuner] = useState('440');
  const audioContextRefTuner = useRef<AudioContext | null>(null);
  const analyserRefTuner = useRef<AnalyserNode | null>(null);
  const microphoneStreamRefTuner = useRef<MediaStream | null>(null);
  const animationFrameIdRefTuner = useRef<number | null>(null);
  const dataArrayRefTuner = useRef<Float32Array | null>(null);

  const [activeTab, setActiveTab] = useState("tone-generator");


  const initializeToneJs = useCallback(async () => {
    if (toneJsInitialized) return;
    try {
      await Tone.start();
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.3,
          release: 0.5,
        },
      }).toDestination();
      setToneJsInitialized(true);
      toast({ title: "Tone Generator Ready", description: "Piano is ready to play!" });
    } catch (error) {
      console.error("Failed to initialize Tone.js:", error);
      toast({ title: "Audio Error", description: "Could not initialize audio engine.", variant: "destructive" });
    }
  }, [toneJsInitialized, toast]);


  const handlePianoKeyInteraction = useCallback((note: string, octave: number, type: 'attack' | 'release') => {
    if (!toneJsInitialized && type === 'attack') {
      initializeToneJs(); 
      setTimeout(() => { // Give Tone.js a moment to initialize
        if (synthRef.current) {
           const freq = getFrequency(note, octave, parseFloat(baseTuningTone));
           if (freq > 0) {
             if (type === 'attack') {
               synthRef.current.triggerAttack(freq);
               setActiveNotes(prev => new Set(prev).add(`${note}${octave}`));
             }
           }
        }
      }, 100);
      return;
    }
    if (!synthRef.current) return;

    const freq = getFrequency(note, octave, parseFloat(baseTuningTone));
    if (freq <= 0) return;

    if (type === 'attack') {
      synthRef.current.triggerAttack(freq);
      setActiveNotes(prev => new Set(prev).add(`${note}${octave}`));
    } else {
      synthRef.current.triggerRelease(freq);
      setActiveNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${note}${octave}`);
        return newSet;
      });
    }
  }, [baseTuningTone, toneJsInitialized, initializeToneJs]);
  

  const changePianoOctave = (direction: 'up' | 'down') => {
    setCurrentPianoOctave(prev => {
      const newOctave = direction === 'up' ? prev + 1 : prev - 1;
      if (newOctave >= MIN_PIANO_OCTAVE && newOctave <= MAX_PIANO_OCTAVE) {
        return newOctave;
      }
      return prev;
    });
  };

  // QWERTY Keyboard Handler
  useEffect(() => {
    if (activeTab !== 'tone-generator') {
      if (synthRef.current) {
        synthRef.current.releaseAll();
        setActiveNotes(new Set());
      }
      return;
    }
  
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return; 
      const key = event.key.toLowerCase();
      const pianoKeyData = PIANO_LAYOUT.find(pk => pk.qwertyKey === key);
      if (pianoKeyData) {
        if ([' ', 'enter'].includes(key)) event.preventDefault();
        handlePianoKeyInteraction(pianoKeyData.note, currentPianoOctave, 'attack');
      } else if (key === 'z') { 
        changePianoOctave('down');
      } else if (key === 'x') { 
        changePianoOctave('up');
      }
    };
  
    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const pianoKeyData = PIANO_LAYOUT.find(pk => pk.qwertyKey === key);
      if (pianoKeyData) {
        handlePianoKeyInteraction(pianoKeyData.note, currentPianoOctave, 'release');
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (synthRef.current) {
        synthRef.current.releaseAll();
        setActiveNotes(new Set()); 
      }
    };
  }, [activeTab, currentPianoOctave, handlePianoKeyInteraction]);


  const processAudio = useCallback(() => {
    if (!analyserRefTuner.current || !dataArrayRefTuner.current || !audioContextRefTuner.current) {
      if (isListening) animationFrameIdRefTuner.current = requestAnimationFrame(processAudio);
      return;
    }

    analyserRefTuner.current.getFloatTimeDomainData(dataArrayRefTuner.current);
    
    let dominantFrequency = 0;
    const bufferLength = analyserRefTuner.current.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    analyserRefTuner.current.getByteFrequencyData(freqData);
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < bufferLength; i++) {
        if (freqData[i] > maxValue) {
            maxValue = freqData[i];
            maxIndex = i;
        }
    }
    dominantFrequency = maxIndex * (audioContextRefTuner.current.sampleRate / analyserRefTuner.current.fftSize);

    if (maxValue > 50 && dominantFrequency > 20 && dominantFrequency < 20000) { 
        setDetectedFrequency(dominantFrequency);
        setDetectedNoteDisplay(getNoteFromFrequency(dominantFrequency, parseFloat(baseTuningTuner)));
    } else {
        // Avoid rapidly clearing the display if it was just a momentary silence or noise
        // setDetectedNoteDisplay(null); // Consider if this is too aggressive
    }

    if (isListening) animationFrameIdRefTuner.current = requestAnimationFrame(processAudio);
  }, [baseTuningTuner, isListening]);


  const startTuner = useCallback(async () => {
    setTunerError(null);
    if (isListening) return;

    try {
      if (!audioContextRefTuner.current || audioContextRefTuner.current.state === 'closed') {
        audioContextRefTuner.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      await audioContextRefTuner.current.resume(); // Ensure context is running

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      microphoneStreamRefTuner.current = stream;
      
      const source = audioContextRefTuner.current.createMediaStreamSource(stream);
      analyserRefTuner.current = audioContextRefTuner.current.createAnalyser();
      analyserRefTuner.current.fftSize = 2048; 
      dataArrayRefTuner.current = new Float32Array(analyserRefTuner.current.fftSize);
      
      source.connect(analyserRefTuner.current);
      
      setIsListening(true);
      setDetectedFrequency(null); 
      setDetectedNoteDisplay(null);
      animationFrameIdRefTuner.current = requestAnimationFrame(processAudio);
      toast({ title: "Tuner Started", description: "Listening for audio input." });
    } catch (err) {
      console.error("Error starting tuner:", err);
      let message = "Could not access microphone.";
      if (err instanceof Error) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              message = "Microphone permission denied. Please allow access in your browser settings.";
          } else if (err.name === 'NotFoundError') {
              message = "No microphone found. Please ensure a microphone is connected.";
          }
      }
      setTunerError(message);
      toast({ title: "Tuner Error", description: message, variant: "destructive" });
      setIsListening(false);
    }
  }, [isListening, processAudio, toast]);

  const stopTuner = useCallback(() => {
    if (!isListening) return;

    if (animationFrameIdRefTuner.current) {
      cancelAnimationFrame(animationFrameIdRefTuner.current);
      animationFrameIdRefTuner.current = null;
    }
    if (microphoneStreamRefTuner.current) {
      microphoneStreamRefTuner.current.getTracks().forEach(track => track.stop());
      microphoneStreamRefTuner.current = null;
    }
    // Don't close the audio context here, as it might be shared or needed again soon.
    // It will be closed on component unmount.
    setIsListening(false);
    toast({ title: "Tuner Stopped" });
  }, [isListening, toast]);

  useEffect(() => {
    return () => {
      if (animationFrameIdRefTuner.current) {
        cancelAnimationFrame(animationFrameIdRefTuner.current);
      }
      if (microphoneStreamRefTuner.current) {
        microphoneStreamRefTuner.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRefTuner.current && audioContextRefTuner.current.state !== 'closed') {
        audioContextRefTuner.current.close().catch(e => console.error("Error closing tuner audio context:", e));
      }
      if (synthRef.current) {
        synthRef.current.releaseAll();
        synthRef.current.dispose();
        synthRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (activeTab === "tuner") {
      if (synthRef.current) {
        synthRef.current.releaseAll();
        setActiveNotes(new Set());
      }
    }
    if (activeTab === "tone-generator" && isListening) {
      stopTuner(); 
    }
  }, [activeTab, isListening, stopTuner]);

  const renderTunerDisplay = () => {
    if (!isListening && !tunerError) {
      return <p className="text-muted-foreground">Click "Start Listening" to activate the tuner.</p>;
    }
    if (tunerError) {
      return (
        <Alert variant="destructive" className="my-4">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Tuner Error</AlertTitle>
          <AlertDescription>{tunerError}</AlertDescription>
        </Alert>
      );
    }
    if (isListening && !detectedNoteDisplay && !detectedFrequency) {
        return (
            <div className="flex flex-col items-center justify-center h-32">
                <Spinner size="md" />
                <p className="text-muted-foreground mt-2">Listening...</p>
            </div>
        );
    }
    if (detectedNoteDisplay) {
      const { noteName, octave, cents } = detectedNoteDisplay;
      const progressValue = 50 + (cents / 2); 

      return (
        <div className="space-y-4 text-center">
          <div className="text-6xl font-bold text-primary">
            {noteName}
            <span className="text-3xl align-text-top text-foreground/80">{octave > 0 ? octave : ''}</span>
          </div>
          <div className="w-full max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Flat</span>
              <span>In Tune</span>
              <span>Sharp</span>
            </div>
            <Progress value={progressValue} className="h-3 rounded-full" />
            <p className={`text-lg font-medium mt-2 ${cents === 0 ? 'text-green-500' : 'text-foreground'}`}>
              {cents > 0 ? `+${cents}` : cents} cents
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Detected Frequency: {detectedFrequency ? detectedFrequency.toFixed(2) : '--'} Hz
          </p>
        </div>
      );
    }
    return <p className="text-muted-foreground">Make some noise or ensure microphone is picking up sound clearly.</p>;
  };


  return (
    <div className="space-y-12">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <Music className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Chromatic Tuner & Tone Generator
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Tune your instruments with precision or generate reference tones using the interactive piano.
        </p>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="tone-generator">
            <Volume2 className="mr-2 h-5 w-5" /> Tone Generator
          </TabsTrigger>
          <TabsTrigger value="tuner">
            <Mic className="mr-2 h-5 w-5" /> Chromatic Tuner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tone-generator">
          <Card className="shadow-md border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Waves className="h-6 w-6 text-primary" />
                Generate a Tone
              </CardTitle>
              <CardDescription>
                Click the piano keys or use your keyboard (QWERTY layout: A,S,D... for white keys; W,E,T... for black keys; Z/X for octave change).
                {!toneJsInitialized && " Click a piano key or the button below to initialize the audio engine."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" onClick={() => changePianoOctave('down')} disabled={currentPianoOctave <= MIN_PIANO_OCTAVE}>
                    <Minus className="h-5 w-5" />
                    <span className="sr-only">Octave Down (Z)</span>
                  </Button>
                  <div className="text-lg font-medium w-28 text-center border px-3 py-1.5 rounded-md bg-muted shadow-sm">
                    Octave {currentPianoOctave}
                  </div>
                  <Button variant="outline" size="icon" onClick={() => changePianoOctave('up')} disabled={currentPianoOctave >= MAX_PIANO_OCTAVE}>
                    <Plus className="h-5 w-5" />
                    <span className="sr-only">Octave Up (X)</span>
                  </Button>
                </div>
                
                <PianoKeyboard 
                  currentPianoOctave={currentPianoOctave} 
                  onKeyInteraction={handlePianoKeyInteraction}
                  activeNotes={activeNotes}
                />
              </div>

              <div className="max-w-xs mx-auto">
                <Label htmlFor="tone-base-tuning">Base Tuning (A4 Frequency)</Label>
                <Input
                  id="tone-base-tuning"
                  type="number"
                  value={baseTuningTone}
                  onChange={(e) => {
                      setBaseTuningTone(e.target.value);
                  }}
                  placeholder="e.g., 440"
                  className="mt-1"
                />
                 <p className="text-xs text-muted-foreground mt-1">Standard tuning is A4 = 440 Hz.</p>
              </div>
              
              {!toneJsInitialized && (
                 <Button size="lg" onClick={initializeToneJs} className="w-full md:w-auto mx-auto flex">
                    <Keyboard className="mr-2 h-5 w-5" /> Enable Piano Keyboard
                 </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tuner">
          <Card className="shadow-md border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <SlidersHorizontal className="h-6 w-6 text-primary" />
                Tune Your Instrument
              </CardTitle>
              <CardDescription>
                Use your microphone to detect the pitch of your instrument.
                <br />
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Important: Pitch detection accuracy is experimental and may vary, especially with complex sounds or noisy environments. This tuner is best used as a reference.</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
                  <div className="w-full sm:w-auto">
                    <Label htmlFor="tuner-base-tuning" className="text-sm">Base Tuning (A4)</Label>
                    <Input
                      id="tuner-base-tuning"
                      type="number"
                      value={baseTuningTuner}
                      onChange={(e) => setBaseTuningTuner(e.target.value)}
                      placeholder="e.g., 440"
                      className="mt-1 w-full sm:w-28"
                      disabled={isListening}
                    />
                  </div>
                  <Button size="lg" onClick={isListening ? stopTuner : startTuner} className="w-full sm:w-auto min-w-[180px]">
                    {isListening ? <Mic className="mr-2 h-5 w-5 animate-pulse" /> : <Mic className="mr-2 h-5 w-5" />}
                    {isListening ? 'Stop Listening' : 'Start Listening'}
                  </Button>
              </div>
              
              <div className="min-h-[200px] flex items-center justify-center p-4 border rounded-md bg-background shadow-inner">
                {renderTunerDisplay()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
