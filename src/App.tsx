import React from 'react';
import {useHistory, useParams} from 'react-router-dom';

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline';

import { DemonCompendium } from './data/demon-compendium';
import FusionCalculator from './fusion-calculator';

import './App.scss';
import { Tab, Tabs } from '@material-ui/core';

const theme = createMuiTheme({
  palette: {
    type: "dark",
  },
  typography: {
    fontFamily: "sans-serif"
  }
});

function loadDesu2DemonCompendium(callback: (demonCompendium: DemonCompendium) => void): void {
  const demonJsonPromise = import("./data/desu2/demons.json").then(importedJson => importedJson.default);
  const fusionChartJsonPromise = import("./data/desu2/fusion-chart.json").then(importedJson => importedJson.default);
  const settingsJsonPromise = import("./data/desu2/fusion-settings.json").then(importedJson => importedJson.default);
  const presetJsonPromise = import("./data/desu2/presets.json").then(importedJson => importedJson.default);
  Promise.all([demonJsonPromise, fusionChartJsonPromise, settingsJsonPromise, presetJsonPromise]).then(loadedJsons => {
    const newDemonCompendium = new DemonCompendium(loadedJsons[0], loadedJsons[1], loadedJsons[2], loadedJsons[3]);
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

function loadPersona5RoyalDemonCompendium(setLoadedCompendiumCallback: (demonCompendium: DemonCompendium) => void): void {
  const demonJsonPromise = import("./data/p5r/demons.json").then(importedJson => importedJson.default);
  const fusionChartJsonPromise = import("./data/p5r/fusion-chart.json").then(importedJson => importedJson.default);
  const settingsJsonPromise = import("./data/p5r/fusion-settings.json").then(importedJson => importedJson.default);
  Promise.all([demonJsonPromise, fusionChartJsonPromise, settingsJsonPromise]).then(loadedJsons => {
    const newDemonCompendium = new DemonCompendium(loadedJsons[0], loadedJsons[1], loadedJsons[2]);
    setLoadedCompendiumCallback(newDemonCompendium);
  })
}

export enum Game {
  person4Golden = 0,
  persona5Royal = 1,
  devilSurvivor2 = 2
}

function loadGameData(game: Game, setLoadedCompendiumCallback: (demonCompendium: DemonCompendium) => void): void {
  switch(game) {
    case Game.person4Golden:
      loadPersona4GoldenDemonCompendium(setLoadedCompendiumCallback);
      break;
    case Game.persona5Royal:
      loadPersona5RoyalDemonCompendium(setLoadedCompendiumCallback);
      break;
    case Game.devilSurvivor2:
      loadDesu2DemonCompendium(setLoadedCompendiumCallback);
      break;
    default:
      loadPersona4GoldenDemonCompendium(setLoadedCompendiumCallback);
      break;
  }
}

const urlParamToGameMap: { [gameStr: string]: Game } = {
  p4g: Game.person4Golden,
  p5r: Game.persona5Royal,
  desu2: Game.devilSurvivor2
}

function getGameUrlPath(game: Game): string | undefined {
  for (const gameStrCode in urlParamToGameMap) {
    if (urlParamToGameMap[gameStrCode] === game) {
      return gameStrCode;
    }
  }
}

export default function App(): JSX.Element {
  const urlParams = useParams<{gameStrCode: string}>();
  const [demonCompendium, setDemonCompendium] = React.useState<DemonCompendium | undefined>(undefined);
  const [currentGame, setCurrentGame] = React.useState<Game>(Game.person4Golden);

  React.useEffect(()=>{
      loadGameData(currentGame, setDemonCompendium);
  }, [currentGame]);
  
  const history = useHistory();
  
  const changeGameTabHandler = (event: React.ChangeEvent<{}> | undefined, gameId: Game) => {
    if (gameId !== currentGame) {
      setDemonCompendium(undefined);
    }
    history.push("/megaten-fusion-calculator/" + getGameUrlPath(gameId));
  };

  const gameFromUrlParam: Game | undefined = urlParamToGameMap[urlParams.gameStrCode];
  if (gameFromUrlParam === undefined) {
    changeGameTabHandler(undefined, Game.person4Golden);
    return <React.Fragment />
  } else if (gameFromUrlParam !== currentGame) {
    setCurrentGame(gameFromUrlParam);
    return <React.Fragment />
  }

  if (!demonCompendium) {
    return <React.Fragment />
  }
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="myApp">

        <header>
          <h1>MegaTen Fusion Calculator</h1>
        </header>
        <Tabs value={currentGame} onChange={changeGameTabHandler}>
          <Tab label="Persona 4 Golden" />
          <Tab label="Persona 5 Royal" />
          <Tab label="Devil Survivor 2" />
        </Tabs>

        <div className="appBody">
          <FusionCalculator demonCompendium={demonCompendium} />
        </div>

      </div>
    </ThemeProvider>);
}