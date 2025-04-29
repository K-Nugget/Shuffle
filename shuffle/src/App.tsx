import "./App.css";
import { Menu } from "./components/menu";

import { ModeToggle } from "./components/mode-toggle";
import { PlaybackBar } from "./components/playback-bar";

import { ThemeProvider } from "./components/theme-provider";
import { Card, CardContent } from "./components/ui/card";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="flex min-h-screen items-center justify-center  p-4">
        <div className="fixed top-4 right-4 z-50">
          <ModeToggle />
        </div>
        <div className="fixed top-4 left-4 z-50">
          <Menu />
        </div>
        <Card className="p-6 rounded-2xl shadow-md">
          <CardContent className="text-center">
            <h1 className="text-4xl font-bold">Hello</h1>
          </CardContent>
        </Card>

        <PlaybackBar />
      </main>
    </ThemeProvider>
  );
}

export default App;
