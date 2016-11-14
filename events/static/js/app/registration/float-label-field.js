import React from "react";
import Rules from "./rules";
import TextField from 'material-ui/TextField';
import Popover from 'material-ui/Popover/Popover';
import validator from 'validator';

export default class FloatLabelField extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            changed: false,
            checkRules: [],
            openPopover: false,
            anchorOrigin: {"horizontal":"middle","vertical":"top"},
            targetOrigin: {"horizontal":"middle","vertical":"bottom"}
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleRequestClose = () => {
            this.setState({
                openPopover: false,
            });
        };
    }

    handleFocus(event) {
        this.setState({
            openPopover: true,
            anchorEl: event.target
        });
    }

    componentWillMount() {
        if(this.props.checkRules)
            this.setState({checkRules: this.props.checkRules(this.props.value)});
    }

    handleChange(event) {
        let value = event.target.value.trim();
        this.setState({
            changed: true
        });
        this.props.handleChange(value);
        if(this.props.checkRules)
            this.setState({checkRules: this.props.checkRules(value)});
    }

    getValidationState() {
        if(this.state.changed){
            if(!(this.props.validator && this.props.validator(this.props.value)))
                return true;
        }
    }

    render() {
        let validationState = this.getValidationState();
        let errorText = (validator.isEmpty(this.props.value) && this.props.errorEmpty) ||
                         this.props.errorRepeat ||
                         this.props.errorMessage;
        let popover;
        if(this.props.rules) {
            popover = (
                <Popover
                      open={this.state.openPopover}
                      anchorEl={this.state.anchorEl}
                      anchorOrigin={this.state.anchorOrigin}
                      targetOrigin={this.state.targetOrigin}
                      onRequestClose={this.handleRequestClose}
                      className="popover-rules"
                >
                    <Rules rules={this.props.rules}
                           title={this.props.title + " rules"}
                           checkRules={this.state.checkRules}
                    />
                </Popover>
            );
        }

        return (
            <div className="field-wrapper">
                <TextField
                    type={this.props.type}
                    value={this.props.value}
                    errorText={validationState ? errorText : ""}
                    floatingLabelText={this.props.title + " *"}
                    onChange={this.handleChange}
                    onFocus={this.handleFocus}
                    onBlur={this.handleRequestClose}
                />
                {Boolean(this.state.checkRules.length) && popover}
            </div>
        );
    }
}
