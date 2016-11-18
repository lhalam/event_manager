var React = require('react');

class Map extends React.Component{
    constructor(props){
        super(props);
        this.initMap = this.initMap.bind(this)
    }
    initMap() {       
        var x = this.props.events[0].location[0];
        var y = this.props.events[0].location[1];
        var zoom = this.props.zoom 
        var myLatLng = {lat: x, lng: y};

        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: zoom,
            center: myLatLng
        });
        this.props.events.map(function(event){
            var x = event.location[0]
            var y = event.location[1]
            var description = event.description
            var marker = new google.maps.Marker({
            position: {lat: x, lng: y},
            map: map,
            title: description
            
        });
        marker.addListener('click', function(){
                document.location =  '#/events/' + event.id
            })
        })

        if (this.props.geo){
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                map.setCenter(pos);
            }, function() {
                handleLocationError(true, infoWindow, map.getCenter());
            });
            } else {
            handleLocationError(false, infoWindow, map.getCenter());
            }
        }

    }
    componentDidMount(){
        this.initMap()
    }
    render(){
        console.log(this.props)
        return(
            <div id="map" className="map">
            </div>
        )
    }
}

export default Map
