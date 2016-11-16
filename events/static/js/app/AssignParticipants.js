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
                  console.log('loaded from server:', eventParticipants.data['participants']);
              })
              .catch((failData) => {
                  this.setState({
                      getParticipants: {'participants': []},
                      errorMessage: failData.response.data['error_message'],
                  });
                  console.log('error2', Object.assign({}, failData.response.data));
              });
    };

    sendParticipants() {
        let participantsAddCount = this.state.dataToSend['participants'];
        axios.put(this.props.url, this.state.dataToSend)
            .then(() => {
                var successMessage;
                if (participantsAddCount.length > 1) {
                    successMessage = 'Users were successfully added to event'
                } else {
                    successMessage = 'User was successfully added to event'
                }
                this.setState({
                    message: successMessage,
                    openSnackbar: true,
                });
            })
            .catch((failData) => {
                console.log(failData);
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
        this.props.handleAddUsers(this.state.dataToSend['participants']);
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


    render() {

        const title = 'Add participants';
        const hintText = 'Start typing participant name...';

    return (
        <MuiThemeProvider>
            <div>
                <ModalWindow
                    dataSource={this.state.getParticipants['participants']}
                    dataDestination={this.state.dataToSend['participants']}
                    open={this.state.open}
                    onCancelClose={this.handleRequestCancelClose}
                    onSubmitClose={this.handleRequestSubmitClose}
                    title={title}
                    hintText={hintText}
                />
                <Snackbar
                    open={this.state.openSnackbar}
                    message={this.state.message}
                    autoHideDuration={3000}
                    onRequestClose={this.handleRequestClose}
                />
              <RaisedButton
                    label={title}
                    primary={true}
                    disabled={this.state.errorMessage ? true : false}
                    onTouchTap={this.handleTouchTap}
              />
            </div>
        </MuiThemeProvider>
    );
    }
}


