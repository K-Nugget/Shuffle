import { useState } from "react";
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

export function PlaybackBar() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-background border-t p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-md" />
        <div>
          <div className="text-sm font-semibold">Track Name</div>
          <div className="text-xs text-muted-foreground">Artist Name</div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </Button>
        </div>
        <Slider className="w-64" defaultValue={[0]} max={100} step={0.1} />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}>
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
        />
      </div>
    </div>
  );
}
