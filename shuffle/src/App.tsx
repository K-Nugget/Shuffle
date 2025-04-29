import "./App.css";
import { Menu } from "./components/menu";
import { useState, useRef, useEffect } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";

import { ModeToggle } from "./components/mode-toggle";
import { MusicLibrary } from "./components/music-library";
import { PlaybackBar } from "./components/playback-bar";

import { ThemeProvider } from "./components/theme-provider";

interface MusicFile {
  path: string;
  name: string;
  artist?: string;
  album?: string;
  duration?: number;
}

function App() {
  const [currentTrack, setCurrentTrack] = useState<MusicFile | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element on component mount
  useEffect(() => {
    audioRef.current = new Audio();

    // Set up event listeners
    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    audioRef.current.addEventListener("loadedmetadata", handleMetadataLoaded);
    audioRef.current.addEventListener("ended", handleTrackEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.removeEventListener(
          "loadedmetadata",
          handleMetadataLoaded
        );
        audioRef.current.removeEventListener("ended", handleTrackEnded);
        audioRef.current.pause();
      }
    };
  }, []);

  // Add more debugging
  useEffect(() => {
    const handleAudioError = (e: Event) => {
      if (e.target instanceof HTMLAudioElement) {
        console.error("Audio error details:", {
          error: (e.target as any).error,
          src: e.target.src,
          readyState: e.target.readyState,
        });
      }
    };

    if (audioRef.current) {
      audioRef.current.addEventListener("error", handleAudioError, true);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("error", handleAudioError, true);
      }
    };
  }, [audioRef.current]);

  // Handle track selection
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      try {
        // Fix the import and usage of convertFileSrc
        const fileUrl = convertFileSrc(currentTrack.path);
        console.log("Playing file:", fileUrl);

        audioRef.current.src = fileUrl;
        audioRef.current.load();
        setIsPlaying(true);
        audioRef.current.play().catch((err) => {
          console.error("Error playing track:", err);
          setIsPlaying(false);
        });
      } catch (error) {
        console.error("Error converting file path:", error);
        setIsPlaying(false);
      }
    }
  }, [currentTrack]);

  // Handle play/pause state changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error("Error playing track:", err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleMetadataLoaded = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTrackEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    // You could add logic here to play the next track
  };

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (audioRef.current) {
      audioRef.current.volume = value / 100;
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed top-4 right-4 z-50">
          <ModeToggle />
        </div>
        <div className="fixed top-4 left-4 z-50">
          <Menu />
        </div>
        <div className="mt-16 mb-24 flex-1">
          <MusicLibrary
            onTrackSelect={setCurrentTrack}
            currentTrack={currentTrack}
          />
        </div>

        <PlaybackBar
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
        />
      </main>
    </ThemeProvider>
  );
}

export default App;
