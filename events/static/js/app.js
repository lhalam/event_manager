import Navbar from './app/navbar'

var React = require('react');
var ReactDOM = require('react-dom');

export default class App extends React.Component {
    render() {
        return (
            <div>
                <Navbar />
                {this.props.children}
            </div>
        );
    }
}
