import React from 'react';
import axios from 'axios';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Paper from 'material-ui/Paper';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';
import TextField from 'material-ui/TextField';
import {Cropper} from 'react-image-cropper';
import Dropzone from 'react-dropzone';

let User = require('./helpers/User');

String.prototype.hashCode = function() {
  let hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
};

const maximumImageSize = 2*1024*1024;

export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            open: false,
            message: null,
            openDel: false,
            openSize: false,
            openEdit: false,
            openSnackbar: false,
            uploadedImage: false,
            showButtonsPanel: false,
        };

        this.showButtons = () => this.setState({showButtonsPanel: true});
        this.hideButtons = () => this.setState({showButtonsPanel: false});
        this.openDialog = () => this.setState({open: true});
        this.closeDialog = () => this.setState({open: false, uploadedImage: false});
        this.openDelDialog = () => this.setState({openDel: true});
        this.closeDelDialog = () => this.setState({openDel: false});
        this.openEditDialog = () => this.setState({openEdit: true});
        this.handleEducation = (event) => this.setState({education: event.target.value});
        this.handleJob = (event) => this.setState({job: event.target.value});

        this.onDrop = (files) => {
            let image = files[0];
            if (image.size > maximumImageSize) {
                this.setState({openSize: true})
            } else {
                this.setState({uploadedImage: image});
            }
        };

        this.crop = () => {
            let image = this.state.uploadedImage;
            let username = this.state.profile['user'].username;
            let hash = username.hashCode();
            let type = image.name.split('.').splice(-1, 1)[0].toLowerCase();
            let croppedImage = this.dataURItoFile(
                this.refs['cropper'].crop(),
                `${hash}.${type}`,
                image.type
            );
            this.sendPhoto(croppedImage, 'api/v1/profile/photo/');
        };

        this.sendPhoto = this.sendPhoto.bind(this);
        this.sendProfileData = this.sendProfileData.bind(this);
        this.deletePhoto = this.deletePhoto.bind(this);
        this.handleEditClose = this.handleEditClose.bind(this);
    }

    handleEditClose() {
        let profile = this.state.profile;
        this.setState({
            openEdit: false,
            education: profile.education,
            job: profile.job,
        });
    }

    dataURItoFile(dataURI, imageTitle, mimeString) {
        let byteString = atob(dataURI.split(',')[1]);
        let ab = new ArrayBuffer(byteString.length);
        let ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        let blob = new Blob([ab], {type: mimeString});
        return new File([blob], imageTitle);
    }

    deletePhoto() {
        this.closeDelDialog();
        this.closeDialog();

        axios.delete(`api/v1/profile/photo/${this.state.profile.user.id}`)
            .then((response) => {
                let profile = this.state.profile;
                profile['photo'] = response.data['photo'];
                profile['key'] = response.data['key'];
                this.setState({
                    profile: profile,
                })
            })
            .catch((error) => {
                 this.setState({
                    message: 'Error occurred. '+error.response.data['error_message'],
                    openSnackbar: true,
                    open: false,
                });
            })

    }

    sendPhoto(received_file, URL) {
        let file = new FormData();
        file.append('profile_pic', received_file);
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
            .catch((error) => {
                this.setState({
                    message: 'Error occurred. '+error.response.data['error_message'],
                    openSnackbar: true,
                    open: false,
                });
            });
    };

    sendProfileData() {
        let requestBody = {
            'education': this.state.education,
            'job': this.state.job
        };
        axios.put(`api/v1/profile/${this.state.profile.user.id}/`, requestBody)
            .then((response) => {
                this.setState({
                    profile: response.data['profile'],
                }, this.handleEditClose);
            })
            .catch((error) => {
                let errors = error.response.data['errors'];
                let job = errors['job'];
                let education = errors['education'];
                this.setState({
                    jobError: job,
                    educationError: education,
                });
            });
    }

    loadProfile(url) {
        axios.get(url)
            .then((response) => {
                this.setState(response['data']);
                this.setState({
                    education: response['data']['profile']['education'],
                    job: response['data']['profile']['job']
                })
            })
            .catch((error) => {
                this.setState({error: `${error.response.status} ${error.response.statusText}`})
            })
    }

    getUrl() {
        let parameter = this.props.params['user_id'] ? this.props.params['user_id'].toString() : '';
        return `api/v1/profile/${parameter}`;
    }

    componentWillMount() {
        let url = this.getUrl();
        this.loadProfile(url);
    }

    render() {
        if (this.state.error) return <h1>{this.state.error}</h1>;

        const pictureActions = [
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

        const editActions = [
                <FlatButton
                    label="Cancel"
                    primary={true}
                    onTouchTap={this.handleEditClose}

                />,
                <FlatButton
                    label="Submit"
                    disabled={!this.state.owner}
                    primary={true}
                    onTouchTap={this.sendProfileData}

                />,
        ];

        let dialogContent = (this.state.uploadedImage ?
            <div className="pic-to-crop">
                <Cropper
                    src={this.state.uploadedImage.preview}
                    ref="cropper"
                    allowNewSelection={false}
                />
            </div> :
            <div>
                <Dropzone
                    accept="image/*"
                    ref="dropzone"
                    onDrop={this.onDrop}
                >
                    <div>Try dropping some picture here, or click to select picture to upload.</div>
                </Dropzone>
                <div className="validation-message">
                    {`Your image size should be ${maximumImageSize.toString()[0]} MB max`}
                </div>
            </div>
        );

        return (
            <MuiThemeProvider>
                <div className="profile">

                    <Paper zDepth={2} className="picture-card">
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

                    {this.state.profile ?
                        <Paper zDepth={2} className="info-card">
                            <h3>{User.getFullName(this.state.profile.user)}</h3>
                            <h4 className="profile-subheader">{this.state.profile.user.username}</h4>
                            <p className="profile-title"><span>Education: </span>{this.state.profile['education']}</p>
                            <p className="profile-title"><span>Job: </span>{this.state.profile['job']}</p>
                            { this.state['owner'] ?
                                <a className="update-profile">
                                    <i className="glyphicon glyphicon-pencil" onClick={this.openEditDialog}/>
                                </a> : null
                            }
                        </Paper> : null
                    }

                    <Dialog
                        open={this.state.open}
                        modal={false}
                        actions={pictureActions}
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

                    {this.state.profile ?
                        <Dialog
                            open={this.state.openEdit}
                            actions={editActions}
                            title="Profile edit"
                            contentClassName="dialog-window"
                            titleClassName="dialog-title"
                        >
                            <TextField
                                errorText={this.state.educationError}
                                maxLength={200}
                                multiLine={true}
                                fullWidth={true}
                                defaultValue={this.state.profile.education}
                                floatingLabelText='Education'
                                ref="education"
                                onChange={this.handleEducation}
                            />
                            <br />
                            <TextField
                                errorText={this.state.jobError}
                                maxLength={200}
                                multiLine={true}
                                fullWidth={true}
                                defaultValue={this.state.profile.job}
                                floatingLabelText='Job'
                                ref="job"
                                onChange={this.handleJob}
                            />
                        </Dialog> : null
                    }

                    <Dialog
                        contentClassName="dialog-window"
                        actions={
                        <FlatButton
                            label="OK"
                            primary={true}
                            onTouchTap={()=>this.setState({openSize: false}).bind(this)}
                        />
                      }
                      open={this.state.openSize}
                      onRequestClose={()=>this.setState({openSize: false}).bind(this)}
                    >
                      Please, select an image, which size is less than 2MB
                    </Dialog>
                    {this.state.message ?
                        <Snackbar
                            open={this.state.openSnackbar}
                            message={this.state.message}
                            autoHideDuration={3000}
                            onRequestClose={() => this.setState({openSnackbar: false}).bind(this)}
                        /> : null
                    }

                </div>
            </MuiThemeProvider>
        );
    }
}
