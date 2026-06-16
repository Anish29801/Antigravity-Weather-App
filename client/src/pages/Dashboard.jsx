import React from 'react';
import { WeatherProvider } from '../context/WeatherContext';
import BackgroundCanvas from '../components/common/BackgroundCanvas';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WeatherCard from '../components/weather/WeatherCard';
import AudioPlayer from '../components/audio/AudioPlayer';
import StatsPanel from '../components/stats/StatsPanel';
import TaskList from '../components/tasks/TaskList';
import NotesEditor from '../components/notes/NotesEditor';
import ControlDeck from '../components/theme/ControlDeck';

export default function Dashboard() {
  return (
    <WeatherProvider>
      {/* HTML5 Ambient Particle backdrop */}
      <BackgroundCanvas />

      {/* App Shell */}
      <div id="app-container" className="flex flex-col gap-6 p-3 md:p-6 w-full max-w-[1600px] min-h-screen relative z-10 mx-auto">
        <Navbar />

        {/* 3-Column Grid Layout */}
        <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1.25fr_1fr] gap-6 flex-grow">
          
          {/* Column 1: Time/Weather & Audio Synth */}
          <div className="flex flex-col gap-6">
            <WeatherCard />
            <AudioPlayer />
          </div>

          {/* Column 2: System Monitor & Focus Task Checklist */}
          <div className="flex flex-col gap-6">
            <StatsPanel />
            <TaskList />
          </div>

          {/* Column 3: Debounced Notes Notepad & Settings Toggles */}
          <div className="flex flex-col gap-6 md:col-span-2 xl:col-span-1 md:grid md:grid-cols-2 xl:flex xl:flex-col">
            <NotesEditor />
            <ControlDeck />
          </div>

        </main>
        
        <Footer />
      </div>
    </WeatherProvider>
  );
}
