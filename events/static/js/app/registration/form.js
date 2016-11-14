import React from 'react';
import FloatLabelField from './float-label-field';
import DateField from './date-field';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Paper from 'material-ui/Paper';
import validator from 'validator';
import _ from 'underscore';

var axios = require("axios");

const MILLISECONDS = 1000;

export default class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            first_name: "",
            last_name: "",
            email: "",
            email_error: "",
            password: "",
            password_confirm: "",
            birth_date: "",
            response_errors: {},
            formIsValid: false,
        };
        this.handleFirstName = (value) => {
            this.setState({first_name: value}, () => {this.setState(
                {formIsValid: this.validateForm()})
            })
        };
        this.handleLastName = (value) => {this.setState({last_name: value}, () => {this.setState(
                {formIsValid: this.validateForm()})
            })
        };
        this.handleEmail = this.handleEmail.bind(this);
        this.handlePassword = (value) => {this.setState({password: value}, () => {this.setState(
                {formIsValid: this.validateForm()})
            })
        };
        this.handlePasswordConfirm = (value) => {this.setState({password_confirm: value}, () => {this.setState(
                {formIsValid: this.validateForm()})
            })
        };
        this.handleBirthDate = (value) => {this.setState({birth_date: value}, () => {this.setState(
                {formIsValid: this.validateForm()})
            })
        };
        this.handleSubmit = this.handleSubmit.bind(this);

        this.validateNotEmpty = this.validateNotEmpty.bind(this);
        this.validateEmail = this.validateEmail.bind(this);
        this.validatePassword = this.validatePassword.bind(this);
        this.checkPasswordRules = this.checkPasswordRules.bind(this);
        this.validatePasswordConfirm = this.validatePasswordConfirm.bind(this);
    }

    validateNotEmpty(value){
        return !validator.isEmpty(value);
    }

    validateEmail(value){
        return validator.isEmail(value) && !this.state.email_error;
    }

    validatePassword(value){
        return _.every(this.checkPasswordRules(value));
    }

    validatePasswordConfirm(value) {
        return value && this.state.password == value;
    }

    checkPasswordRules(value){
        let checkRules = [];
        let passwordRegExp = /^[a-zA-Z0-9]+$/;
        checkRules.push(value.match(passwordRegExp) ? true : false);
        checkRules.push(value.length >= 8);
        checkRules.push(value.length <= 20);
        return checkRules;
    }

    validateForm(){
        return (this.refs.first_name.props.validator(this.state.first_name) &&
                this.refs.last_name.props.validator(this.state.last_name) &&
                this.refs.email.props.validator(this.state.email) &&
                this.refs.password.props.validator(this.state.password) &&
                this.refs.password_confirm.props.validator(this.state.password_confirm) &&
                this.refs.birth_date.props.validator(this.state.birth_date));
    }

    handleEmail(value) {
        this.setState({
            email: value,
            email_error: ""
        }, () => {
            this.setState({formIsValid: this.validateForm()});
            if (this.validateEmail(value)) {
                let registration_data = {
                    first_name: "",
                    last_name: "",
                    email: this.state.email,
                    password: "",
                    birth_date: ""
                };
                registration_data["birth_date"] = new Date("01/01/1997").getTime() / MILLISECONDS;
                axios.post(this.props.url, registration_data)
                    .catch((error) => {
                        if (error.response) {
                            if (error.response.data.errors.email)
                                this.setState({
                                    email_error: error.response.data.errors.email[0]
                                }, () => this.setState({formIsValid: this.validateForm()}));
                        }
                    });
            }
        }
        );
    }

    handleSubmit(event){
        event.preventDefault();
        let registration_data = Object.assign({}, this.state);
        delete registration_data.password_confirm;
        delete registration_data.formIsValid;
        let date = new Date(registration_data["birth_date"]);
        registration_data["birth_date"] = new Date(date.getMonth() + "/" +
                                                   date.getDate() + "/" +
                                                   date.getFullYear()).getTime() / MILLISECONDS;

        axios.post(this.props.url, registration_data)
            .then((response) => this.props.handleSubmit(response.data.message, ""))
            .catch((error) => {
                if(error.response){
                    this.props.handleSubmit("", "Oops, something went wrong. Please try again later or contact support.")
                }
            });
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
                <Paper className="registration_container" zDepth={3}>
                    <form className="registration_form">
                        {
                            Boolean(Object.values(this.state.response_errors).length)
                        }
                        <FloatLabelField title="First name"
                                         errorMessage="First name is required"
                                         validator={this.validateNotEmpty}
                                         handleChange={this.handleFirstName}
                                         value={this.state.first_name}
                                         type="text"
                                         ref="first_name"
                        />
                        <FloatLabelField title="Last name"
                                         errorMessage="Last name is required"
                                         validator={this.validateNotEmpty}
                                         handleChange={this.handleLastName}
                                         value={this.state.last_name}
                                         type="text"
                                         ref="last_name"
                        />
                        <FloatLabelField title="Email"
                                         errorMessage="Enter a valid email"
                                         errorEmpty="Email is required"
                                         errorRepeat={this.state.email_error}
                                         validator={this.validateEmail}
                                         handleChange={this.handleEmail}
                                         value={this.state.email}
                                         type="email"
                                         ref="email"
                        />
                        <FloatLabelField title="Password"
                                         errorMessage="Enter a valid password"
                                         errorEmpty="Password is required"
                                         validator={this.validatePassword}
                                         handleChange={this.handlePassword}
                                         value={this.state.password}
                                         type="password"
                                         rules={["Alowed characters: A-Z a-z 0-9",
                                                 "8 characters minimum",
                                                 "20 characters maximum"
                                         ]}
                                         checkRules={this.checkPasswordRules}
                                         ref="password"
                        />
                        <FloatLabelField title="Password confirm"
                                         errorMessage="Passwords do not match"
                                         errorEmpty="Password confirm is required"
                                         validator={this.validatePasswordConfirm}
                                         handleChange={this.handlePasswordConfirm}
                                         value={this.state.password_confirm}
                                         type="password"
                                         ref="password_confirm"
                        />

                        <DateField title="Birth date"
                                   errorEmpty="Birth date is required"
                                   validator={this.validateNotEmpty}
                                   handleChange={this.handleBirthDate}
                                   value={this.state.birth_date}
                                   ref="birth_date"
                        />


                            <RaisedButton label="REGISTER NOW"
                                          primary={true}
                                          onClick={this.handleSubmit}
                                          disabled={!this.state.formIsValid}
                                          className="submit-btn"
                            />
                        <a className="login" href="/auth/login">Login</a>
                    </form>
                </Paper>
            </MuiThemeProvider>
        );
    }
}
