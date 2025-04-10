'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar,  User, FileText, ChevronRight, AlertCircle, CheckCircle, Clock as PendingIcon } from 'lucide-react';
import { useState } from 'react';

type Patient = {
  id: string;
  name: string;
  email: string;
  lastSubmission: string;
  summary: string;
  status: 'pending' | 'reviewed' | 'urgent';
};

export default function AdminDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Mock data
  const patients: Patient[] = [
    {
      id: '1',
      name: 'Olivia Martin',
      email: 'olivia.martin@email.com',
      lastSubmission: new Date().toISOString(),
      summary: 'Patient reports persistent headaches and fatigue over the past week. No fever reported. Sleep patterns irregular. Recommended: Follow-up neurological exam and blood work.',
      status: 'reviewed'
    },
    // Add more patients...
  ];

  const statusIcons = {
    pending: <PendingIcon className="h-4 w-4 text-yellow-500" />,
    reviewed: <CheckCircle className="h-4 w-4 text-green-500" />,
    urgent: <AlertCircle className="h-4 w-4 text-red-500" />
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Compact Sidebar */}
      <div className="w-64 border-r bg-muted/40">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Patient Reviews</h2>
          <p className="text-xs text-muted-foreground mt-1">{patients.length} submissions</p>
        </div>
        <ScrollArea className="h-[calc(100vh-65px)]">
          <div className="space-y-1 p-2">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className={`p-3 rounded-md cursor-pointer transition-colors ${selectedPatient?.id === patient.id ? 'bg-secondary' : 'hover:bg-muted/50'}`}
                onClick={() => setSelectedPatient(patient)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0">
                      {statusIcons[patient.status]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{patient.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{patient.email}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDateTime(patient.lastSubmission)}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Dense Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedPatient ? (
          <>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedPatient.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedPatient.email}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDateTime(selectedPatient.lastSubmission)}
                  </span>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {/* AI Summary Card */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div className="bg-blue-500/10 p-1.5 rounded-lg">
                        <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M12 8V4H8" />
                          <rect x="4" y="8" width="16" height="12" rx="2" />
                        </svg>
                      </div>
                      AI SUMMARY REPORT
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="prose prose-sm max-w-none bg-muted/20 p-3 rounded-md">
                      <p className="whitespace-pre-line text-sm">{selectedPatient.summary}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Generated: {formatDateTime(selectedPatient.lastSubmission)}
                    </p>
                  </CardContent>
                </Card>

                {/* Patient Submissions */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      PATIENT SUBMISSIONS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Text Summary */}
                      <div className="bg-muted/20 p-3 rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="text-xs font-medium">TEXT SUMMARY</span>
                        </div>
                        <p className="text-xs mt-2 line-clamp-2">Patient&apos;s written description of symptoms would appear here...</p>
                      </div>

                      {/* Video Recording */}
                      <div className="bg-muted/20 p-3 rounded-md">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                          </svg>
                          <span className="text-xs font-medium">VIDEO</span>
                        </div>
                        <p className="text-xs mt-2">3:42 duration</p>
                      </div>

                      {/* Audio Recording */}
                      <div className="bg-muted/20 p-3 rounded-md">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          </svg>
                          <span className="text-xs font-medium">AUDIO</span>
                        </div>
                        <p className="text-xs mt-2">2:18 duration</p>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full mt-3 text-xs">
                      VIEW FULL DETAILS
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center p-6 max-w-md">
              <User className="h-8 w-8 mx-auto mb-3" />
              <h3 className="text-lg font-medium">No patient selected</h3>
              <p className="text-sm mt-1">Select a patient from the sidebar to view their report</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}