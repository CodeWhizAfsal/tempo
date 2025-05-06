"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecordingInterface from "@/components/RecordingInterface";
import SummaryDisplay from "@/components/SummaryDisplay";
import SessionHistory from "@/components/SessionHistory";
import { Mic, History } from "lucide-react";

export default function Home() {
  // Load session history from local storage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("sessionHistory");
      if (savedHistory) {
        setSessionHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Error loading from local storage:", error);
    }
  }, []);
  const [activeTab, setActiveTab] = useState("record");
  const [isRecording, setIsRecording] = useState(false);
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<
    Array<{ id: string; date: string; duration: string; summary: string }>
  >([]);

  const handleRecordingComplete = async (audioBlob: Blob, summary?: string) => {
    setIsProcessing(true);

    if (summary) {
      // If we received a summary from the OpenAI API, use it
      setSummary(summary);
      setIsProcessing(false);

      // Calculate approximate duration (this is just an estimate)
      const durationInSeconds = Math.floor(Math.random() * 120) + 30; // Random between 30-150 seconds
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = durationInSeconds % 60;
      const durationStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

      // Add to history
      const newHistoryItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        duration: durationStr,
        summary: summary,
      };

      setSessionHistory((prev) => [newHistoryItem, ...prev]);

      // Save to local storage
      try {
        const existingHistory = JSON.parse(
          localStorage.getItem("sessionHistory") || "[]",
        );
        const updatedHistory = [newHistoryItem, ...existingHistory];
        localStorage.setItem("sessionHistory", JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Error saving to local storage:", error);
      }
    } else {
      // Fallback if no summary was provided
      setTimeout(() => {
        const fallbackSummary =
          "Could not generate a summary. Please try recording again.";
        setSummary(fallbackSummary);
        setIsProcessing(false);
      }, 1000);
    }
  };

  const handleSaveSummary = () => {
    // In a real implementation, you might save to a database
    console.log("Summary saved");
  };

  const handleDeleteHistoryItem = (id: string) => {
    setSessionHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSelectHistoryItem = (summary: string) => {
    setSummary(summary);
    setActiveTab("record");
  };

  const handleShareSummary = () => {
    // In a real implementation, you might open a share dialog or use the Web Share API
    if (navigator.share) {
      navigator
        .share({
          title: "Voice Recording Summary",
          text: summary,
        })
        .catch((err) => console.error("Error sharing:", err));
    } else {
      console.log("Web Share API not supported");
      // Fallback - could show a modal with sharing options
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-background">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              Voice Recording & AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex justify-center mb-6">
                <TabsList>
                  <TabsTrigger
                    value="record"
                    className="flex items-center gap-2"
                  >
                    <Mic className="h-4 w-4" />
                    Record & Summarize
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="flex items-center gap-2"
                  >
                    <History className="h-4 w-4" />
                    History
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="record" className="space-y-8">
                <RecordingInterface
                  isRecording={isRecording}
                  setIsRecording={setIsRecording}
                  onRecordingComplete={handleRecordingComplete}
                />

                <SummaryDisplay
                  summary={summary}
                  isProcessing={isProcessing}
                  onSave={handleSaveSummary}
                  onShare={handleShareSummary}
                />
              </TabsContent>

              <TabsContent value="history">
                <SessionHistory
                  sessions={sessionHistory}
                  onDelete={handleDeleteHistoryItem}
                  onSelect={(session) =>
                    handleSelectHistoryItem(session.summary)
                  }
                  onCopy={(summary) => navigator.clipboard.writeText(summary)}
                  onShare={handleShareSummary}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
