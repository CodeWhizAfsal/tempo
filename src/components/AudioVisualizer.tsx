"use client";

import React, { useRef, useEffect, useState } from "react";

interface AudioVisualizerProps {
  isRecording?: boolean;
  audioStream?: MediaStream | null;
  audioData?: Float32Array | null;
}

const AudioVisualizer = ({
  isRecording = false,
  audioStream = null,
  audioData = null,
}: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context
    if (!audioContext && typeof window !== "undefined") {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const newAudioContext = new AudioContext();
        setAudioContext(newAudioContext);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioContext]);

  useEffect(() => {
    if (!audioContext || !audioStream) return;

    // Set up audio analyzer when recording starts
    if (isRecording && audioStream) {
      const source = audioContext.createMediaStreamSource(audioStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      analyserRef.current = analyser;
      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      // Start visualization
      const draw = () => {
        if (!isRecording) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        analyserRef.current!.getByteFrequencyData(dataArrayRef.current!);

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "rgba(200, 200, 200, 0.1)";
        ctx.fillRect(0, 0, width, height);

        const barWidth = (width / dataArrayRef.current!.length) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < dataArrayRef.current!.length; i++) {
          barHeight = dataArrayRef.current![i] / 2;

          // Create gradient for visualization
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, "#4f46e5"); // Indigo
          gradient.addColorStop(1, "#8b5cf6"); // Purple

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth, barHeight);

          x += barWidth + 1;
        }

        animationRef.current = requestAnimationFrame(draw);
      };

      draw();
    } else {
      // Clean up when recording stops
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "rgba(200, 200, 200, 0.1)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, audioStream, audioContext]);

  return (
    <div className="w-full h-[120px] bg-background rounded-lg p-2 border border-border relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-background rounded-lg"
        width={600}
        height={120}
      />
      {!isRecording && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          {audioStream
            ? "Recording paused"
            : "Speak to see audio visualization"}
        </div>
      )}
    </div>
  );
};

export default AudioVisualizer;
