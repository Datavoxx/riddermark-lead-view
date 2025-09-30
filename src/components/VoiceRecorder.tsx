import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
}

export const VoiceRecorder = ({ onRecordingComplete }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const { toast } = useToast();

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopVisualization = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const visualizeAudio = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = "rgb(15, 23, 42)";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 3;
      canvasCtx.strokeStyle = "rgb(239, 68, 68)";
      canvasCtx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 2048;

      visualizeAudio();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordingComplete?.(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        stopTimer();
        stopVisualization();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingTime(elapsed);
      }, 100);

      toast({
        title: "Inspelning startad",
        description: "Börja tala...",
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Mikrofonfel",
        description: "Kunde inte komma åt mikrofonen",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopTimer();
      stopVisualization();

      toast({
        title: "Inspelning stoppad",
        description: `Längd: ${recordingTime} sekunder`,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      stopTimer();
      stopVisualization();
    };
  }, [stopTimer, stopVisualization]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {isRecording && (
        <div className="relative overflow-hidden rounded-lg border border-destructive/50 bg-slate-900 p-2">
          <canvas
            ref={canvasRef}
            width={600}
            height={80}
            className="w-full h-20"
          />
          <div className="absolute top-2 right-2 text-xs text-white/80 font-mono bg-black/40 px-2 py-1 rounded">
            {formatTime(recordingTime)}
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            variant="secondary"
            className="flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Mic className="h-4 w-4" />
            Spela in röstmeddelande 🎙️
          </Button>
        ) : (
          <div className="relative">
            <div className="absolute -inset-1 bg-destructive/20 rounded-lg animate-pulse" />
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="relative flex items-center gap-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="font-mono font-semibold tabular-nums">Stoppa inspelning</span>
              </div>
              <Square className="h-4 w-4 fill-current" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};