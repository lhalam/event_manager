import React from 'react';
import { render } from 'react-dom';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Form from './app/registration/form';
import Success from './app/registration/success-screen';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: "",
            error_message: ""
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(message, error_message) {
        this.setState({
            message: message,
            error_message: error_message
        });
    }

    render(){
        return (
            <div>
                <MuiThemeProvider muiTheme={getMuiTheme()}>
                    <AppBar
                        title="Logo"
                        showMenuIconButton={false}
                    />
                </MuiThemeProvider>
                {
                    this.state.error_message && (
                        <div className="alert alert-danger" role="alert">
                            {this.state.error_message}
                        </div>
                    )
                }
                {this.state.message ? <Success message={this.state.message} /> : <Form url="/registration/"
                                                                                       handleSubmit={this.handleSubmit}/>}
            </div>
        );
    }
}

render(
    <App />,
    document.getElementById("root")
);
