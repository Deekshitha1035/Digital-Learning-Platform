import { useState, useRef, useEffect } from 'react';
import { VideoLesson, Language } from '@/app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, CheckCircle2, Clock } from 'lucide-react';
import { getTranslation } from '@/app/utils/localization';

interface VideoLessonViewerProps {
  lesson: VideoLesson;
  language: Language;
  onComplete: () => void;
  onBack: () => void;
}

export function VideoLessonViewer({ lesson, language, onComplete, onBack }: VideoLessonViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchPercentage, setWatchPercentage] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const percentage = (video.currentTime / video.duration) * 100;
      setWatchPercentage(percentage);

      // Mark as completed if watched 80% or more
      if (percentage >= 80 && !hasCompleted) {
        setHasCompleted(true);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setHasCompleted(true);
    };

    const handleError = () => {
      // Silently handle video load errors (expected for demo/placeholder videos)
      console.log('Video playback not available - using demo mode');
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [hasCompleted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        // Check if fullscreen is allowed
        await video.requestFullscreen();
      }
    } catch (error) {
      // Silently handle fullscreen errors (often due to iframe restrictions)
      // Fullscreen API may be blocked by permissions policy in iframe
      console.log('Fullscreen not available in this environment');
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteLesson = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-700">
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">
                {lesson.title[language]}
              </h1>
              <p className="text-sm text-gray-400">
                {lesson.description[language]}
              </p>
            </div>
            {hasCompleted && (
              <Badge className="bg-green-600">
                <CheckCircle2 className="size-4 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Video Player */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-black overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black">
                  {/* Demo Mode Message - Show when no video URL */}
                  {!lesson.videoUrl && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white p-8 text-center">
                      <Play className="size-20 text-blue-400 mb-4 opacity-50" />
                      <h3 className="text-2xl font-bold mb-2">Demo Mode</h3>
                      <p className="text-gray-300 mb-4">
                        This is a placeholder lesson. Teachers can upload real video content.
                      </p>
                      <p className="text-sm text-gray-400">
                        Click "Mark as Complete" below to continue
                      </p>
                    </div>
                  )}
                  
                  {/* Video Element - Only show if videoUrl exists */}
                  {lesson.videoUrl && lesson.videoUrl.trim() !== '' && (
                    <>
                      <video
                        ref={videoRef}
                        className="w-full h-full"
                        src={lesson.videoUrl}
                        poster={lesson.thumbnailUrl}
                        preload="metadata"
                        onError={(e) => {
                          // Prevent error propagation
                          e.preventDefault();
                          console.log('Video load issue - demo mode active');
                        }}
                      />

                      {/* Play/Pause Overlay */}
                      {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <Button
                            onClick={togglePlay}
                            size="lg"
                            className="rounded-full size-20 bg-white bg-opacity-90 hover:bg-opacity-100"
                          >
                            <Play className="size-10 text-gray-900 ml-1" />
                          </Button>
                        </div>
                      )}

                      {/* Video Controls */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                        {/* Progress Bar */}
                        <input
                          type="range"
                          min="0"
                          max={duration}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full mb-2 cursor-pointer"
                        />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={togglePlay}
                              className="text-white hover:bg-white hover:bg-opacity-20"
                            >
                              {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={toggleMute}
                              className="text-white hover:bg-white hover:bg-opacity-20"
                            >
                              {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                            </Button>
                            <span className="text-white text-sm">
                              {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleFullscreen}
                            className="text-white hover:bg-white hover:bg-opacity-20"
                          >
                            <Maximize className="size-5" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lesson Info */}
            <Card>
              <CardHeader>
                <CardTitle>About This Lesson</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{lesson.description[language]}</p>

                <div className="flex flex-wrap gap-2">
                  {lesson.topics.map((topic, idx) => (
                    <Badge key={idx} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4" />
                    <span>{Math.round(lesson.duration / 60)} minutes</span>
                  </div>
                  <div>
                    <span>{lesson.views} views</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Watch Progress</span>
                    <span className="text-sm font-medium">{Math.round(watchPercentage)}%</span>
                  </div>
                  <Progress value={watchPercentage} className="h-2" />
                </div>

                {hasCompleted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle2 className="size-12 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-green-900">Lesson Completed!</p>
                    <p className="text-sm text-green-700 mt-1">Great job! You can now take the quiz.</p>
                    <Button onClick={handleCompleteLesson} className="w-full mt-3">
                      Continue to Quiz
                    </Button>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    {lesson.videoUrl ? (
                      <p className="text-sm text-blue-900">
                        Watch at least 80% of the video to mark this lesson as complete.
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-blue-900 mb-3">
                          This is a demo lesson. Click the button below to mark it as complete.
                        </p>
                        <Button 
                          onClick={() => setHasCompleted(true)} 
                          className="w-full"
                          variant="default"
                        >
                          Mark as Complete
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Points</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>You can pause and resume the video anytime</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Works offline once downloaded</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Your progress is automatically saved</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}