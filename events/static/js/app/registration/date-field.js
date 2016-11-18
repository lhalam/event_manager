import React from 'react';
import DatePicker from 'material-ui/DatePicker';
import injectTapEventPlugin from 'react-tap-event-plugin';
import validator from 'validator';
injectTapEventPlugin();

export default class DateField extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            changed: false
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event, date){
        this.props.handleChange(date.toString());
        this.setState({
            changed: true
        });
    }

    getValidationState() {
        if(this.state.changed){
            if(!(this.props.validator && this.props.validator(this.props.value)))
                return true;
        }
    }

    render() {
        let validationState = this.getValidationState();
        let maxDate = new Date();
        let minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 100);
        return (
            <div className="field-wrapper">
                <DatePicker
                    container="inline"
                    hintText={this.props.title + " *"}
                    errorText={validationState ? this.props.errorEmpty : ""}
                    onChange={this.handleChange}
                    formatDate={
                        (date) => ('0' + date.getDate()).slice(-2) + '-' +
                                  ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear()
                    }
                    className="datepicker"
                    floatingLabelText={this.props.title + " *"}
                    maxDate={maxDate}
                    minDate={minDate}
                />
            </div>
        );
    }
}
