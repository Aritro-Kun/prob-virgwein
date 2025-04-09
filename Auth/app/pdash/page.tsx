'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, Video, Mic, FileText, Send, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast, Toaster } from 'sonner';

export default function PatientDashboard() {
    console.log('PatientDashboard rendered');

    const [text, setText] = useState('');
    const [video, setVideo] = useState<File | null>(null);
    const [audio, setAudio] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const patientName = 'John Doe';

    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [audioURL, setAudioURL] = useState<string>('');
    const [visualLevels, setVisualLevels] = useState<number[]>([]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const startRecording = async () => {
        setAudioURL('');
        setAudio(null);
        setRecordedChunks([]);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);

            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            source.connect(analyser);
            analyser.fftSize = 64;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const drawBars = () => {
                analyser.getByteFrequencyData(dataArray);
                const levels = Array.from(dataArray.slice(0, 10)).map((val) => val / 255);
                setVisualLevels(levels);
                if (isRecording) requestAnimationFrame(drawBars);
            };
            drawBars();

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    console.log('Data available, pushing chunk of size:', e.data.size);
                    setRecordedChunks((prev) => [...prev, e.data]);
                }
            };

            recorder.onstop = () => {
                console.log('Recorder stopped');
                console.log('Recorded Chunks:', recordedChunks);
                const validChunks = recordedChunks.filter(chunk => chunk.size > 0);

                if (validChunks.length === 0) {
                    toast.error('Recording failed. No audio data was captured.');
                    return;
                }

                const blob = new Blob(validChunks, { type: 'audio/ogg; codecs=opus' });
                try {
                    const url = URL.createObjectURL(blob);
                    console.log('Audio URL created:', url);
                    setAudioURL(url);
                    const file = new File([blob], 'recorded_audio.ogg', { type: 'audio/ogg; codecs=opus' });
                    setAudio(file);
                    toast.success('Audio recorded successfully');
                } catch (err) {
                    console.error('Failed to create object URL:', err);
                    toast.error('Failed to generate audio preview.');
                }
            };

            recorder.start();
            setIsRecording(true);
        } catch (error) {
            toast.error('Microphone access denied or not available.');
            console.error(error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const handleLogout = () => {
        toast.success('Logged out successfully');
    };

    const handleFileUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'video' | 'audio'
    ) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        const isValidType =
            type === 'video'
                ? file.type.startsWith('video/')
                : file.type.startsWith('audio/');

        if (!isValidType) {
            toast.error(`Please upload a valid ${type} file`);
            return;
        }

        const maxSize = type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error(
                `${type} files must be under ${type === 'video' ? '50MB' : '5MB'}`
            );
            return;
        }

        type === 'video' ? setVideo(file) : setAudio(file);
    };

    const handleSubmit = async () => {
        if (!text && !video && !audio) {
            toast.error('Please add text, video, or audio before submitting');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            if (text) formData.append('text', text);
            if (video) formData.append('video', video);
            if (audio) formData.append('audio', audio);

            await new Promise((res) => setTimeout(res, 1000));

            toast.success('Your review has been sent to the admin dashboard');
            setText('');
            setVideo(null);
            setAudio(null);
            setAudioURL('');
            setVisualLevels([]);
        } catch (err) {
            toast.error('Error submitting your review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClearAll = () => {
        setText('');
        setVideo(null);
        setAudio(null);
        setAudioURL('');
        setVisualLevels([]);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Toaster position="top-right" />

            <nav className="w-full px-6 py-4 bg-white shadow-sm flex items-center justify-between sticky top-0 z-50">
                <h1 className="text-xl font-semibold text-primary">FeedbackAI</h1>
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="p-2 rounded-full hover:bg-muted transition"
                    >
                        <User className="w-6 h-6 text-primary" />
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow z-50 p-4">
                            <p className="text-sm font-medium text-gray-800 mb-2">
                                {patientName}
                            </p>
                            <Button
                                variant="outline"
                                className="w-full text-sm"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        </div>
                    )}
                </div>
            </nav>

            <main className="p-6 space-y-8">
                <h2 className="text-3xl font-bold">Patient Review Dashboard</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-500" />
                                Text Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Describe your symptoms or concerns..."
                                className="min-h-[150px] bg-muted/50"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Video className="h-5 w-5 text-purple-500" />
                                Video Upload
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <label className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed rounded-lg bg-muted/50 hover:bg-muted/80 transition cursor-pointer">
                                <Upload className="h-8 w-8" />
                                <span className="text-sm font-medium">
                                    {video ? video.name : 'Click to upload video'}
                                </span>
                                <Input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, 'video')}
                                />
                                <p className="text-xs text-muted-foreground">Max 50MB</p>
                            </label>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Mic className="h-5 w-5 text-green-500" />
                                Audio Upload
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between gap-4 mb-4 p-3 bg-muted/40 rounded-lg border">
                                <span className="text-sm font-medium">
                                    {isRecording ? 'Recording in progress...' : 'Record audio below'}
                                </span>
                                <Button
                                    variant={isRecording ? 'destructive' : 'default'}
                                    size="sm"
                                    onClick={isRecording ? stopRecording : startRecording}
                                >
                                    {isRecording ? 'Stop' : 'Record'}
                                </Button>
                            </div>
                            <div className="flex items-center gap-1 h-8 mb-4">
                                {visualLevels.map((level, idx) => (
                                    <div
                                        key={idx}
                                        className="w-1 bg-green-500 transition-all duration-75"
                                        style={{ height: `${level * 100}%` }}
                                    />
                                ))}
                            </div>
                            {audioURL && (
                                <div className="mb-4">
                                    <audio controls src={audioURL} className="w-full rounded" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-primary/20">
                    <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
                        <div className="flex items-center gap-2 text-lg font-medium">
                            <Send className="h-5 w-5 text-primary" />
                            Ready to Submit?
                        </div>
                        <div className="flex gap-4">
                            <Button
                                size="lg"
                                onClick={handleSubmit}
                                disabled={(!text && !video && !audio) || isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleClearAll}
                                disabled={!text && !video && !audio}
                            >
                                Clear All
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            All submissions will be reviewed by the admin team
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
