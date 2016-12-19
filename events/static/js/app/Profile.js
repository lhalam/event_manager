import React from 'react';
import axios from 'axios';

export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    loadProfile() {
        axios.get(`http://localhost:8000/api/v1/profile/${this.props.params.user_id ?
                                                          this.props.params.user_id : ''}`)
            .then((response) => {
                this.setState(response['data']);
            })
            .catch((error) => {
                console.log(error.response);
                this.setState({error: `${error.response.status} ${error.response.statusText}`})
            })
    }

    componentDidMount() {

        this.loadProfile();
        
    }

    render() {
        if (this.state.error) return <h1>{this.state.error}</h1>;
        let profile_photo = 'http://eventmanager203.s3.amazonaws.com/default_photo.jpg';
        if (this.state.profile) {
            profile_photo = this.state.profile['photo'];
        }
        return (
            <div>
                <p>Worked!</p>
                <img className="profile-pic" src={profile_photo} alt="userpic"/>
           </div>
            );
    }
}