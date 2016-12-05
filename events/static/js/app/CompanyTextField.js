import React from 'react';
import Textfield from 'material-ui/TextField';

export default class CompanyTextField extends React.Component {



    render() {
        return (
            <Textfield
                defaultValue={this.props.value}
                floatingLabelText={this.props.label}
                onChange={this.props.onChange}
                multiLine={this.props.multiLine}
                rows={this.props.rows}
                maxLength={this.props.length}
                rowsMax={this.props.rowsMax}
                fullWidth={this.props.fullWidth}
            />

        );
    }
}
