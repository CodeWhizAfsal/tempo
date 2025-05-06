"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecordingInterface from "@/components/RecordingInterface";
import SummaryDisplay from "@/components/SummaryDisplay";
import SessionHistory from "@/components/SessionHistory";
import { Mic, History } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("record");
  const [isRecording, setIsRecording] = useState(false);
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<
    Array<{ id: string; date: string; summary: string }>
  >([]);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true);

    // Simulate API call to OpenAI for processing
    // In a real implementation, you would send the audio to OpenAI API here
    setTimeout(() => {
      const mockSummary =
        "This is a simulated summary of the recorded speech. In a real implementation, this would be the result from OpenAI's API processing the audio recording and generating a concise summary of the spoken content.";
      setSummary(mockSummary);
      setIsProcessing(false);

      // Add to history
      const newHistoryItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        summary: mockSummary,
      };

      setSessionHistory((prev) => [newHistoryItem, ...prev]);
    }, 2000);
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
                />
              </TabsContent>

              <TabsContent value="history">
                <SessionHistory
                  history={sessionHistory}
                  onDelete={handleDeleteHistoryItem}
                  onSelect={handleSelectHistoryItem}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
