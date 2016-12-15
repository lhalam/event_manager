import React from 'react';
import axios from 'axios';
import Popover from 'material-ui/Popover';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
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
        this.state= ({
            showForm: false, 
            showChild: false,
            showConfirmationDelete: false});
        this.deleteComment = this.deleteComment.bind(this);
        this.handleConfirmationOpen = this.handleConfirmationOpen.bind(this);
        this.handleConfirmationClose = this.handleConfirmationClose.bind(this);
    }
    handleConfirmationOpen(event){
        event.preventDefault();
        this.setState({
        showConfirmationDelete: true,
        anchorEl: event.currentTarget,
        });
    }
    handleConfirmationClose(){
    this.setState({
      showConfirmationDelete: false,
    });
  };
    deleteComment(){
        axios.delete(`/api/v1/comments/${this.props.comment.id}`)
        .then(this.props.getComments)
    }
    render(){
        const date = new Date(this.props.comment.date * 1000);
        const dateString = `${date.toDateString()}, ${date.toLocaleTimeString()}`;
        return(
            <div className="comment-wrapper">
            <Popover
                open={this.state.showConfirmationDelete}
                anchorEl={this.state.anchorEl}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                onRequestClose={this.handleConfirmationClose}
                >
            <h5>Are you sure?</h5>
            <RaisedButton 
                label="Delete" 
                secondary={true} 
                buttonStyle={{backgroundColor: '#F44336'}}
                onClick={this.deleteComment}/>
            </Popover>
                <div className="author-avatar">
                    <img src="http://www.nlsgrp.co/wp-content/uploads/2016/06/Avatar-Matt-3.png" />
                </div>
                <div className="comment">
                    <div 
                        className="comment-header"
                        onMouseOver={()=>this.setState({showDeleteButton: true})}
                        >
                        <b>{this.props.comment.author.name}</b>
                        <a 
                            onTouchTap={this.handleConfirmationOpen}>
                            <i className="glyphicon glyphicon-remove" />
                        </a>
                        {
                            this.props.comment.children[0] ? (
                                <a 
                                    className={this.state.showChild? 'show-body': 'hide-body'}
                                    onClick={()=>this.setState({showChild: !this.state.showChild})}>
                                </a>
                            ): null
                        }
                        <p>{dateString}</p>
                    </div>
                    <div className="comment-body">
                        {this.props.comment.text}
                    </div>
                    <a onClick={()=>this.setState({showForm: !this.state.showForm})}>Answer</a>
                    {this.state.showForm ? <CommentForm 
                        parrent_comment={this.props.comment.id}
                        getComments={this.props.getComments}/> : null
                    }
                    {
                        this.state.showChild ? (
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
                        ) : null
                    }
                </div>
            </div>
        )
    }
}

export default Comments
