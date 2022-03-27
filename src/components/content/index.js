import React from 'react';
import { Container } from 'react-bootstrap';

class Content extends React.Component {
    render() {
        return (
            <Container fluid className={'main-content'}>
                {this.props.children}
            </Container>
        );
    }
}

export default Content;
