import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readDir } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface MusicFile {
  path: string;
  name: string;
  artist?: string;
  album?: string;
  duration?: number;
}

const SUPPORTED_EXTENSIONS = ["mp3", "wav", "flac", "ogg"];

interface MusicLibraryProps {
  onTrackSelect?: (track: MusicFile) => void;
  currentTrack?: MusicFile;
}

export function MusicLibrary({
  onTrackSelect,
  currentTrack,
}: MusicLibraryProps) {
  const [files, setFiles] = useState<MusicFile[]>([]);
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleOpenFolder() {
    try {
      // Open folder selection dialog
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Music Folder",
      });

      if (selected) {
        setFolderPath(selected as string);
        setLoading(true);

        const musicFiles = await loadMusicFilesFrom(selected as string);
        setFiles(musicFiles);

        setLoading(false);
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
      setLoading(false);
    }
  }

  async function loadMusicFilesFrom(dirPath: string): Promise<MusicFile[]> {
    const musicFiles: MusicFile[] = [];

    async function processEntries(entries: any[], currentPath: string) {
      for (const entry of entries) {
        const fullPath = `${currentPath}${
          currentPath.endsWith("/") || currentPath.endsWith("\\") ? "" : "/"
        }${entry.name}`;

        if (entry.isDirectory) {
          try {
            const subEntries = await readDir(fullPath, { recursive: false });
            await processEntries(subEntries, fullPath);
          } catch (err) {
            console.error(`Error reading subdirectory ${fullPath}:`, err);
          }
        } else if (entry.isFile) {
          const extension = entry.name.split(".").pop()?.toLowerCase();

          if (extension && SUPPORTED_EXTENSIONS.includes(extension)) {
            try {
              // Extract filename without extension to use as title if metadata is missing
              const nameWithoutExt = entry.name.replace(/\.[^/.]+$/, "");

              // Add basic file info first
              const musicFile: MusicFile = {
                path: fullPath,
                name: nameWithoutExt, // Use filename without extension as fallback title
                artist: "Unknown", // Default values
                album: "Unknown",
                duration: 0,
              };

              // TODO: Add metadata extraction here
              // For now, we'll use the basic info

              musicFiles.push(musicFile);
            } catch (error) {
              console.error(`Error processing music file ${fullPath}:`, error);
            }
          }
        }
      }
    }

    try {
      const entries = await readDir(dirPath, { recursive: false });
      await processEntries(entries, dirPath);
      return musicFiles;
    } catch (err) {
      console.error("Error reading directory:", err);
      return [];
    }
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-180px)]">
      <CardHeader className="flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <CardTitle>
            <h2 className="text-xl font-bold">Music Library</h2>
          </CardTitle>
          <Button onClick={handleOpenFolder}>Open Folder</Button>
        </div>
        <CardDescription>{folderPath}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : files.length > 0 ? (
          <div className="border rounded-md h-full flex flex-col">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-2 p-2 border-b bg-muted font-medium text-sm sticky top-0 z-10">
              <div className="col-span-5">Title</div>
              <div className="col-span-3">Artist</div>
              <div className="col-span-3">Album</div>
              <div className="col-span-1 text-right">Duration</div>
            </div>

            {/* Music Files List - Enhanced Scrollable */}
            <div className="divide-y overflow-y-auto flex-1 scroll-smooth scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/30">
              {files.map((file, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-12 gap-2 p-3 hover:bg-muted/80 transition-colors duration-150 items-center cursor-pointer ${
                    currentTrack?.path === file.path ? "bg-primary/10" : ""
                  }`}
                  onClick={() => onTrackSelect?.(file)}>
                  <div className="col-span-5 font-medium truncate">
                    {file.name}
                  </div>
                  <div className="col-span-3 text-muted-foreground truncate">
                    {file.artist || "Unknown"}
                  </div>
                  <div className="col-span-3 text-muted-foreground truncate">
                    {file.album || "Unknown"}
                  </div>
                  <div className="col-span-1 text-right text-muted-foreground">
                    {file.duration ? formatDuration(file.duration) : "--:--"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {folderPath
              ? "No music files found"
              : "Select a folder to load music"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
