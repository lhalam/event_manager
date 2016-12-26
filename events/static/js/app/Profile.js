import React from 'react';
import axios from 'axios';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Paper from 'material-ui/Paper';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import {Cropper} from 'react-image-cropper';
import Dropzone from 'react-dropzone';

let User = require('./helpers/User');


export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: '',
            showButtonsPanel: false,
            open: false,
            openDel: false,
            uploadedImage: false,
        };

        this.showButtons = () => this.setState({showButtonsPanel: true});
        this.hideButtons = () => this.setState({showButtonsPanel: false});
        this.openDialog = () => this.setState({open: true});
        this.closeDialog = () => this.setState({open: false, uploadedImage: false});
        this.openDelDialog = () => this.setState({openDel: true});
        this.closeDelDialog = () => this.setState({openDel: false});

        this.crop = () => {
            let image = this.state.uploadedImage;
            let croppedImage = this.dataURItoFile(
                this.refs['cropper'].crop(),
                `${this.state.profile.user.id}-${image.name}`,
                image.type
            );
            console.log(croppedImage);
            this.sendPhoto(croppedImage, 'api/v1/profile/photo/');
        };

        this.sendPhoto = this.sendPhoto.bind(this);
        this.deletePhoto = this.deletePhoto.bind(this);
    }

    dataURItoFile(dataURI, imageTitle, mimeString) {
        let byteString = atob(dataURI.split(',')[1]);
        let ab = new ArrayBuffer(byteString.length);
        let ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        let blob = new Blob([ab], {type: mimeString});
        console.log(blob);
        let file = new File([blob], imageTitle);
        console.log(file);
        return file;
    }

    deletePhoto() {
        this.closeDelDialog();
        this.closeDialog();

        axios.delete(`api/v1/profile/photo/${this.state.profile.user.id}`)
            .then((response) => {
                console.log('response', response.data);
                let profile = this.state.profile;
                profile['photo'] = response.data['photo'];
                profile['key'] = response.data['key'];
                this.setState({
                    profile: profile,

                })
            })
            .catch((error) => {
                console.log(error.response)
            })

    }

    sendPhoto(received_file, URL) {
        console.log('received_file', received_file);
        let file = new FormData();
        file.append('profile_pic', received_file);
        console.log('file', file);
        axios.post(URL, file)
            .then((res) => {
                let profile = this.state.profile;
                profile['photo'] = res.data['photo'];
                profile['key'] = received_file.name;
                this.setState({
                    profile: profile,
                    open: false,
                    uploadedImage: false
                })
            })
            .catch((err) => {
                console.log(err.response)
            });
    };

    loadProfile(url) {
        axios.get(url)
            .then((response) => {
                this.setState(response['data']);
            })
            .catch((error) => {
                console.log(error.response);
                this.setState({error: `${error.response.status} ${error.response.statusText}`})
            })
    }

    getUrl() {
        let parameter = this.props.params.user_id ? this.props.params.user_id.toString() : '';
        return 'api/v1/profile/'+parameter;
    }

    componentWillMount() {
        let url = this.getUrl();
        this.loadProfile(url);
    }

    render() {
        if (this.state.error) return <h1 className="error-message">{this.state.error}</h1>;
        const actions = [
            this.state.uploadedImage ?
                <FlatButton
                label="Set photo"
                disabled={!(this.state.uploadedImage)}
                primary={true}
                onTouchTap={this.crop}
                /> : null,
            this.state.profile &&
            !this.state.uploadedImage &&
            this.state.profile.key != "default_photo.jpg" ?
                <RaisedButton
                className="delete-button"
                label="Delete photo"
                secondary={true}
                onTouchTap={this.openDelDialog}
                /> : null,
            <FlatButton
                label="Close"
                primary={true}
                onTouchTap={this.closeDialog}
            />,

        ];

        let dialogContent = (this.state.uploadedImage ?
                <Cropper
                    className="pic-to-crop"
                    src={this.state.uploadedImage.preview}
                    ref="cropper"
                    allowNewSelection={false}
                /> :
            <Dropzone
                accept="image/*"
                ref="dropzone"
                onDrop={(files) => this.setState({uploadedImage: files[0]}).bind(this)}
            >
                <div>Try dropping some files here, or click to select files to upload.</div>
            </Dropzone>
        );

        return (
            <MuiThemeProvider>
                <div className="profile">

                    <Paper className="picture-card">
                        <div
                            onMouseEnter={this.showButtons}
                            className="image-container"
                            onMouseLeave={this.hideButtons}
                        >
                            { this.state['owner'] ?
                                <div className="button-panel">

                                    <FlatButton
                                        className="upload-picture"
                                        label={
                                            this.state.profile.key == 'default_photo.jpg' ?
                                                "upload photo" : "change photo"
                                        }
                                        onTouchTap={this.openDialog}
                                    />

                                </div> : null
                            }
                            {
                                this.state.profile ?
                                    <img className="profile-pic" src={this.state.profile['photo']} alt="userpic"/>
                                     :
                                    <CircularProgress size={200} thickness={7} />
                            }

                        </div>
                    </Paper>

                    <Paper className="info-card">
                        {
                            this.state.profile ?
                                User.getFullName(this.state.profile.user) : null
                        }
                    </Paper>

                    <Dialog
                        open={this.state.open}
                        actions={actions}
                        contentClassName="dialog-image-window"
                    >
                       {dialogContent}
                    </Dialog>

                    <Dialog
                        actions={
                            [
                                <FlatButton
                                    label="Cancel"
                                    primary={true}
                                    onTouchTap={this.closeDelDialog}
                                />,
                                <RaisedButton
                                    className="delete-button"
                                    label="Delete"
                                    primary={true}
                                    style={{backgroundColor: "#f44336", color: "white", marginLeft: "10px"}}
                                    onTouchTap={this.deletePhoto}
                                />,
                            ]
                        }
                        modal={true}
                        open={this.state.openDel}
                        onRequestClose={this.closeDelDialog}
                        contentClassName="dialog-window"
                    >
                        Are you sure you want delete the voting?
                    </Dialog>

                </div>
            </MuiThemeProvider>
        );
    }
}