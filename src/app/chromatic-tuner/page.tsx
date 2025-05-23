
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Select components are no longer needed for Tone Generator
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SlidersHorizontal, Music, Volume2, Mic, Zap, Settings2, ServerCrash, Waves, Plus, Minus, GripVertical } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MIN_PIANO_OCTAVE = 2;
const MAX_PIANO_OCTAVE = 6;

const PIANO_LAYOUT: { note: string; type: 'white' | 'black'; shortLabel?: string }[] = [
  { note: 'C', type: 'white' }, { note: 'C#', type: 'black', shortLabel: 'C#' },
  { note: 'D', type: 'white' }, { note: 'D#', type: 'black', shortLabel: 'D#' },
  { note: 'E', type: 'white' },
  { note: 'F', type: 'white' }, { note: 'F#', type: 'black', shortLabel: 'F#' },
  { note: 'G', type: 'white' }, { note: 'G#', type: 'black', shortLabel: 'G#' },
  { note: 'A', type: 'white' }, { note: 'A#', type: 'black', shortLabel: 'A#' },
  { note: 'B', type: 'white' },
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
  selectedNote: string;
  selectedOctaveForNote: number;
  onKeyClick: (note: string) => void;
}

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ currentPianoOctave, selectedNote, selectedOctaveForNote, onKeyClick }) => {
  return (
    <div className="relative flex justify-center select-none bg-muted p-2 sm:p-4 rounded-lg shadow-inner border my-4">
      {/* White keys */}
      <div className="flex">
        {PIANO_LAYOUT.filter(k => k.type === 'white').map((keyData) => (
          <Button
            key={`white-${keyData.note}`}
            variant="outline"
            onClick={() => onKeyClick(keyData.note)}
            aria-label={`${keyData.note}${currentPianoOctave}`}
            className={cn(
              "h-32 sm:h-40 w-8 sm:w-10 flex flex-col justify-end items-center p-1 text-xs sm:text-sm border-foreground/30 shadow-sm relative z-0",
              "bg-card hover:bg-accent/80 text-card-foreground rounded-none first:rounded-l-md last:rounded-r-md",
              selectedNote === keyData.note && selectedOctaveForNote === currentPianoOctave && "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-1 z-10"
            )}
          >
            <span>{keyData.note}</span>
          </Button>
        ))}
      </div>
      {/* Black keys */}
      {PIANO_LAYOUT.filter(k => k.type === 'black').map((keyData, index) => {
        const whiteKeyWidth = "w-8 sm:w-10"; // Match white key width for positioning calculation
        const baseLeftOffset = index * parseFloat(whiteKeyWidth.split('-')[1] || '0'); // Simplified - assumes equal spacing
        
        let leftPosition = '0px';
        // Approximate positions for black keys based on standard layout
        if (keyData.note === 'C#') leftPosition = 'calc(2.5rem * 0.60)'; // Between C and D
        if (keyData.note === 'D#') leftPosition = 'calc(2.5rem * 1.60)'; // Between D and E
        if (keyData.note === 'F#') leftPosition = 'calc(2.5rem * 3.60)'; // Between F and G
        if (keyData.note === 'G#') leftPosition = 'calc(2.5rem * 4.60)'; // Between G and A
        if (keyData.note === 'A#') leftPosition = 'calc(2.5rem * 5.60)'; // Between A and B
        // Responsive left position based on sm:w-10 for white keys (2.5rem)
        // C#: ~2.5 * 0.6 = 1.5rem
        // D#: ~2.5 * 1.6 = 4rem
        // F#: ~2.5 * 3.6 = 9rem
        // G#: ~2.5 * 4.6 = 11.5rem
        // A#: ~2.5 * 5.6 = 14rem
        
        // For small screens, use w-8 (2rem)
        // C#: ~2 * 0.6 = 1.2rem
        // D#: ~2 * 1.6 = 3.2rem
        // F#: ~2 * 3.6 = 7.2rem
        // G#: ~2 * 4.6 = 9.2rem
        // A#: ~2 * 5.6 = 11.2rem

        const getLeft = (note: string) => {
          const offsets: Record<string, {sm: string, base: string}> = {
            'C#': { sm: '1.5rem', base: '1.2rem'},
            'D#': { sm: '4.0rem', base: '3.2rem'},
            'F#': { sm: '9.0rem', base: '7.2rem'},
            'G#': { sm: '11.5rem', base: '9.2rem'},
            'A#': { sm: '14.0rem', base: '11.2rem'},
          };
          return `calc(${offsets[note]?.base || '0px'} + ${index * 0.1}rem)`; // Slight adjustment if calculation is off
        };
         const getLeftSm = (note: string) => {
          const offsets: Record<string, {sm: string, base: string}> = {
            'C#': { sm: '1.5rem', base: '1.2rem'},
            'D#': { sm: '4.0rem', base: '3.2rem'},
            'F#': { sm: '9.0rem', base: '7.2rem'},
            'G#': { sm: '11.5rem', base: '9.2rem'},
            'A#': { sm: '14.0rem', base: '11.2rem'},
          };
          return `calc(${offsets[note]?.sm || '0px'} + ${index * 0.1}rem)`;
        };


        return (
          <Button
            key={`black-${keyData.note}`}
            variant="default"
            onClick={() => onKeyClick(keyData.note)}
            aria-label={`${keyData.note}${currentPianoOctave}`}
            className={cn(
              "absolute top-2 sm:top-4 h-20 sm:h-24 w-5 sm:w-6 flex flex-col justify-start items-center pt-1 text-xs sm:text-sm border border-background shadow-md z-10",
              "bg-foreground text-background hover:bg-foreground/90 rounded-sm",
              selectedNote === keyData.note && selectedOctaveForNote === currentPianoOctave && "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-1 z-20"
            )}
            style={{ left: getLeft(keyData.note) }}
            // Using a trick for responsive style: hide one and show other. Not ideal but works for simple cases.
            // For more complex responsive styles within `style` prop, consider JS-based calculations or CSS-in-JS.
          >
            {/* The sm:left style needs a different approach if done purely in style prop */}
            <span className="hidden sm:block" style={{ position:'absolute', left: getLeftSm(keyData.note)}}></span>
            <span>{keyData.shortLabel || keyData.note}</span>
          </Button>
        );
      })}
    </div>
  );
};


export default function ChromaticTunerPage() {
  const { toast } = useToast();

  // --- Tone Generator State ---
  const [selectedNote, setSelectedNote] = useState('A');
  const [selectedOctave, setSelectedOctave] = useState(4); // Now a number
  const [currentPianoOctave, setCurrentPianoOctave] = useState(4); // For piano UI
  const [baseTuningTone, setBaseTuningTone] = useState('440');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRefTone = useRef<AudioContext | null>(null);
  const oscillatorRefTone = useRef<OscillatorNode | null>(null);

  // --- Tuner State ---
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

  // --- Shared ---
  const [activeTab, setActiveTab] = useState("tone-generator");

  // Tone Generator Logic
  const handlePianoKeyClick = (note: string) => {
    setSelectedNote(note);
    setSelectedOctave(currentPianoOctave);
  };

  const changePianoOctave = (direction: 'up' | 'down') => {
    setCurrentPianoOctave(prev => {
      const newOctave = direction === 'up' ? prev + 1 : prev - 1;
      if (newOctave >= MIN_PIANO_OCTAVE && newOctave <= MAX_PIANO_OCTAVE) {
        return newOctave;
      }
      return prev;
    });
  };

  const handlePlayStopTone = useCallback(() => {
    if (isPlaying) {
      // Stop tone
      if (oscillatorRefTone.current) {
        oscillatorRefTone.current.stop();
        oscillatorRefTone.current.disconnect();
        oscillatorRefTone.current = null;
      }
      setIsPlaying(false);
    } else {
      // Start playing - useEffect will handle actual sound generation
      if (!audioContextRefTone.current || audioContextRefTone.current.state === 'closed') {
        audioContextRefTone.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      // Check if a valid note can be played before setting isPlaying to true
      const freq = getFrequency(selectedNote, selectedOctave, parseFloat(baseTuningTone));
      if (freq <= 0) {
        toast({ title: "Invalid Note", description: "Select a valid note/octave to play.", variant: "destructive" });
        return;
      }
      setIsPlaying(true);
    }
  }, [isPlaying, selectedNote, selectedOctave, baseTuningTone, toast]);
  
  useEffect(() => {
    if (isPlaying && audioContextRefTone.current) {
      // Stop existing oscillator
      if (oscillatorRefTone.current) {
        try {
          oscillatorRefTone.current.stop();
          oscillatorRefTone.current.disconnect();
        } catch (e) {
            // console.warn("Error stopping previous oscillator:", e);
        }
      }
  
      // Create and play new tone
      const context = audioContextRefTone.current;
      const oscillator = context.createOscillator();
      const freq = getFrequency(selectedNote, selectedOctave, parseFloat(baseTuningTone));
  
      if (freq <= 0) {
        // If frequency is invalid, ensure isPlaying is false if it was true
        // This can happen if baseTuningTone becomes invalid while playing
        if (isPlaying) setIsPlaying(false);
        return;
      }
  
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, context.currentTime);
      oscillator.connect(context.destination);
      try {
        oscillator.start();
      } catch(e) {
        // console.error("Error starting oscillator:", e);
        setIsPlaying(false); // Fallback if start fails
        return;
      }
      oscillatorRefTone.current = oscillator;
    } else if (!isPlaying && oscillatorRefTone.current) {
      // Ensure oscillator is stopped if isPlaying becomes false
      try {
        oscillatorRefTone.current.stop();
        oscillatorRefTone.current.disconnect();
      } catch (e) {
         // console.warn("Error stopping oscillator on isPlaying false:", e);
      }
      oscillatorRefTone.current = null;
    }
  
    // Cleanup function for the effect
    return () => {
      if (oscillatorRefTone.current) {
        try {
          oscillatorRefTone.current.stop();
          oscillatorRefTone.current.disconnect();
        } catch (e) {
          // console.warn("Error stopping oscillator on cleanup:", e);
        }
        oscillatorRefTone.current = null;
      }
    };
  }, [isPlaying, selectedNote, selectedOctave, baseTuningTone]);


  // Tuner Logic (remains the same)
  const processAudio = useCallback(() => {
    if (!analyserRefTuner.current || !dataArrayRefTuner.current || !audioContextRefTuner.current) {
      if (isListening) animationFrameIdRefTuner.current = requestAnimationFrame(processAudio);
      return;
    }

    analyserRefTuner.current.getFloatTimeDomainData(dataArrayRefTuner.current);
    
    let dominantFrequency = 0;
    const nyquist = audioContextRefTuner.current.sampleRate / 2;
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
        if (detectedFrequency === null) {
            // setDetectedNoteDisplay(null); 
        }
    }

    if (isListening) animationFrameIdRefTuner.current = requestAnimationFrame(processAudio);
  }, [baseTuningTuner, isListening, detectedFrequency]);


  const startTuner = useCallback(async () => {
    setTunerError(null);
    if (isListening) return;

    try {
      if (!audioContextRefTuner.current || audioContextRefTuner.current.state === 'closed') {
        audioContextRefTuner.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const context = audioContextRefTuner.current;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      microphoneStreamRefTuner.current = stream;
      
      const source = context.createMediaStreamSource(stream);
      analyserRefTuner.current = context.createAnalyser();
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
       if (oscillatorRefTone.current) { // Also cleanup tone oscillator on page unmount
        try {
            oscillatorRefTone.current.stop();
            oscillatorRefTone.current.disconnect();
        } catch (e) {/* ignore */}
      }
      if (audioContextRefTone.current && audioContextRefTone.current.state !== 'closed') {
        audioContextRefTone.current.close();
      }
      if (audioContextRefTuner.current && audioContextRefTuner.current.state !== 'closed') {
        audioContextRefTuner.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (activeTab === "tuner" && isPlaying) {
      handlePlayStopTone(); 
    }
    if (activeTab === "tone-generator" && isListening) {
      stopTuner(); 
    }
  }, [activeTab, isPlaying, isListening, handlePlayStopTone, stopTuner]);

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
                Use the piano to select a note, adjust the octave, and set base tuning to generate a reference tone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" onClick={() => changePianoOctave('down')} disabled={currentPianoOctave <= MIN_PIANO_OCTAVE}>
                    <Minus className="h-5 w-5" />
                    <span className="sr-only">Octave Down</span>
                  </Button>
                  <div className="text-lg font-medium w-28 text-center border px-3 py-1.5 rounded-md bg-muted shadow-sm">
                    Octave {currentPianoOctave}
                  </div>
                  <Button variant="outline" size="icon" onClick={() => changePianoOctave('up')} disabled={currentPianoOctave >= MAX_PIANO_OCTAVE}>
                    <Plus className="h-5 w-5" />
                    <span className="sr-only">Octave Up</span>
                  </Button>
                </div>
                
                <PianoKeyboard 
                  currentPianoOctave={currentPianoOctave} 
                  selectedNote={selectedNote}
                  selectedOctaveForNote={selectedOctave}
                  onKeyClick={handlePianoKeyClick} 
                />
              </div>

              <div className="max-w-xs mx-auto">
                <Label htmlFor="tone-base-tuning">Base Tuning (A4 Frequency)</Label>
                <Input
                  id="tone-base-tuning"
                  type="number"
                  value={baseTuningTone}
                  onChange={(e) => setBaseTuningTone(e.target.value)}
                  placeholder="e.g., 440"
                  className="mt-1"
                />
                 <p className="text-xs text-muted-foreground mt-1">Standard tuning is A4 = 440 Hz.</p>
              </div>
              <Button size="lg" onClick={handlePlayStopTone} className="w-full md:w-auto mx-auto flex">
                <Zap className="mr-2 h-5 w-5" />
                {isPlaying ? 'Stop Tone' : 'Play Tone'}
              </Button>
              {isPlaying && (
                <p className="text-sm text-center text-primary">
                  Playing: {selectedNote}{selectedOctave} at {getFrequency(selectedNote, selectedOctave, parseFloat(baseTuningTone)).toFixed(2)} Hz
                </p>
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

