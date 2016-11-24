import React from 'react';
import TextField from 'material-ui/TextField';

export default class SearchField extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            searchText: ""
        };
        this.minQueryLength = 2;
        this.filterMembers = () => {
            let ignoreSymbols = /[`'’!@#$%^&*()_+=\-/\\|,.~;:?№<>"\s]+/g;
            let searchText = this.state.searchText.replace(ignoreSymbols, "");
            let searchMembers = [];
            this.props.data.forEach(item => {
                if (this.props.keys.length == 1) {this.props.keys.unshift("")}
                if ((this.props.keys.reduce((prev, cur) => { return item[prev] + item[cur] })).replace(ignoreSymbols, "").toLowerCase().indexOf(searchText) != -1 ||
                    searchText.length < this.minQueryLength)
                    searchMembers.push(item);
            });
            this.props.handleSearch(searchMembers);
        };
        this.handleSearchInput = event => {
            this.setState({searchText: event.target.value.toLowerCase().trim()}, () => this.filterMembers());
        };
    }

    render(){
        return (
            <div className="search-field">
                <TextField
                    hintText="Search"
                    onChange={this.handleSearchInput}
                />
                {
                    (!Boolean(this.props.data.length) && <p className="filter-message">{this.props.emptyListMessage}</p>) ||
                    (Boolean(this.props.data.length) &&
                     !Boolean(this.props.dataSearch.length) &&
                     <p className="filter-message">{this.props.emptySearchMessage}</p>
                    )
                }
            </div>
        );
    }
}