import React, { useState } from 'react';

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline';

import { DemonCompendium } from './data/demon-compendium';
import FusionRecommender from './data/FusionRecommender';

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

let demonCompendium: DemonCompendium;
let demonCompendiumBeingLoaded: boolean = false;
let demonCompendiumHasBeenSetPromise: Promise<void>;

function loadDesu2DemonCompendium(): void {
  if (demonCompendiumBeingLoaded) { return; }
  const demonListJsonPromise = import("./desu2/demon-list.json").then(importedJson => importedJson.default);
  const fusionChartJsonPromise = import("./desu2/fusion-chart.json").then(importedJson => importedJson.default);
  const presetJsonPromise = import("./desu2/demon-preset.json").then(importedJson => importedJson.default);
  demonCompendiumBeingLoaded = true;
  demonCompendiumHasBeenSetPromise = Promise.all([demonListJsonPromise, fusionChartJsonPromise, presetJsonPromise]).then(loadedJsons => {
    demonCompendium = new DemonCompendium(loadedJsons[0], loadedJsons[1], loadedJsons[2]);
  })
}

export default function App(): JSX.Element {
  const [ , setRerenderTrigger] = useState<boolean>(false);

  console.log("App() called!");

  if (!demonCompendium) {
    loadDesu2DemonCompendium();
    demonCompendiumHasBeenSetPromise.then(() => { setRerenderTrigger(true) });
  }

  let fusionRecommender: JSX.Element = (demonCompendium) ? <FusionRecommender demonCompendium={demonCompendium} /> : <React.Fragment />;
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