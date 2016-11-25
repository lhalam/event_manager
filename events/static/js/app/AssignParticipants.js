import React from 'react';
import axios from 'axios';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Snackbar from 'material-ui/Snackbar';
import ModalWindow from './ModalWindow'


export default class AssignParticipants extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            openSnackbar: false,
            getParticipants: {'participants': []},
            dataToSend: {'participants': []},
            message: "",
            errorMessage: null,
        };

        this.handleTouchTap = this.handleTouchTap.bind(this);
        this.handleRequestClose = this.handleRequestClose.bind(this);
        this.loadParticipants = this.loadParticipants.bind(this);
        this.sendParticipants = this.sendParticipants.bind(this);
        this.handleRequestCancelClose = this.handleRequestCancelClose.bind(this);
        this.handleRequestSubmitClose = this.handleRequestSubmitClose.bind(this);
        this.handleToSendList = this.handleToSendList.bind(this);

    }

    componentDidMount(){
        this.loadParticipants();
        setInterval(this.loadParticipants, 20000);
    };

    loadParticipants() {
        axios.get(this.props.url)
              .then((eventParticipants) => {
                  this.setState({
                      getParticipants: eventParticipants.data,
                      errorMessage: null
                    });
              })
              .catch((failData) => {
                  this.setState({
                      getParticipants: {'participants': []},
                      errorMessage: failData.response.data['error_message'],
                  });
              });
    };

    sendParticipants() {
        let participantsAddCount = this.state.dataToSend['participants'];
        axios.put(this.props.url, this.state.dataToSend)
            .then(() => {
                this.props.handleAddUsers(this.state.dataToSend['participants']);
                var successMessage;
                if (participantsAddCount.length > 1) {
                    successMessage = 'Users were '+this.props.snackbarMessage;
                } else {
                    successMessage = 'User was '+this.props.snackbarMessage;
                }
                this.setState({
                    message: successMessage,
                    openSnackbar: true,
                });
            })
            .catch((failData) => {
                 this.setState({
                    message: 'Error occurred. '+failData.response.data['error_message'],
                    openSnackbar: true,
                });
            });
    };


    handleRequestClose(){
        this.setState({
            openSnackbar: false,
        });
    };

    handleTouchTap() {
        this.setState({
            open: true,
        });
    };

    handleRequestSubmitClose() {
        this.sendParticipants();
        this.setState({
            open: false,
            dataToSend: {'participants': []},
        });
        this.loadParticipants()
    };

    handleRequestCancelClose() {
        this.setState({
            open: false,
            dataToSend: {'participants': []},
        });
        this.loadParticipants();
    };

    handleToSendList(chips) {
        this.setState({
            dataToSend: {'participants': chips}
        });
    }


    render() {

        return (
            <MuiThemeProvider>
                <div>
                    <ModalWindow
                        dataSource={this.state.getParticipants['participants']}
                        dataDestination={this.state.dataToSend['participants']}
                        open={this.state.open}
                        onCancelClose={this.handleRequestCancelClose}
                        onSubmitClose={this.handleRequestSubmitClose}
                        handleToSendList={this.handleToSendList}
                        title={this.props.title}
                        hintText={this.props.hintText}
                        noUsersText={this.props.noUsersText}
                    />
                    <Snackbar
                        open={this.state.openSnackbar}
                        message={this.state.message}
                        autoHideDuration={3000}
                        onRequestClose={this.handleRequestClose}
                    />
                    <RaisedButton
                        label={this.props.title}
                        primary={true}
                        disabled={this.state.errorMessage ? true : false}
                        onTouchTap={this.handleTouchTap}
                    />
                </div>
            </MuiThemeProvider>
        );
    }
}


