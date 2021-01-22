import React from 'react';
import {Route, Switch, useHistory, useParams, useRouteMatch} from 'react-router-dom';

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline';

import { DemonCompendium } from './data/demon-compendium';
import FusionCalculator from './fusion-calculator';

import './app.scss';
import { Tab, Tabs } from '@material-ui/core';
import DemonDisplayer from './demon-displayer';

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

export enum Game {
  person4Golden = 0,
  devilSurvivor2 = 1
}

function loadGameData(game: Game, setLoadedCompendiumCallback: (demonCompendium: DemonCompendium) => void): void {
  switch(game) {
    case Game.person4Golden:
      loadPersona4GoldenDemonCompendium(setLoadedCompendiumCallback);
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
  desu2: Game.devilSurvivor2
}

function getGameUrlParam(game: Game): string | undefined {
  for (const gameStrCode in urlParamToGameMap) {
    if (urlParamToGameMap[gameStrCode] === game) {
      return gameStrCode;
    }
  }
}

export default function App(): JSX.Element {
  const urlParams = useParams<{gameStrCode: string}>();
  const [demonCompendium, setDemonCompendium] = React.useState<DemonCompendium | undefined>(undefined);
  const [currentGameData, setCurrentGameData] = React.useState<Game>(Game.person4Golden);

  React.useEffect(()=>{
      loadGameData(currentGameData, setDemonCompendium);
  }, [currentGameData]);
  
  const history = useHistory();
  const changeGameTab = (event: React.ChangeEvent<{}> | undefined, gameId: Game) => {
    setDemonCompendium(undefined);
    history.push("/" + getGameUrlParam(gameId));
  };

  const routeMatcher = useRouteMatch();

  const gameFromUrlParam: Game | undefined = urlParamToGameMap[urlParams.gameStrCode];
  if (gameFromUrlParam === undefined) {
    changeGameTab(undefined, Game.person4Golden);
    return <React.Fragment />
  } else if (gameFromUrlParam !== currentGameData) {
    setCurrentGameData(gameFromUrlParam);
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
          <h1>MegaTen Fusion by Results Calculator</h1>
        </header>
        <Tabs value={currentGameData} onChange={changeGameTab}>
          <Tab label="Persona 4 Golden" />
          <Tab label="Devil Survivor 2" />
        </Tabs>

        <div className="appBody">
          <Switch>
            <Route path={`${routeMatcher.path}/demon/:demonId`}>
              <DemonDisplayer demonCompendium={demonCompendium} invalidUrlRedirect={routeMatcher.path}/>
            </Route>
            <Route path={`${routeMatcher.path}/`}>
              <FusionCalculator demonCompendium={demonCompendium} />
            </Route>
          </Switch>
        </div>

      </div>
    </ThemeProvider>);
}