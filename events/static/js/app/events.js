import Map from './map'
import {Container, Row, Col} from 'react-grid-system';

const React = require('react');
const axios = require("axios");


class EventList extends React.Component{
    constructor(props){
        super(props);
        this.state = ({events: []})
    }
    componentWillMount(){
        axios.get('/api/v1/events/')
        .then(function (response) {
            this.setState({events: response.data})
        }.bind(this))
    }
    render(){
        if (this.state.events[0]){
            return(
            <div>
                <Map events={this.state.events} geo={true} zoom={6}/>
                <div>
                    {this.state.events.map(function(event){
                        return <EventItem key={event.id} id={event.id} title={event.title}/>
                    })}
                </div>
                <div className="events-list-wrap">
                    <Container>
                        <Row>
                        <Col xs={6} md={4}><EventItemNew/></Col>
                        <Col xs={6} md={4}><EventItemNew/></Col>
                        <Col xs={6} md={4}><EventItemNew/></Col>
                        <Col xs={6} md={4}><EventItemNew/></Col>
                        </Row>
                    </Container>
                </div>
            </div>
        )
        }else{
            return(
                <div>
                    Events does not exist
                </div>
            )
        }
            
    }
}

class EventItem extends React.Component{
    render(){
        const url =  '#/events/' + this.props.id
        return (
            <div>
                <a href={url}>{this.props.title}</a>
            </div>
        )
    }
}



class EventItemNew extends React.Component{
    render(){
        const url =  '#/events/' + this.props.id
        return(
<div>
    <div className="wrapper">
        <div className="card radius shadowDepth1">
        <div className="card__image border-tlr-radius">
        <img src="http://lorempixel.com/400/200/sports/" alt="image" className="border-tlr-radius"/>
        </div>
        <div className="card__content card__padding">
        <div className="card__share">
        <div className="card__social">  
        <a className="share-icon facebook" href="#"><span className="fa fa-facebook"></span></a>
        <a className="share-icon twitter" href="#"><span className="fa fa-twitter"></span></a>
        <a className="share-icon googleplus" href="#"><span className="fa fa-google-plus"></span></a>
        </div>

        <a id="share" className="share-toggle share-icon" href="#"></a>
        </div>

        <div className="card__meta">
        <a href="#">Web Design</a>
        <time>17th March</time>
        </div>

        <article className="card__article">
        <h2><a href="#">Material Design Card - For Blog Post Article</a></h2>

        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ducimus harum...</p>
        </article>
        </div>

        <div className="card__action">

        <div className="card__author">
        <img src="http://lorempixel.com/40/40/sports/" alt="user"/>
        <div className="card__author-content">
            By <a href="#">John Doe</a>
        </div>
        </div>
    </div>
</div>
</div>
</div>
        )
    }
}




export default EventList
