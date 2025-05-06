"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import AudioVisualizer from "./AudioVisualizer";
import OpenAI from "openai";

interface RecordingInterfaceProps {
  isRecording?: boolean;
  setIsRecording?: (isRecording: boolean) => void;
  onRecordingComplete?: (audioBlob: Blob, summary?: string) => void;
  onProcessingStart?: () => void;
}

const RecordingInterface = ({
  isRecording = false,
  setIsRecording = () => {},
  onRecordingComplete = () => {},
  onProcessingStart = () => {},
}: RecordingInterfaceProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start recording function
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setIsProcessing(true);
        onProcessingStart();

        try {
          // Process the audio with OpenAI
          const summary = await processAudioWithOpenAI(audioBlob);
          // Pass both the audio blob and the summary to the parent component
          onRecordingComplete(audioBlob, summary);
        } catch (error) {
          console.error("Error processing audio with OpenAI:", error);
          // Return a user-friendly error message instead of throwing
          return "Sorry, there was an error processing your recording. Please check your API key and try again.";
        }
      };

      // Request data every second to ensure we capture audio even if stop fails
      mediaRecorder.start(1000);
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

  // Process audio with OpenAI
  const processAudioWithOpenAI = async (audioBlob: Blob) => {
    try {
      console.log("Processing audio with OpenAI...");

      // Create a file from the audio blob
      const file = new File([audioBlob], "recording.webm", {
        type: "audio/webm",
      });

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", "whisper-1");

      // Send the audio to OpenAI's Whisper API for transcription
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true, // Note: In production, you should use a server-side API
      });

      // First, transcribe the audio to text
      const transcription = await openai.audio.transcriptions.create({
        file: file,
        model: "whisper-1",
      });

      console.log("Transcription complete:", transcription.text);

      // Then, generate a summary of the transcription using GPT
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes transcribed speech. Create a concise summary that captures the key points.",
          },
          {
            role: "user",
            content: transcription.text,
          },
        ],
      });

      const summary = completion.choices[0].message.content;
      console.log("Summary generated:", summary);

      return summary;
    } catch (error) {
      console.error("Error processing audio with OpenAI:", error);
      throw error;
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    try {
      // Only call stop if the state is not already inactive
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }

      // Stop all tracks on the stream
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);
      }

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);
      setRecordingTime(0);
    } catch (error) {
      console.error("Error stopping recording:", error);
      // Even if there's an error, we should reset the state
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

      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch (error) {
          console.error("Error stopping media recorder during cleanup:", error);
        }
      }
    };
  }, [audioStream]);

  // Handle recording state changes from parent component
  useEffect(() => {
    if (isRecording && !mediaRecorderRef.current) {
      startRecording();
    } else if (!isRecording && mediaRecorderRef.current) {
      stopRecording();
    }
  }, [isRecording]);

  return (
    <Card className="w-full max-w-3xl mx-auto bg-background border-border">
      <CardContent className="p-6 flex flex-col items-center">
        <div className="w-full mb-6">
          <AudioVisualizer
            isRecording={isRecording}
            audioStream={audioStream}
          />
          {!isRecording && !isProcessing && !audioStream && (
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
