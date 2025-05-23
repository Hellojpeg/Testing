
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SlidersHorizontal, Music, Volume2, Mic, Zap, Settings2, ServerCrash, Waves } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = ['1', '2', '3', '4', '5', '6', '7'];

// Function to calculate frequency of a note
const getFrequency = (note: string, octave: number, baseA4: number = 440): number => {
  const noteIndex = NOTES.indexOf(note);
  if (noteIndex === -1) return 0;

  // Semitones from A4
  // A4 is NOTES[9]
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


export default function ChromaticTunerPage() {
  const { toast } = useToast();

  // --- Tone Generator State ---
  const [selectedNote, setSelectedNote] = useState('A');
  const [selectedOctave, setSelectedOctave] = useState('4');
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
      // Play tone
      if (!audioContextRefTone.current || audioContextRefTone.current.state === 'closed') {
        audioContextRefTone.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const context = audioContextRefTone.current;
      const oscillator = context.createOscillator();
      const freq = getFrequency(selectedNote, parseInt(selectedOctave, 10), parseFloat(baseTuningTone));
      
      if (freq <= 0) {
        toast({ title: "Invalid Note", description: "Could not calculate frequency for the selected note/octave.", variant: "destructive" });
        return;
      }

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, context.currentTime);
      oscillator.connect(context.destination);
      oscillator.start();

      oscillatorRefTone.current = oscillator;
      setIsPlaying(true);
    }
  }, [isPlaying, selectedNote, selectedOctave, baseTuningTone, toast]);

  useEffect(() => {
    // Cleanup for Tone Generator
    return () => {
      if (oscillatorRefTone.current) {
        oscillatorRefTone.current.stop();
        oscillatorRefTone.current.disconnect();
      }
    };
  }, []);


  // Tuner Logic
  const processAudio = useCallback(() => {
    if (!analyserRefTuner.current || !dataArrayRefTuner.current || !audioContextRefTuner.current) {
      if (isListening) animationFrameIdRefTuner.current = requestAnimationFrame(processAudio);
      return;
    }

    analyserRefTuner.current.getFloatTimeDomainData(dataArrayRefTuner.current);
    
    // --- Placeholder for actual pitch detection ---
    // This is a very simplified and not musically accurate way to get *a* dominant frequency.
    // A proper tuner needs a robust pitch detection algorithm (e.g., Autocorrelation, YIN, AMDF, etc.).
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

    // Basic filtering: ensure there's some signal strength and frequency is within a reasonable human hearing range
    // This threshold (maxValue > 50) is arbitrary and might need adjustment.
    if (maxValue > 50 && dominantFrequency > 20 && dominantFrequency < 20000) { 
        setDetectedFrequency(dominantFrequency);
        setDetectedNoteDisplay(getNoteFromFrequency(dominantFrequency, parseFloat(baseTuningTuner)));
    } else {
        // If no clear signal or out of range, don't update, or clear previous.
        // Clearing can make the UI jumpy; not updating keeps the last valid reading.
        // For a tuner, it might be better to show "---" or "Listening..." if signal is weak.
        // For now, we'll keep the last valid reading if signal is weak, or clear if it's the first time.
        if (detectedFrequency === null) { // only clear if nothing was ever detected
             // setDetectedNoteDisplay(null); // This line can be uncommented to clear display on weak signal
        }
    }
    // --- End of Placeholder ---

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
      setDetectedFrequency(null); // Reset on start
      setDetectedNoteDisplay(null); // Reset on start
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
    // No need to disconnect analyserRefTuner.current explicitly, source stopping handles it.
    setIsListening(false);
    // Do not clear detectedFrequency/NoteDisplay here, so user can see the last state.
    // If you want to clear it:
    // setDetectedFrequency(null);
    // setDetectedNoteDisplay(null);
    toast({ title: "Tuner Stopped" });
  }, [isListening, toast]);

  // Effect for tuner cleanup
  useEffect(() => {
    return () => {
      if (animationFrameIdRefTuner.current) {
        cancelAnimationFrame(animationFrameIdRefTuner.current);
      }
      if (microphoneStreamRefTuner.current) {
        microphoneStreamRefTuner.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Stop audio when tab changes
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
    if (isListening && !detectedNoteDisplay && !detectedFrequency) { // Show spinner only if no frequency detected yet
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
    // Fallback if listening but nothing specific to show (e.g. weak signal after initial detection)
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
          Tune your instruments with precision or generate reference tones.
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
                Select a note, octave, and base tuning to generate a reference tone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="tone-note">Note</Label>
                  <Select value={selectedNote} onValueChange={setSelectedNote}>
                    <SelectTrigger id="tone-note" className="mt-1">
                      <SelectValue placeholder="Select note" />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTES.map(note => <SelectItem key={note} value={note}>{note}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tone-octave">Octave</Label>
                  <Select value={selectedOctave} onValueChange={setSelectedOctave}>
                    <SelectTrigger id="tone-octave" className="mt-1">
                      <SelectValue placeholder="Select octave" />
                    </SelectTrigger>
                    <SelectContent>
                      {OCTAVES.map(oct => <SelectItem key={oct} value={oct}>{oct}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
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
              <Button size="lg" onClick={handlePlayStopTone} className="w-full md:w-auto">
                <Zap className="mr-2 h-5 w-5" />
                {isPlaying ? 'Stop Tone' : 'Play Tone'}
              </Button>
              {isPlaying && (
                <p className="text-sm text-center text-primary">
                  Playing: {selectedNote}{selectedOctave} at {getFrequency(selectedNote, parseInt(selectedOctave), parseFloat(baseTuningTone)).toFixed(2)} Hz
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

