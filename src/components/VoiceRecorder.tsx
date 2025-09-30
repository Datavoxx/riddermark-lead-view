import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, Trash2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
}

export const VoiceRecorder = ({ onRecordingComplete }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        onRecordingComplete?.(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        stopTimer();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      startTimeRef.current = Date.now();

      // Start timer with precise timing
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingTime(elapsed);
      }, 100); // Update more frequently for smoother display

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

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {!isRecording && !audioURL ? (
          <Button
            onClick={startRecording}
            variant="secondary"
            className="flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Mic className="h-4 w-4" />
            Spela in röstmeddelande 🎙️
          </Button>
        ) : isRecording ? (
          <div className="relative">
            <div className="absolute -inset-1 bg-destructive/20 rounded-lg animate-pulse" />
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="relative flex items-center gap-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="font-mono font-semibold tabular-nums">{formatTime(recordingTime)}</span>
              </div>
              <Square className="h-4 w-4 fill-current" />
            </Button>
          </div>
        ) : null}
      </div>

      {audioURL && (
        <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-md">
          <audio
            ref={audioRef}
            src={audioURL}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          <Button
            onClick={togglePlayback}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                Pausa
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Spela upp
              </>
            )}
          </Button>

          <Button
            onClick={startRecording}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Mic className="h-4 w-4" />
            Spela in igen
          </Button>

          <Button
            onClick={deleteRecording}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Ta bort
          </Button>

          <Button
            onClick={() => {}}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Skicka
          </Button>
        </div>
      )}
    </div>
  );
};