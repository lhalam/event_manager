import React from 'react';
import axios from 'axios';

export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            profile: {'photo': 'http://eventmanager203.s3.amazonaws.com/default_photo.jpg'},
            owner: false
        };
    }

    loadProfile() {
        axios.get(`http://localhost:8000/api/v1/profile/${this.props.params.user_id ?
                                                          this.props.params.user_id : ''}`)
            .then((response) => {
                this.setState();
            })
            .catch((error) => {
                console.log('oops, something went wrong')
            })
    }

    componentDidMount() {

        this.loadProfile();
        
    }

    render() {

        let profile_photo = this.state.profile['photo'];
        return (
            <div>
                <p>Worked!</p>
                <img className="profile-pic" src={profile_photo} alt="userpic"/>
           </div>
            );
    }
}