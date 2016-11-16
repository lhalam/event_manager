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
import RaisedButton from 'material-ui/RaisedButton';
injectTapEventPlugin();


export default class Team extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            name: "",
            company: "",
            members: [],
            usersToDelete: []
        };
        this.handleSelect = this.handleSelect.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    componentDidMount(){
        axios.get("/api/v1/companies/" + this.props.params.cid + "/teams/" + this.props.params.tid)
            .then((response) => {
                this.setState(response.data);
            });
    }

    handleSelect(selected) {
        console.log(selected);

        let usersToDelete = [];
        if(selected == "all")
            usersToDelete = this.state.members.map((value, index) => index);
        if(selected != "none" && selected != "all")
            usersToDelete = selected;
        this.setState({usersToDelete: usersToDelete}, () => console.log(usersToDelete));
    }

    handleDelete() {
        let membersToDel = this.state.usersToDelete.map((value) => this.state.members[value]);
        axios.put("/api/v1/companies/" + this.props.params.cid + "/teams/" + this.props.params.tid + "/user_assignment/",
            {"member_to_del": membersToDel})
            .then((response) => {
                this.setState({
                    members: response.data['members_to_del'],
                    usersToDelete: []
                });
            });
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
            <div>
                <h1>{this.state.name}</h1>
                <h2>{this.state.company}</h2>
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
                                        onRowSelection={this.handleSelect}
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
                                            {
                                                this.state.members.map((row, index) => (
                                                    <TableRow
                                                        key={index}
                                                        selected={this.state.usersToDelete.indexOf(index) != -1}
                                                    >
                                                        <TableRowColumn>
                                                            <Avatar style={{marginRight: 10}} size={32}>
                                                                {row["first_name"][0].toUpperCase()}
                                                            </Avatar>{row["first_name"] + " " + row["last_name"]}
                                                        </TableRowColumn>
                                                        <TableRowColumn>
                                                            {row["username"]}
                                                        </TableRowColumn>
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                </div>
                                <RaisedButton
                                    label="DELETE SELECTED"
                                    secondary={true}
                                    onTouchTap={this.handleDelete}
                                    disabled={this.state.usersToDelete.length == 0}
                                />
                            </Paper>
                        </div>
                    </div>
                </MuiThemeProvider>
        );
    }
}
