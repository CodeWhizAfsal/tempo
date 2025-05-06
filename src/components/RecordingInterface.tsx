"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import AudioVisualizer from "./AudioVisualizer";

interface RecordingInterfaceProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  onProcessingStart?: () => void;
}

const RecordingInterface = ({
  onRecordingComplete = () => {},
  onProcessingStart = () => {},
}: RecordingInterfaceProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Set up audio context and analyzer for visualization
  const setupAudioContext = async (stream: MediaStream) => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    // Start visualization loop
    visualize();
  };

  // Visualization function
  const visualize = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    analyserRef.current.getFloatTimeDomainData(dataArray);
    setAudioData(dataArray);

    if (isRecording && !isPaused) {
      requestAnimationFrame(visualize);
    }
  };

  // Start recording function
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setIsProcessing(true);
        onProcessingStart();
        onRecordingComplete(audioBlob);
      };

      await setupAudioContext(stream);

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();

      // Stop all tracks on the stream
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto bg-background border-border">
      <CardContent className="p-6 flex flex-col items-center">
        <div className="w-full mb-6">
          {isRecording && audioData && (
            <AudioVisualizer audioData={audioData} />
          )}
          {!isRecording && !isProcessing && (
            <div className="h-[120px] flex items-center justify-center text-muted-foreground">
              <p>Click the microphone button to start recording</p>
            </div>
          )}
          {isProcessing && (
            <div className="h-[120px] flex items-center justify-center">
              <Loader className="w-8 h-8 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">Processing audio...</p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          {isRecording && (
            <div className="text-xl font-mono">{formatTime(recordingTime)}</div>
          )}

          <Button
            size="lg"
            className={`rounded-full w-16 h-16 ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
          >
            {isRecording ? (
              <Square className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>

          <p className="text-sm text-muted-foreground">
            {isRecording
              ? "Click to stop recording"
              : "Click to start recording"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordingInterface;
