var App = React.createClass({
  getDefaultProps: function() {
    return({
      person: {
        name: 'Jack',
        biography: '26 year old Designer / Developer living in Stockholm. Originally from Oxford, England. Love to make stuff.',
      },
      image: 'http://static1.squarespace.com/static/55acc005e4b098e615cd80e2/t/57b057398419c2c454f09924/1471025851733/',
      
    })
  },
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
        <p className="Bio">{this.props.person.biography}</p>
      </div>
    );
  }
});




ReactDOM.render(<App url='/profile/' pollInterval={50} />,
document.getElementById('prof'));
