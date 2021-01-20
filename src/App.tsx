import React, { useEffect, useState } from 'react';

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline';

import { DemonCompendium } from './data/demon-compendium';
import FusionByResultsCalculator from './ui-components/fusion-calculator';

import './App.scss';
import { Tab, Tabs } from '@material-ui/core';

const theme = createMuiTheme({
  palette: {
    type: "dark",
  },
  typography: {
    fontFamily: "sans-serif",
    fontSize: 14
  }
});

function loadDesu2DemonCompendium(callback: (demonCompendium: DemonCompendium) => void): void {
  const demonJsonPromise = import("./data/desu2/demons.json").then(importedJson => importedJson.default);
  const fusionChartJsonPromise = import("./data/desu2/fusion-chart.json").then(importedJson => importedJson.default);
  const presetJsonPromise = import("./data/desu2/presets.json").then(importedJson => importedJson.default);
  Promise.all([demonJsonPromise, fusionChartJsonPromise, presetJsonPromise]).then(loadedJsons => {
    const newDemonCompendium = new DemonCompendium(loadedJsons[0], loadedJsons[1], undefined, loadedJsons[2]);
    callback(newDemonCompendium);
  })
}

function loadPersona4GoldenDemonCompendium(setLoadedCompendiumCallback: (demonCompendium: DemonCompendium) => void): void {
  const demonJsonPromise = import("./data/p4g/demons.json").then(importedJson => importedJson.default);
  const fusionChartJsonPromise = import("./data/p4g/fusion-chart.json").then(importedJson => importedJson.default);
  const settingsJsonPromise = import("./data/p4g/fusion-settings.json").then(importedJson => importedJson.default);
  Promise.all([demonJsonPromise, fusionChartJsonPromise, settingsJsonPromise]).then(loadedJsons => {
    const newDemonCompendium = new DemonCompendium(loadedJsons[0], loadedJsons[1], loadedJsons[2]);
    setLoadedCompendiumCallback(newDemonCompendium);
  })
}

enum GameTab {
  person4Golden = 0,
  devilSurvivor2 = 1
}

function loadGameData(game: GameTab, setLoadedCompendiumCallback: (demonCompendium: DemonCompendium) => void): void {
  switch(game) {
    case GameTab.person4Golden:
      loadPersona4GoldenDemonCompendium(setLoadedCompendiumCallback);
      break;
    case GameTab.devilSurvivor2:
      loadDesu2DemonCompendium(setLoadedCompendiumCallback);
      break;
    default:
      loadPersona4GoldenDemonCompendium(setLoadedCompendiumCallback);
      break;
  }
}

export default function App(): JSX.Element {
  const [demonCompendium, setDemonCompendium] = useState<DemonCompendium | undefined>(undefined);
  const [gameTabPosition, setGameTabPosition] = useState<GameTab>(GameTab.person4Golden);

  useEffect(()=>{
    loadGameData(gameTabPosition, setDemonCompendium);
  }, [gameTabPosition]);

  const handleGameTabChange = (event: React.ChangeEvent<{}>, newValue: GameTab) => {
    setDemonCompendium(undefined);
    setGameTabPosition(newValue);
  };

  let fusionRecommender: JSX.Element | undefined = (demonCompendium) ? <FusionByResultsCalculator demonCompendium={demonCompendium} /> : undefined;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="myApp">
        <header>
          <h1>MegaTen Fusion by Results Calculator</h1>
        </header>
        <Tabs value={gameTabPosition} onChange={handleGameTabChange} aria-label="simple tabs example">
          <Tab label="Persona 4 Golden" />
          <Tab label="Devil Survivor 2" />
        </Tabs>
        <div className="appBody">
          {fusionRecommender}
        </div>
      </div>
    </ThemeProvider>);
}