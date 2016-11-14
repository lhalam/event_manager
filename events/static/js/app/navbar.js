import React from 'react';
import { Router, Route, Link, browserHistory } from 'react-router';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';

import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import RaisedButton from 'material-ui/RaisedButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import {Tabs, Tab} from 'material-ui/Tabs';

// class NavContainer extends React.Component {
//     constructor(props) {
//     super(props);
//     this.state = {
//       value: 3,
//     };
//     this.handleChange = (event, index, value) => this.setState({value});
//   }
//     render(){
//         return (
//             <Toolbar>
//                 <ToolbarGroup firstChild={true}>
//                     <DropDownMenu value={this.state.value} onChange={this.handleChange}>
//                         <MenuItem value={1} primaryText="All Broadcasts" />
//                         <MenuItem value={2} primaryText="All Voice" />
//                         <MenuItem value={3} primaryText="All Text" />
//                         <MenuItem value={4} primaryText="Complete Voice" />
//                         <MenuItem value={5} primaryText="Complete Text" />
//                         <MenuItem value={6} primaryText="Active Voice" />
//                         <MenuItem value={7} primaryText="Active Text" />
//                     </DropDownMenu>
//                 </ToolbarGroup>
//                 <ToolbarGroup>
//                     <ToolbarTitle text="Options" />
//                     <FontIcon className="muidocs-icon-custom-sort" />
//                     <ToolbarSeparator />
//                     <RaisedButton label="Create Broadcast" primary={true} />
//                     <IconMenu
//                         iconButtonElement={
//                           <IconButton touch={true}>
//                             <NavigationExpandMoreIcon />
//                           </IconButton>
//                         }
//                     >
//                         <MenuItem primaryText="Download" />
//                         <MenuItem primaryText="More Info" />
//                     </IconMenu>
//                 </ToolbarGroup>
//             </Toolbar>
//         );
//     }
// }

export default class Navbar extends React.Component {

    render() {    // // constructor(props) {
    // //     super(props);
    // //     this.state = {
    // //       value: 3,
    // //     };
    // //     this.handleChange = (event, index, value) => this.setState({value});
    //   }
        var styles = {
          appBar: {
              height: '64px',
          },
          tabs: {
              width: '20%',
              minWidth: '300px',
          }
        };


        return (
            <header>
                <MuiThemeProvider muiTheme={getMuiTheme()}>
                    <AppBar style={styles.appBar} title={
                        <Tabs onChange={this.onChangeTabs} style={styles.tabs}>
                            <Tab label={<span className="navbar-tab">Calendar</span>} linkButton containerElement={<Link to="calendar" />} rippleColor="rgba(0,0,0,0)" />
                            <Tab label={<span className="navbar-tab">Events</span>} linkButton containerElement={<Link to="event" />} rippleColor="rgba(0,0,0,0)" />
                        </Tabs>
                    } />
                </MuiThemeProvider>
            </header>
        );
    }
}
