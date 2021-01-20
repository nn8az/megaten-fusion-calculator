import React, { useEffect, useState } from 'react';

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline';

import { DemonCompendium } from './data/demon-compendium';
import FusionByResultsCalculator from './ui-components/fusion-calculator';

import './App.scss';

const theme = createMuiTheme({
  palette: {
    type: "dark",
  },
  typography: {
    fontFamily: "sans-serif",
    fontSize: 14
  }
});

// function loadDesu2DemonCompendium(callback: (demonCompendium: DemonCompendium) => void): void {
//   const demonJsonPromise = import("./data/desu2/demons.json").then(importedJson => importedJson.default);
//   const fusionChartJsonPromise = import("./data/desu2/fusion-chart.json").then(importedJson => importedJson.default);
//   const presetJsonPromise = import("./data/desu2/presets.json").then(importedJson => importedJson.default);
//   Promise.all([demonJsonPromise, fusionChartJsonPromise, presetJsonPromise]).then(loadedJsons => {
//     const newDemonCompendium = new DemonCompendium(loadedJsons[0], loadedJsons[1], undefined, loadedJsons[2]);
//     callback(newDemonCompendium);
//   })
// }

function loadPersona4GoldenDemonCompendium(callback: (demonCompendium: DemonCompendium) => void): void {
  const demonJsonPromise = import("./data/p4g/demons.json").then(importedJson => importedJson.default);
  const fusionChartJsonPromise = import("./data/p4g/fusion-chart.json").then(importedJson => importedJson.default);
  const settingsJsonPromise = import("./data/p4g/fusion-settings.json").then(importedJson => importedJson.default);
  Promise.all([demonJsonPromise, fusionChartJsonPromise, settingsJsonPromise]).then(loadedJsons => {
    const newDemonCompendium = new DemonCompendium(loadedJsons[0], loadedJsons[1], loadedJsons[2]);
    callback(newDemonCompendium);
  })
}

export default function App(): JSX.Element {
  const [demonCompendium, setDemonCompendium] = useState<DemonCompendium | undefined>(undefined);

  useEffect(()=>{
    if (!demonCompendium) {
      loadPersona4GoldenDemonCompendium(setDemonCompendium);
    }
  }, [demonCompendium]);

  let fusionRecommender: JSX.Element = (demonCompendium) ? <FusionByResultsCalculator demonCompendium={demonCompendium} /> : <React.Fragment />;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="myApp">
        <header className="App-header">
          <h1>Megami Tensei Fusion Recommender</h1>
        </header>
        {fusionRecommender}
      </div>
    </ThemeProvider>);
}