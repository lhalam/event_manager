import React from 'react';
import { Router, Route, Link, browserHistory } from 'react-router';

import AppBar from 'material-ui/AppBar';
import {Tabs, Tab} from 'material-ui/Tabs';
import FlatButton from 'material-ui/FlatButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';



export default class Navbar extends React.Component {

    render() {

        const styles = {
          tabs: {
              width: '35%',
              minWidth: '200px',
          },
        };

        return (
            <header>
                <MuiThemeProvider >
                    <AppBar
                        style={{
                            marginBottom: '20px'
                        }}
                        showMenuIconButton={false}
                        title={
                        <Tabs onChange={this.onChangeTabs} className="tabs">
                            <Tab label="Events" containerElement={<Link to="events" />}/>
                            <Tab label="Companies" containerElement={<Link to="companies" />}/>
                            <Tab label="Calendar" containerElement={<Link to="calendar" />}/>
                        </Tabs>
                        }
                        iconElementRight={<FlatButton href="/auth/logout?next=/" label="Logout" />}
                    />
                </MuiThemeProvider>
            </header>
        );
    }
}
