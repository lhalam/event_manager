import React from 'react'
import { render } from 'react-dom'
import { Router, Route, Link, hashHistory } from 'react-router'

import App from './app'
import Calendar from './app/calendar'
import EventList from './app/events'
import Event from './app/event'

const Home = () => <div><h1>Home</h1></div>

render(
      <Router history = { hashHistory }>
          <Route component={ App }>
              <Route path = "/" component ={ Home }/>
              <Route path = "/calendar" component = { Calendar }/>
              <Route path='/events/:event_id' component={Event}/>
              <Route path = "/events" component ={ EventList }/>
          </Route>
      </Router>, document.getElementById("root")
);
