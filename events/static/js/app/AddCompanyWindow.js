import React from 'react';
import Dialog from 'material-ui/Dialog';
import CompanyTextField from './CompanyTextField';

export default class AddCompanyWindow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            description: '',
            admin: ''
        };

        this.handleTitle = this.handleTitle.bind(this);
        this.handleDescription = this.handleDescription.bind(this);
    }

    handleTitle(event) {
        this.setState({
            name: event.target.value
        })
    }

    handleDescription(event) {
            this.setState({
                description: event.target.value
            })
        }



    render() {

        const styles = {

            dialogTitle: {
                backgroundColor: 'rgb(0, 151, 167)',
                color: '#f9f9f9',
                fontSize: '30px'
            },
            dialogRoot: {
                margin: '0 auto',
                maxWidth: '500px',
                width: '100%'
            },
            dialogBody: {
                paddingTop: '20px',
            },
            dialogBodyMenuStyle: {
                maxHeight: '200px'
            },

        };

        return (
            <Dialog
                open={this.props.open}
                contentStyle={styles.dialogRoot}
            >
                <CompanyTextField
                    value='test'
                    label='Company title'
                    ref="title"
                    onChange={this.handleTitle}
                />
                <br/>
                <CompanyTextField
                    label='Company description'
                    ref="desc"
                    multiLine={true}
                    rows={3}
                    rowsMax={5}
                    fullWidth={true}
                    onChange={this.handleDescription}

                />
            </Dialog>
        );
    }
}