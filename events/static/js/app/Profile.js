import React from 'react';
import axios from 'axios';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Paper from 'material-ui/Paper';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';

let Dropzone = require('react-dropzone');
let FileInput = require('react-file-input');


export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: '',
            showButtonsPanel: false,
            open: false,
            uploadedImage: false
        };
        this.showButtons = () => this.setState({showButtonsPanel: true});
        this.hideButtons = () => this.setState({showButtonsPanel: false});
        this.openDialog = () => this.setState({open: true});
        this.closeDialog = () => this.setState({open: false, uploadedImage: false});

        this.onDrop = (files) => {
            console.log('Received files: ', files);
            this.sendFile(files[0], 'api/v1/profile/photo/');
            this.setState({uploadedImage: files[0]});
        };

        this.handleFileUpload = (e) => {
            e.preventDefault();
            let file = e.target.files[0];
            console.log('Received file: ', file);
            this.sendFile(file, 'api/v1/profile/photo/');
            this.setState({uploadedImage: file[0]});
        };

        this.sendFile = this.sendFile.bind(this);
        this.getPhoto = this.getPhoto.bind(this);
    }

    getPhoto() {
        if (this.state.profile) {
            return this.state.profile['photo'];
        }
        return <CircularProgress size={60} thickness={7} />;

    }

    sendFile(received_file, URL) {
        let file = new FormData();
        file.append('profile_pic', received_file);
        console.log(file);
        axios.post(URL, file)
            .then((res) => {
                console.log(res)
            })
            .catch((err) => {
                console.log(err.response)
            });
    };


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
        const actions = [
            <FlatButton
                label="Close"
                primary={true}
                onTouchTap={this.closeDialog}
            />
        ];
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
                    { this.state.uploadedImage ?
                            <img src={this.state.uploadedImage.preview} alt="userpic"/>
                         :
                            <div>

                            <RaisedButton
                            type="primary"
                            label="upload photo"
                            className="upload-photo-button"
                            >
                                <FileInput
                                    name="myImage"
                                    accept=".png,.gif,.jpg"
                                    placeholder="My Image"
                                    className="file-upload"
                                    onChange={this.handleFileUpload}
                                />
                            </RaisedButton>
                            <Dropzone ref="dropzone" onDrop={this.onDrop}>
                                <div>Try dropping some files here, or click to select files to upload.</div>
                            </Dropzone>
                            </div>
                    }
                </Dialog>

                </div>
            </MuiThemeProvider>
        );
    }
}