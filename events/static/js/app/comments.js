import React from 'react';
import axios from 'axios';
import FlatButton from 'material-ui/FlatButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';



class Comments extends React.Component{
    render(){
        return (
            <div>
                <CommentList event_id={this.props.event_id}/>
            </div>
        )
    }
}

class CommentForm extends React.Component{
    constructor(props){
        super(props);
        this.state=({text: ''})
        this.formValid = this.formValid.bind(this)
        this.formSubmit = this.formSubmit.bind(this)
    }

    formValid(){
        return this.state.text.trim().length < 200
    }

    formSubmit(){
        const url = this.props.event_id ? `/api/v1/comments/${this.props.event_id}/` : `/api/v1/comments/`
        axios.post(url, {
            text: this.state.text,
            parrent_id: this.props.parrent_comment
        }).then(function(response){
            this.setState({text: ''});
            this.props.getComments()
        }.bind(this))
    }

    render(){
        const error = (this.state.text && !this.formValid()) ? 'To long message (200 characters max)' : ''
            return (   
            <div className="comment-form-container">
                <div className="author-avatar">
                    <img src="http://www.nlsgrp.co/wp-content/uploads/2016/06/Avatar-Matt-3.png" />
                </div>
                <div className="form-wrapper">
                    <textarea 
                        className="comment-textarea"
                        value={this.state.text}
                        onInput={(e)=>this.setState({text: e.target.value})}
                    >
                    </textarea>
                    <span className="error-message">{error}</span>
                    <FlatButton 
                        label="Comment" 
                        primary={true}
                        disabled={(!Boolean(this.state.text) || !this.formValid())}
                        style={{float: 'right'}}
                        onClick={this.formSubmit}/>
                </div>
            </div>
        )
    }
}


class CommentList extends React.Component{
    constructor(props){
        super(props);
        this.state=({comments: []});
        this.getComments = this.getComments.bind(this)
    }
    getComments(){
        axios.get(`/api/v1/comments/${this.props.event_id}/`)
        .then(function(response){
            this.setState({comments: response.data})
        }.bind(this))
    }
    componentDidMount(){
        this.getComments()
    }
    render(){
        if (this.state.comments){
            return (
                <div>
                    <div>
                        <CommentForm 
                        event_id={this.props.event_id}
                        getComments={this.getComments}/>
                        <hr/>
                    </div>
                    <div className="comment-list">
                        {
                            this.state.comments.map((comment)=>
                            <CommentItem 
                                key={comment.id} 
                                comment={comment}
                                getComments={this.getComments}/>)
                        }
                    </div>
                </div>
            )
        }
        return(
            <div>
            </div>
        )
    }
}

class CommentItem extends React.Component{
    constructor(props){
        super(props);
        this.state= ({showForm: false, showBody: true})
    }
    render(){
        const date = new Date(this.props.comment.date * 1000);
        const dateString = `${date.toDateString()}, ${date.toLocaleTimeString()}`;
        const commentForm = this.state.showForm ? <CommentForm 
            parrent_comment={this.props.comment.id}
            getComments={this.props.getComments}/> : null;
        console.log(this.state)
        let body = ""
        if (this.state.showBody){
            body = (
            <div>
                    <div className="comment-child">
                        {
                            this.props.comment.children.map((comment)=>{
                                return <CommentItem 
                                    key={comment.id}
                                    comment={comment}
                                    getComments={this.props.getComments}
                                    />})
                        }
                    </div>
                    </div>
        )
        }
        return(
            <div className="comment-wrapper">
                <div className="author-avatar">
                    <img src="http://www.nlsgrp.co/wp-content/uploads/2016/06/Avatar-Matt-3.png" />
                </div>
                <div className="comment">
                    <div className="comment-header">
                        <b>{this.props.comment.author.name}</b>
                        {
                            this.props.comment.children[0] ? (
                                <a 
                                    className={this.state.showBody? 'show-body': 'hide-body'}
                                    onClick={()=>this.setState({showBody: !this.state.showBody})}>
                                </a>
                            ): null
                        }
                        
                        <p>{dateString}</p>
                        <div className="comment-body">
                        {this.props.comment.text}
                    </div>
                    <a onClick={()=>this.setState({showForm: !this.state.showForm})}>Comment</a>
                    {commentForm}
                    </div>
                    {body}
                </div>
            </div>
        )
    }
}

export default Comments
