"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Share2,
  Trash2,
  Clock,
} from "lucide-react";

interface SessionItem {
  id: string;
  date: string;
  duration: string;
  summary: string;
}

interface SessionHistoryProps {
  sessions?: SessionItem[];
  onCopy?: (summary: string) => void;
  onShare?: (summary: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (session: SessionItem) => void;
}

const SessionHistory = ({
  sessions = [
    {
      id: "1",
      date: "2023-05-15 14:30",
      duration: "1:24",
      summary:
        "Discussion about the quarterly marketing strategy and budget allocation for Q3. Key points included increasing social media presence and launching a new product line in August.",
    },
    {
      id: "2",
      date: "2023-05-14 10:15",
      duration: "2:05",
      summary:
        "Team meeting regarding the upcoming client presentation. Tasks were assigned to team members with deadlines set for the end of the week.",
    },
    {
      id: "3",
      date: "2023-05-13 16:45",
      duration: "0:48",
      summary:
        "Brief call with vendor about supply chain issues. They promised to resolve delays by next Tuesday.",
    },
  ],
  onCopy = () => {},
  onShare = () => {},
  onDelete = () => {},
  onSelect = () => {},
}: SessionHistoryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(
    null,
  );

  const handleSessionClick = (session: SessionItem) => {
    setSelectedSession(session);
    onSelect(session);
  };

  const handleCopy = (summary: string) => {
    navigator.clipboard.writeText(summary);
    onCopy(summary);
  };

  const handleShare = (summary: string) => {
    onShare(summary);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    if (selectedSession?.id === id) {
      setSelectedSession(null);
    }
  };

  return (
    <Card className="w-full bg-background">
      <CardHeader className="pb-2">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Session History
            </CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <CardContent className="pt-4">
              {sessions.length > 0 ? (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session.id}>
                        <div
                          className={`p-4 rounded-md cursor-pointer transition-colors ${selectedSession?.id === session.id ? "bg-accent" : "hover:bg-muted"}`}
                          onClick={() => handleSessionClick(session)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{session.date}</p>
                              <p className="text-sm text-muted-foreground">
                                Duration: {session.duration}
                              </p>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(session.summary);
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShare(session.summary);
                                }}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Recording
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this
                                      recording? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(session.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          <p className="text-sm line-clamp-2">
                            {session.summary}
                          </p>
                        </div>
                        <Separator className="my-2" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">
                    No recording history yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your recorded sessions will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>

      {selectedSession && isOpen && (
        <CardFooter className="flex flex-col items-start pt-0">
          <div className="w-full p-4 bg-muted/50 rounded-md">
            <h4 className="font-medium mb-1">Selected Recording</h4>
            <p className="text-sm mb-2">
              {selectedSession.date} ({selectedSession.duration})
            </p>
            <p className="text-sm">{selectedSession.summary}</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default SessionHistory;
