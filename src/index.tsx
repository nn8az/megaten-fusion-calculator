import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import {
  Switch,
  Route,
  Router
} from 'react-router-dom';
import { createBrowserHistory } from 'history';

import App from './app';

const history = createBrowserHistory();
ReactDOM.render(
  <React.StrictMode>
    <Router history={history}>
      <Switch>
        <Route path={["/megaten-fusion-recommender/:gameStrCode?","/"]}>
          <App/>
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

ReactDOM.render(<GitHubPageRedirect />,
document.getElementById('gitHubPageRedirector'));

function GitHubPageRedirect(): JSX.Element {
  // Single Page Apps for GitHub Pages
  // MIT License
  // https://github.com/rafgraph/spa-github-pages
  // This script checks to see if a redirect is present in the query string,
  // converts it back into the correct url and adds it to the
  // browser's history using window.history.replaceState(...),
  // which won't cause the browser to attempt to load the new url.
  // When the single page app is loaded further down in this file,
  // the correct url will be waiting in the browser's history for
  // the single page app to route accordingly.
  (function(loc) {
    if (loc.search[1] === '/' ) {
      var decoded = loc.search.slice(1).split('&').map(function(s) { 
        return s.replace(/~and~/g, '&')
      }).join('?');
      window.history.replaceState(null, "",
          loc.pathname.slice(0, -1) + decoded + loc.hash
      );
    }
  }(window.location))
  return <React.Fragment />
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
