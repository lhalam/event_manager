import React from 'react';
import {List, ListItem} from 'material-ui/List';
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table';
import Avatar from 'material-ui/Avatar';
import Paper from 'material-ui/Paper';
import axios from 'axios';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();


export default class Team extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            name: "",
            company: "",
            members: []
        };
    }
    componentDidMount(){
        axios.get("/api/v1/companies/" + this.props.params.cid + "/teams/" + this.props.params.tid)
            .then((response) => {
                this.setState(response.data);
                console.log(response.data);
            });
    }
    render() {
        return (
            <div>
                <h1>{this.state.name}</h1>
                <h2>{this.state.company}</h2>
                    <MuiThemeProvider muiTheme={getMuiTheme()}>
                        <div className="team-members">
                        <Paper>
                            <p className="members-header">Team members</p>
                            <div className="members-wrap">
                            <Table
                              fixedHeader={true}
                              fixedFooter={false}
                              selectable={true}
                              multiSelectable={true}
                              height={"290px"}
                            >
                              <TableHeader
                                displaySelectAll={true}
                                adjustForCheckbox={true}
                                enableSelectAll={true}
                              >
                                <TableRow>
                                  <TableHeaderColumn tooltip="The Name">Name</TableHeaderColumn>
                                  <TableHeaderColumn tooltip="The Email">Email</TableHeaderColumn>
                                </TableRow>
                              </TableHeader>
                              <TableBody
                                displayRowCheckbox={true}
                                deselectOnClickaway={false}
                                showRowHover={true}
                                stripedRows={false}
                              >
                                {this.state.members.map( (row, index) => (
                                  <TableRow key={index}>
                                      <TableRowColumn><Avatar style={{marginRight: 10}} size={32}>{row["first_name"][0].toUpperCase()}</Avatar>{row["first_name"] + " " + row["last_name"]}</TableRowColumn>
                                      <TableRowColumn>{row["username"]}</TableRowColumn>
                                  </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                                </div>
                        </Paper>
                            </div>
                    </MuiThemeProvider>
            </div>
        );
    }
}
