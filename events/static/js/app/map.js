var React = require('react');

class Map extends React.Component{
    constructor(props){
        super(props);
        this.initMap = this.initMap.bind(this)
        this.handlePlaceChanged = this.handlePlaceChanged.bind(this)
    }
    handlePlaceChanged(add, loc){
        this.props.setLocation('Hello','world')
    }
    initMap() {
        var _this = this
        if (this.props.new){
            var map = new google.maps.Map(document.getElementById('map_new'), {
            center: {lat: 49, lng: 23},
            zoom: 7,
            mapTypeId: 'roadmap',
            disableDefaultUI: true
        });
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
                // Create the search box and link it to the UI element.
                var input = document.getElementById('pac-input');
                var searchBox = new google.maps.places.SearchBox(input);
                map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

                // Bias the SearchBox results towards current map's viewport.
                map.addListener('bounds_changed', function() {
                searchBox.setBounds(map.getBounds());
                });

                var markers = [];
                // Listen for the event fired when the user selects a prediction and retrieve
                // more details for that place.
                searchBox.addListener('places_changed', function() {
                var places = searchBox.getPlaces();
                _this.props.setLocation(places[0].name, places[0].geometry.location)
                if (places.length == 0) {
                    return;
                }

                // Clear out the old markers.
                markers.forEach(function(marker) {
                    marker.setMap(null);
                });
                markers = [];

                // For each place, get the icon, name and location.
                var bounds = new google.maps.LatLngBounds();
                places.forEach(function(place) {
                    if (!place.geometry) {
                    console.log("Returned place contains no geometry");
                    return;
                    }
                    var icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                    };

                    // Create a marker for each place.
                    markers.push(new google.maps.Marker({
                    map: map,
                    icon: icon,
                    title: place.name,
                    position: place.geometry.location
                    }));

                    if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                    } else {
                    bounds.extend(place.geometry.location);
                    }
                });
                map.fitBounds(bounds);
                });
        }
        if (this.props.events){
            var x = this.props.events[0].location[0];
            var y = this.props.events[0].location[1];
            var zoom = this.props.zoom;
            var geo = true
            var myLatLng = {lat: x, lng: y};
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: zoom,
                center: myLatLng
            });
            this.props.events.map(function(event){
                var x = event.location[0];
                var y = event.location[1];
                var description = event.description;
                var marker = new google.maps.Marker({
                position: {lat: x, lng: y},
                map: map,
                title: description

            });
            marker.addListener('click', function(){
                    document.location =  '#/events/' + event.id
                })
            });
        }
        if(this.props.event){
            console.log(this.props)
            var location = { lat: this.props.location[0], lng: this.props.location[1] };
            var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: location
            });

            // Add a marker at the center of the map.
            addMarker(location, map);
        }

        // Adds a marker to the map.
        function addMarker(location, map) {
            // Add the marker at the clicked location, and add the next-available label
            // from the array of alphabetical characters.
            var marker = new google.maps.Marker({
            position: location,
            map: map
            });

        }
        if (geo){
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
    comonentDidUpdate(){
        console.log(this)
    }
    render(){
        if (this.props.new){
            return(
            <div>
                <div id="map_new" className="map_new">
                </div>
            </div>
        )
        }
        return(
            <div id="map" className="map">
            </div>
        )
    }
}

export default Map
