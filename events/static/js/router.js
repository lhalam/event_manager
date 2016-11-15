import React from 'react'
import { render } from 'react-dom'
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router'

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import App from './app'
import Calendar from './app/calendar'
import Events from './app/events'

const Home = () => <div><h1>Home</h1></div>

render(
      <Router history = { hashHistory }>
          <Route path="/" component={ App }>
              <IndexRoute component ={ Home }/>
              <Route path = "/calendar" component = { Calendar }/>
              <Route path = "/event" component ={ Events }/>
          </Route>
      </Router>, document.getElementById("root")
);
