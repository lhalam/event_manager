import React from 'react';
import {List, ListItem} from 'material-ui/List';
import ActionGrade from 'material-ui/svg-icons/action/grade';
import Avatar from 'material-ui/Avatar';
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
            .then((response) => this.setState(response.data));
    }
    render() {
        return (
            <div>
                <h1>{this.state.name}</h1>
                <h2>{this.state.company}</h2>
                <MuiThemeProvider muiTheme={getMuiTheme()}>
                    <List>
                    {
                        this.state.members.map(
                            (value, index) => {
                                return (
                                    <ListItem
                                        key={index}
                                        primaryText={value}
                                        rightAvatar={<Avatar>{value[0].toUpperCase()}</Avatar>}
                                    />
                                );
                            }
                        )
                    }
                    </List>
                </MuiThemeProvider>
            </div>
        );
    }
}
