import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';

export default class AddCompanyWindow extends React.Component {

    render() {
        return (
            <RaisedButton
                primary={true}
                label="Add new company"
            />
        );
    }
}