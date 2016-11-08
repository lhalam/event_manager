import React from 'react'

import Navbar from './app/navbar'

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
