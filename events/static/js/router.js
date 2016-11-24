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
import CreateTeam from './app/AddTeamWindow'
import CompaniesList from './app/companies'
import Company from './app/Company';

const Home = () => <div><h1>Home</h1></div>;

render(
      <Router history = { hashHistory }>
          <Route path="/" component={ App }>
              <IndexRoute component ={ Home }/>
              <Route path = "/calendar" component = { Calendar }/>
              <Route path = "/events/:event_id" component={Event}/>
              <Route path = "/events" component ={ EventList }/>
              <Route path = "/companies" component ={ CompaniesList }/>
              <Route path = "/companies/:company_id" component ={ Company }/>
              <Route path = "/companies/:cid/teams/:tid" component ={ Team }/>
              <Route path = "/test" component ={ CreateTeam }/>
          </Route>
      </Router>, document.getElementById("root")
);
