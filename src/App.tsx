import React from 'react';

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline';

import { DemonCompendium } from './data/demon-compendium';
import Desu2FusionRecommender from './desu2/Desu2FusionRecommender';

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

export default function App(): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="myApp">
        <header className="App-header">
          <h1>Megami Tensei Fusion Recommender</h1>
        </header>
        <Desu2FusionRecommender />
      </div>
    </ThemeProvider>);
}