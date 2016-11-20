import React from 'react';
import Dialog from 'material-ui/Dialog';
import Textfield from 'material-ui/TextField';

export default class AddCompanyWindow extends React.Component {

    render() {
        return (
            <Dialog
                open={this.props.open}
            >
                <Textfield/>
                <Textfield/>
                <Textfield/>

            </Dialog>
        );
    }
}