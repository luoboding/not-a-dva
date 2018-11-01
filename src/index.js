import React from 'react';
import createHashHistory from 'history/createHashHistory';
import { Route, Router, Switch } from 'react-router-dom';
import { createLogger } from 'redux-logger';
import Todo from './todo';
import * as serviceWorker from './serviceWorker';
import dva from './utils/dva.js';

const app = dva({
  history: createHashHistory(),
});
app.use(createLogger());
app.model(require('./todo/models/model').default);

app.router(({ history }) => {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" component={Todo} />
      </Switch>
    </Router>
  );
});
app.start('#root');

serviceWorker.unregister();
