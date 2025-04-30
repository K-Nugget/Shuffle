import { useState, useEffect } from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { openUrl } from "@tauri-apps/plugin-opener";

import { ExternalLinkIcon } from "@radix-ui/react-icons";

const MAX_RECENT_FOLDERS = 5;

export function Menu() {
  const [recentFolders, setRecentFolders] = useState<string[]>([]);

  useEffect(() => {
    const loadRecentFolders = async () => {
      try {
        const stored = localStorage.getItem("recentFolders");
        if (stored) {
          setRecentFolders(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Error loading recent folders:", error);
      }
    };
    loadRecentFolders();
  }, []);

  const addRecentFolder = (path: string) => {
    setRecentFolders((prev) => {
      const filtered = prev.filter((folder) => folder !== path);
      const updated = [path, ...filtered].slice(0, MAX_RECENT_FOLDERS);
      localStorage.setItem("recentFolders", JSON.stringify(updated));
      return updated;
    });
  };

  const handleOpenFolder = async () => {
    try {
      const dummyPath = `C:/Folder-${Date.now()}`;
      addRecentFolder(dummyPath);
    } catch (error) {
      console.error("Error opening folder:", error);
    }
  };

  const handleGitHub = async () => {
    try {
      await openUrl("https://github.com/K-Nugget/Shuffle");
    } catch (error) {
      console.error("Error opening GitHub:", error);
    }
  };

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={handleOpenFolder}>Open Folder</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>
              Open Recent
              {recentFolders.length === 0 && " (Empty)"}
            </MenubarSubTrigger>
            <MenubarSubContent>
              {recentFolders.length > 0 ? (
                recentFolders.map((folder, index) => (
                  <MenubarItem
                    key={index}
                    onClick={() => addRecentFolder(folder)}>
                    {folder}
                  </MenubarItem>
                ))
              ) : (
                <MenubarItem disabled>No recent folders</MenubarItem>
              )}
              {recentFolders.length > 0 && (
                <>
                  <MenubarSeparator />
                  <MenubarItem
                    onClick={() => {
                      setRecentFolders([]);
                      localStorage.removeItem("recentFolders");
                    }}>
                    Clear Recent
                  </MenubarItem>
                </>
              )}
            </MenubarSubContent>
          </MenubarSub>{" "}
          <MenubarSeparator />
          <MenubarItem>Settings</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Exit</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>About</MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={handleGitHub}>
            GitHub <ExternalLinkIcon />
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
