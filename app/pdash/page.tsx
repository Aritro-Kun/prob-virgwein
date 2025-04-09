"use client"

import type React from "react"
import { useState, useRef } from "react"
import ReportDisplay from "@/components/ReportDisplay"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, FileAudio, FileVideo, Send, Loader2 } from "lucide-react"

export default function PatientDashboard() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [videoURL, setVideoURL] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<{ message: string; details?: any } | null>(null)
  const [fileType, setFileType] = useState<"audio" | "video" | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioFileInputRef = useRef<HTMLInputElement>(null)
  const videoFileInputRef = useRef<HTMLInputElement>(null)

  const startRecording = async () => {
    audioChunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        setFileType("audio")
        console.log("Audio URL created:", url)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Stop all audio tracks
      const stream = mediaRecorderRef.current.stream
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())
    }
  }

  const handleAudioFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAudioURL(url)
      setFileType("audio")
      // Reset video if any
      if (videoURL) {
        URL.revokeObjectURL(videoURL)
        setVideoURL(null)
      }
    }
  }

  const handleVideoFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setVideoURL(url)
      setFileType("video")
      // Reset audio if any
      if (audioURL) {
        URL.revokeObjectURL(audioURL)
        setAudioURL(null)
      }
    }
  }

  const triggerAudioFileUpload = () => {
    audioFileInputRef.current?.click()
  }

  const triggerVideoFileUpload = () => {
    videoFileInputRef.current?.click()
  }

  const processMedia = async () => {
    if (!audioURL && !videoURL) return

    setProcessing(true)
    setResult(null)
    setError(null)

    try {
      const formData = new FormData()

      if (audioURL) {
        const audioBlob = await fetch(audioURL).then((r) => r.blob())
        formData.append("audio", audioBlob, "recording.mp3")
      } else if (videoURL) {
        const videoBlob = await fetch(videoURL).then((r) => r.blob())
        formData.append("video", videoBlob, "recording.mp4")
      }

      console.log("Sending request to /api/process-audio")

      const response = await fetch("/api/process-audio", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const text = await response.text()
        console.error("Server returned non-OK status:", response.status, text)
        setError({
          message: `Server error: ${response.status}`,
          details: { responseText: text },
        })
        return
      }

      const data = await response.json()
      console.log("Processing result:", data)

      if (data.error) {
        setError({
          message: data.error,
          details: data.details,
        })
        return
      }

      setResult(data.result)
    } catch (error: any) {
      console.error("Error processing media:", error)
      setError({
        message: "Failed to process media",
        details: { errorMessage: error.message },
      })
    } finally {
      setProcessing(false)
    }
  }

  const clearMedia = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
      setAudioURL(null)
    }
    if (videoURL) {
      URL.revokeObjectURL(videoURL)
      setVideoURL(null)
    }
    setFileType(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Patient Review Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Text Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-primary">📝</span> Text Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-32 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Describe your symptoms or concerns..."
            />
          </CardContent>
        </Card>

        {/* Video Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-primary">🎥</span> Video Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              ref={videoFileInputRef}
              accept="video/*"
              className="hidden"
              onChange={handleVideoFileUpload}
            />

            {videoURL ? (
              <div className="space-y-4">
                <video src={videoURL} controls className="w-full rounded-md border" />
                <div className="flex justify-between gap-2">
                  <Button variant="outline" size="sm" onClick={clearMedia}>
                    Clear
                  </Button>
                  <Button onClick={processMedia} disabled={processing} size="sm">
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Process Video
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={triggerVideoFileUpload}
              >
                <div className="text-center">
                  <FileVideo className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="font-medium">Click to upload video</p>
                  <p className="text-sm text-gray-500 mt-1">Max 50MB</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audio Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-primary">🎙️</span> Audio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              ref={audioFileInputRef}
              accept="audio/*"
              className="hidden"
              onChange={handleAudioFileUpload}
            />

            {audioURL ? (
              <div className="space-y-4">
                <audio controls src={audioURL} className="w-full" />
                <div className="flex justify-between gap-2">
                  <Button variant="outline" size="sm" onClick={clearMedia}>
                    Clear
                  </Button>
                  <Button onClick={processMedia} disabled={processing} size="sm">
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Process Audio
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={triggerAudioFileUpload}
                >
                  <FileAudio className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="font-medium">Upload audio file</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">- or -</p>
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "default"}
                    className="w-full"
                  >
                    {isRecording ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Record Audio
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Result Section */}
      {result && (
        <div className="mt-8">
          <ReportDisplay content={result} />
        </div>
      )}

      {/* Error message display */}
      {error && (
        <Card className="mt-8 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <h3 className="font-bold text-red-700 mb-2">Error:</h3>
            <p className="text-red-700">{error.message}</p>

            {error.details?.missingModule && (
              <div className="mt-2 p-2 bg-white rounded text-sm border border-red-100">
                <p>
                  Missing Python module:{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">{error.details.missingModule}</code>
                </p>
                <p className="mt-1">To fix, run this command in your terminal:</p>
                <code className="block p-2 bg-black text-white mt-1 rounded">{error.details.installCommand}</code>
              </div>
            )}

            {error.details?.missing_packages && (
              <div className="mt-2 p-2 bg-white rounded text-sm border border-red-100">
                <p>
                  Missing Python packages:{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">{error.details.missing_packages.join(", ")}</code>
                </p>
                <p className="mt-1">To fix, run this command in your terminal:</p>
                <code className="block p-2 bg-black text-white mt-1 rounded">{error.details.install_command}</code>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submit Section */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <h2 className="text-xl mb-6 flex items-center justify-center font-semibold">
            <span className="mr-2">📤</span> Ready to Submit?
          </h2>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="px-8">
              Submit Review
            </Button>
            <Button size="lg" variant="outline" className="px-8" onClick={clearMedia}>
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
