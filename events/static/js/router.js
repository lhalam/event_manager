import React from 'react'
import { render } from 'react-dom'
import { Router, Route, Link, hashHistory } from 'react-router'

import App from './app'
import Calendar from './app/calendar'
import Events from './app/events'
import Team from './app/team'

const Home = () => <div><h1>Home</h1></div>

render(
      <Router history = { hashHistory }>
          <Route component={ App }>
              <Route path = "/" component ={ Home }/>
              <Route path = "/calendar" component = { Calendar }/>
              <Route path = "/event" component ={ Events }/>
              <Route path = "/companies/:cid/teams/:tid" component ={ Team }/>
          </Route>
      </Router>, document.getElementById("root")
);
