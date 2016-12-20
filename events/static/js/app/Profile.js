import React from 'react';
import axios from 'axios';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Paper from 'material-ui/Paper';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';


export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: '',
            showButtonsPanel: false,
            open: false
        };
        this.showButtons = () => this.setState({showButtonsPanel: true});
        this.hideButtons = () => this.setState({showButtonsPanel: false});

        this.openDialog =() => {this.setState({open: true});
    };

        this.getPhoto = this.getPhoto.bind(this)
    }

    getPhoto() {
        if (this.state.profile) {
            return this.state.profile['photo'];
        }
        return <CircularProgress size={60} thickness={7} />;

    }


    loadProfile() {
        axios.get(`api/v1/profile/${this.props.params.user_id ?
                                                          this.props.params.user_id : ''}`)
            .then((response) => {
                this.setState(response['data']);
            })
            .catch((error) => {
                console.log(error.response);
                this.setState({error: `${error.response.status} ${error.response.statusText}`})
            })
    }

    componentDidMount() {

        this.loadProfile();
        
    }

    render() {
        if (this.state.error) return <h1 className="error-message">{this.state.error}</h1>;

        let profile_photo = this.getPhoto();

        return (
            <MuiThemeProvider>
                <div className="profile">

                    <Paper className="picture-card">
                        <div
                            onMouseEnter={this.showButtons}
                            className="image-container"
                            onMouseLeave={this.hideButtons}
                        >
                             <div className="button-panel">
                               <FlatButton
                                 className="upload-picture"
                                 label="upload photo"
                                 onTouchTap={this.openDialog}
                             />
                            </div>
                            <img className="profile-pic" src={profile_photo} alt="userpic"/>
                        </div>
                    </Paper>

                    <Paper className="info-card">
                        <p>
                            1121212343 fg dfg dfg fdg fdg fdg
                            f dg fdg
                            dfg df
                            g fdgfdgfdgfdgfdgfd1121212343 fg dfg dfg fdg fdg fdg
                        </p>
                        <p>
                            1121212343 fg dfg dfg fdg fdg fdg
                            f dg fdg
                            dfg df
                            g fdgfdgfdgfdgfdgfd1121212343 fg dfg dfg fdg fdg fdg
                        </p>
                        <p>
                            1121212343 fg dfg dfg fdg fdg fdg
                            f dg fdg
                            dfg df
                            g fdgfdgfdgfdgfdgfd1121212343 fg dfg dfg fdg fdg fdg
                        </p>
                    </Paper>

                <Dialog
                    open={this.state.open}
                    actions={actions}
                >
                </Dialog>

                </div>
            </MuiThemeProvider>
        );
    }
}