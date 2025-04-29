import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import {
  PlayIcon,
  SpeakerLoudIcon,
  SpeakerModerateIcon,
  SpeakerOffIcon,
  SpeakerQuietIcon,
  PauseIcon,
} from "@radix-ui/react-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useRef } from "react";

interface MusicFile {
  path: string;
  name: string;
  artist?: string;
  album?: string;
  duration?: number;
}

interface PlaybackBarProps {
  currentTrack?: MusicFile;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
}

export function PlaybackBar({
  currentTrack,
  isPlaying,
  setIsPlaying,
  currentTime,
  duration,
  onSeek,
  onVolumeChange,
}: PlaybackBarProps) {
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Update seekValue when currentTime changes, but only if we're not seeking
  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(currentTime);
    }
  }, [currentTime, isSeeking]);

  useEffect(() => {
    onVolumeChange(isMuted ? 0 : volume);
  }, [volume, isMuted, onVolumeChange]);

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  // Handle direct clicks on the slider track
  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentTrack || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;

    // Update the UI immediately
    setSeekValue(newTime);

    // Perform the actual seek
    onSeek(newTime);
  };

  // Handle when user starts dragging
  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  // Handle updates during drag
  const handleSeekChange = (values: number[]) => {
    setSeekValue(values[0]);
  };

  // Handle when user releases the slider
  const handleSeekCommit = (values: number[]) => {
    onSeek(values[0]);
    setIsSeeking(false);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-card border-t p-4">
      {/* Use a grid layout with three fixed columns */}
      <div className="grid grid-cols-[250px_1fr_250px] items-center">
        {/* Left section - Song info with fixed width */}
        <div className="flex items-center gap-4 w-[250px]">
          {currentTrack ? (
            <>
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                ♫
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-semibold truncate">
                  {currentTrack.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {currentTrack.artist || "Unknown"}
                </div>
              </div>
            </>
          ) : (
            <>
              <Skeleton className="w-12 h-12 rounded-md" />
              <div>
                <div className="text-sm font-semibold">Select a track</div>
                <div className="text-xs text-muted-foreground">
                  No track playing
                </div>
              </div>
            </>
          )}
        </div>

        {/* Middle section - Playback controls, always centered */}
        <div className="flex flex-col items-center justify-center gap-2 mx-auto w-full max-w-md">
          <div className="flex items-center justify-center">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={!currentTrack}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(seekValue)}
            </span>
            <div
              ref={sliderRef}
              className="flex-1 relative cursor-pointer"
              onClick={handleSliderClick}>
              <Slider
                className="flex-1"
                value={[seekValue]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeekChange}
                onValueCommit={handleSeekCommit}
                onPointerDown={handleSeekStart}
                disabled={!currentTrack}
              />
            </div>
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right section - Volume controls with fixed width */}
        <div className="flex items-center justify-end gap-2 w-[250px]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            disabled={!currentTrack}>
            {isMuted ? (
              <SpeakerOffIcon />
            ) : volume > 75 ? (
              <SpeakerLoudIcon />
            ) : volume > 35 ? (
              <SpeakerModerateIcon />
            ) : volume > 0 ? (
              <SpeakerQuietIcon />
            ) : (
              <SpeakerOffIcon />
            )}
          </Button>
          <Slider
            className="w-24"
            value={[isMuted ? 0 : volume]}
            onValueChange={([v]) => {
              if (v > 0 && isMuted) {
                setIsMuted(false);
              }
              setVolume(v);
            }}
            max={100}
            step={1}
            disabled={!currentTrack}
          />
        </div>
      </div>
    </div>
  );
}
