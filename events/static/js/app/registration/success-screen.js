import React from "react";

export default class Success extends React.Component {
    render() {
        return (
            <div className="success-screen">
                <i className="material-icons success-screen-icon">check_circle</i>
                <h2>Welcome to Event Manger</h2>
                <p>{this.props.message}</p>
            </div>
        );
    }
}
