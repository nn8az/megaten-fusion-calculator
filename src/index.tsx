import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';

import FusionRecommender from './FusionRecommender';
import {DemonCompendium} from './data/demon-compendium';
import {default as demonListJSON} from './data/demon-list.json';
import {default as fusionChartJSON} from './data/fusion-chart.json';
import {default as presetJSON} from './data/demon-preset.json';

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline';

const theme = createMuiTheme({
  palette: {
    type: "dark",
  },
  typography: {
    fontFamily: "sans-serif",
    fontSize: 14
  }
});

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <div className="myApp">
          <FusionRecommender demonCompendium={new DemonCompendium(demonListJSON, fusionChartJSON, presetJSON)}/>
        </div>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
