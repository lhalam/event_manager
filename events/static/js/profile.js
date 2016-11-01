var person = "{"
	+'"name":"Jack-Edward",'
	+'"years":"26 years old",'
	+'"education":"Lviv National University",'
	+'"job":"Softserve",'
	+'"photo":"deault_photo.png"'
	+"}"
console.log(JSON.parse(person));

var App = React.createClass({
  }
  render: function() {
    return(
      <div className="App">
        <Image src={this.props.image} />
        <Profile person={this.props.person} quote={this.props.quote} />
      </div>
    );
  }
});

var Image = React.createClass({
  render: function() {
    return (
      <div className="Image" style={{backgroundImage: 'url(' + this.props.src + ')'}}></div>
    );
  }
});

var Profile = React.createClass({
  render: function() {
    return (
      <div className="Profile">
        <h1 className="Name">{this.props.person.name}</h1>
        <p className="Years">{this.props.person.years}</p>
        <p className="Info">{this.props.person.education}</p>
        <p className="Info">{this.props.person.job}</p>
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('prof'));
