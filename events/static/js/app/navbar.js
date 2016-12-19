import React from 'react';
import { Router, Route, Link, browserHistory } from 'react-router';

import AppBar from 'material-ui/AppBar';
import {Tabs, Tab} from 'material-ui/Tabs';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
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
                            <Tab label="Home" containerElement={<Link to="/" />}/>
                            <Tab label="Calendar" containerElement={<Link to="calendar" />}/>
                            <Tab label="Events" containerElement={<Link to="events" />}/>
                            <Tab label="Companies" containerElement={<Link to="companies" />}/>
                        </Tabs>
                        }
                        iconElementRight={
                            <IconMenu
                                iconButtonElement={
                                  <IconButton><MoreVertIcon /></IconButton>
                                }
                                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                              >
                                <MenuItem containerElement={<Link to="/profile/" />} primaryText="Profile" />
                                <MenuItem href="/auth/logout?next=/" primaryText="Logout" />

                              </IconMenu>}
                    />
                </MuiThemeProvider>
            </header>
        );
    }
}
