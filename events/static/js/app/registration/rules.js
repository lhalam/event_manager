import React from 'react';

export default class Rules extends React.Component {
    render() {
        return (
            <div className="rules">
                <p>{this.props.title.toUpperCase()}</p>
                <ul>
                    {
                        this.props.checkRules.map((value, index) => {
                            return (
                                <li key={index}
                                    className={value ? "success" : "error"}>
                                    {
                                        value ? <span className="glyphicon glyphicon-ok"></span> :
                                                <span className="glyphicon glyphicon-remove"></span>
                                    }
                                    <span className="text-rule">
                                        {this.props.rules[index]}
                                    </span>
                                </li>)
                        })
                    }
                </ul>
            </div>
        );
    }
}
