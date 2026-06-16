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
      <div id="app-container">
        <Navbar />

        {/* 3-Column Grid Layout */}
        <main id="dashboard-grid">
          
          {/* Column 1: Time/Weather & Audio Synth */}
          <div className="grid-column">
            <WeatherCard />
            <AudioPlayer />
          </div>

          {/* Column 2: System Monitor & Focus Task Checklist */}
          <div className="grid-column">
            <StatsPanel />
            <TaskList />
          </div>

          {/* Column 3: Debounced Notes Notepad & Settings Toggles */}
          <div className="grid-column">
            <NotesEditor />
            <ControlDeck />
          </div>

        </main>
        
        <Footer />
      </div>
    </WeatherProvider>
  );
}
