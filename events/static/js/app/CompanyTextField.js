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
                rowsMax={this.props.rowsMax}
                fullWidth={this.props.fullWidth}
            />

        );
    }
}
