import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import ChipInput from 'material-ui-chip-input'
import Avatar from 'material-ui/Avatar'
import Chip from 'material-ui/Chip';
import blue300 from 'material-ui/styles/colors';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

let User = require('./helpers/User');


export default class ModalWindow extends React.Component {

    constructor(props) {
        super(props);
        this.handleAddChip = this.handleAddChip.bind(this);
        this.handleDeleteChip = this.handleDeleteChip.bind(this);
    }

    handleAddChip(chip) {
        if (this.props.dataSource.indexOf(chip) != -1) {
           let chips = this.props.dataDestination;
            chips.push(chip);
            this.props.handleToSendList(chips);
        }
    };

    handleDeleteChip(chip) {
        let chips = this.props.dataDestination;
        let chipToDelete = chips.find((el) => el['id'] == chip['id'] );
        chips.splice(chips.indexOf(chipToDelete), 1);
        this.props.handleToSendList(chips);
    }

    render() {

        const dataSourceConfig = {
            text: 'full_name',
            value: 'all_data'
        };

        const standardActions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this.props.onCancelClose}
            />,
            <FlatButton
                label="Submit"
                primary={true}
                onTouchTap={this.props.onSubmitClose}
                disabled={(this.props.dataDestination.length == 0)}
            />,
        ];

        const alertActions = (
            <FlatButton
                label="OK"
                primary={true}
                onTouchTap={this.props.onCancelClose}
            />
        );

        const styles = {
            dialogBodyMenuStyle: {
                maxHeight: '200px'
            },
        };

        const defaultChipRenderer = ({ value, isFocused, isDisabled, handleClick, handleRequestDelete }, key) => (
            <Chip
                key={key}
                style={{ margin: '8px 8px 0 0', float: 'left', pointerEvents: isDisabled ? 'none' : undefined }}
                backgroundColor={isFocused ? blue300 : null}
                onTouchTap={handleClick}
                onRequestDelete={handleRequestDelete}
            >
                <Avatar
                    size={32}
                    backgroundColor={value['avatar']}
                >
                    {value['first_name'][0].toUpperCase()}</Avatar>
                {User.getFullName(value)}
            </Chip>);

        if (this.props.dataSource.length > 0) {
            return (
                <MuiThemeProvider>
                    <Dialog
                        open={this.props.open}
                        title={this.props.title}
                        contentClassName={"dialog-window"}
                        titleClassName={"dialog-title"}
                        actions={standardActions}
                        onRequestClose={this.handleRequestClose}
                    >
                        <ChipInput
                            dataSource={this.props.dataSource}
                            dataSourceConfig={dataSourceConfig}
                            hintText={this.props.hintText}
                            fullWidth={true}
                            chipRenderer={defaultChipRenderer}
                            value={this.props.dataDestination}
                            onRequestAdd={this.handleAddChip}
                            onRequestDelete={this.handleDeleteChip}
                            openOnFocus={true}
                            className="chip-input"
                            menuStyle = {styles.dialogBodyMenuStyle}
                        />
                    </Dialog>
                </MuiThemeProvider>
            );
        } else {
            return (
                <MuiThemeProvider>
                    <Dialog
                        contentClassName="dialog-window"
                        actions={alertActions}
                        open={this.props.open}
                        onRequestClose={this.handleRequestClose}
                    >
                      {this.props.noUsersText}
                    </Dialog>
                </MuiThemeProvider>
            );
        }

    }
}




