import React from 'react';
import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Paper from 'material-ui/Paper';
import axios from 'axios';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import IconButton from 'material-ui/IconButton';
import CancelButton from 'material-ui/svg-icons/navigation/cancel';

import injectTapEventPlugin from 'react-tap-event-plugin';
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
                                    <List>
                                        {
                                            this.state.members.map((member, index) => {
                                                return (
                                                    <ListItem
                                                        key={index}
                                                        primaryText={member.first_name + " " + member.last_name}
                                                        leftAvatar={<Avatar>{member.first_name[0]}</Avatar>}
                                                        rightIconButton={
                                                            <IconButton onClick={() => alert(member.id)}>
                                                                <CancelButton />
                                                            </IconButton>
                                                        }
                                                    />
                                                );
                                            })
                                        }
                                    </List>
                                </div>
                            </Paper>
                        </div>
                    </div>
                </MuiThemeProvider>
        );
    }
}
