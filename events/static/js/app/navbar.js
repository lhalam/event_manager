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
                        showMenuIconButton={false}
                        title={
                        <Tabs onChange={this.onChangeTabs} style={styles.tabs}>
                            <Tab label="Home" containerElement={<Link to="/" />}/>
                            <Tab label="Calendar" containerElement={<Link to="calendar" />}/>
                            <Tab label="Events" containerElement={<Link to="events" />}/>
                        </Tabs>
                        }
                        iconElementRight={<FlatButton href="/auth/logout?next=/" label="Logout" />}
                    />
                </MuiThemeProvider>
            </header>
        );
    }
}
