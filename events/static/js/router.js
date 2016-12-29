import React from 'react'
import { render } from 'react-dom'
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router'

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import App from './app'
import Calendar from './app/calendar'
import EventList from './app/events'
import Event from './app/event'
import Team from './app/team'
import Profile from './app/Profile'
import CompaniesList from './app/companies'
import Company from './app/Company';

const Home = () => <div><h1>Home</h1></div>;

render(
      <Router history = { hashHistory }>
          <Route path="/" component={ App }>
              <IndexRoute component ={ EventList }/>
              <Route path = "/"  component ={ EventList }>
                  <Route path = "/events"/>
              </Route>
              <Route path = "/events/:event_id" component={Event}/>
              <Route path = "/calendar" component = { Calendar }/>
              <Route path = "/companies" component ={ CompaniesList }/>
              <Route path = "/companies/:company_id" component ={ Company }/>
              <Route path = "/companies/:cid/teams/:tid" component ={ Team }/>
              <Route path = "/profile/:user_id" component ={ Profile }/>
              <Route path = "/profile/" component ={ Profile }/>
          </Route>
      </Router>, document.getElementById("root")
);
