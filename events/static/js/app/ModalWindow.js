import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import ChipInput from 'material-ui-chip-input'
import Avatar from 'material-ui/Avatar'
import Chip from 'material-ui/Chip';
import blue300 from 'material-ui/styles/colors';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';




export default class ModalWindow extends React.Component {

    constructor(props) {
        super(props);
        this.handleAddChip = this.handleAddChip.bind(this);
        this.handleDeleteChip = this.handleDeleteChip.bind(this);
    }

    handleAddChip(chip) {
        console.log('chip:', chip);
        if (this.props.dataSource.indexOf(chip) != -1) {
           let chips = this.props.dataDestination;
            chips.push(chip);
            console.log("chips:", chips);
            this.setState({
                dataToSend: {'participants': chips}
            });
        }
    };

    handleDeleteChip(chip) {
        let chips = this.props.dataDestination;
            chips.splice(chip.indexOf(chip), 1);
            this.setState({
                dataToSend: {'participants': chips}
            });
    }

    render() {

        const dataSourceConfig = {
            text: 'username',
            value: 'username'
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
            dialogTitle: {
                backgroundColor: 'rgb(0, 151, 167)',
                color: '#f9f9f9',
                fontSize: '30px'
            },
            dialogRoot: {
                margin: '0 auto',
                maxWidth: '500px',
                width: '100%'
            },
            dialogBody: {
                paddingTop: '20px',
            },
            dialogBodyMenuStyle: {
                maxHeight: '200px'
            },
            avatar: {
                backgroundColor: 'rgb(0, 151, 167)',
                color: '#f9f9f9',
            }
        };

        const defaultChipRenderer = ({ value, isFocused, isDisabled, handleClick, handleRequestDelete }, key) => (
           <Chip
               key={key}
               style={{ margin: '8px 8px 0 0', float: 'left', pointerEvents: isDisabled ? 'none' : undefined }}
               backgroundColor={isFocused ? blue300 : null}
               onTouchTap={handleClick}
               onRequestDelete={handleRequestDelete}
            >
               <Avatar style={styles.avatar} size={32}>{value[0].toUpperCase()}</Avatar>
               {value}
           </Chip>);

        if (this.props.dataSource.length > 0) {
            return (
                <MuiThemeProvider>
                    <Dialog
                        open={this.props.open}
                        title={this.props.title}
                        titleStyle={styles.dialogTitle}
                        contentStyle={styles.dialogRoot}
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
                            style={styles.dialogBody}
                            menuStyle = {styles.dialogBodyMenuStyle}
                        />
                    </Dialog>
                </MuiThemeProvider>
            );
        } else {
            return (
                <MuiThemeProvider>
                    <Dialog
                        contentStyle={styles.dialogRoot}
                        actions={alertActions}
                        open={this.props.open}
                        onRequestClose={this.handleRequestClose}
                    >
                      All possible users already added to this event.
                    </Dialog>
                </MuiThemeProvider>
            );
        }

    }
}




