import React from 'react'
import { Router, Route, Link, browserHistory } from 'react-router'

export default class Navbar extends React.Component {
    render() {
        return (
          <header>
                <nav role="navigation" className="navbar navbar-default">
                    <div className="navbar-header">
                        <button type="button" data-target="#navbarCollapse" data-toggle="collapse" className="navbar-toggle">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                        </button>
                        <Link to="/" className="navbar-brand" >Logo</Link>
                    </div>
                    <div id="navbarCollapse" className="collapse navbar-collapse">
                        <ul className="nav navbar-nav">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/events" >Events</Link></li>
                            <li><Link to="/calendar" >Calendar</Link></li>
                        </ul>
                        <ul className="nav navbar-nav navbar-right">
                            <li><Link to="/auth/login?next=/" >Profile</Link></li>
                        </ul>
                    </div>
                </nav>
            </header>
        );
  }
}
