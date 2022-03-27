import React from 'react';
import './completeresetpass.scss';
import { Form, Button } from 'react-bootstrap';

class CompleteResetPass extends React.Component {
    constructor(props) {
        super(props);
    }

    goNext = () => {
        this.props.history.push('/login');
    };

    render() {
        return (
            <div className='completeResetPass'>
                <Form className='login-form'>
                    <div className='d-flex align-items-center justify-content-center mt-2 title'>
                        YOUR PASSWORD HAS BEEN
                    </div>
                    <div className='d-flex align-items-center justify-content-center mb-2 title'>
                        CHANGED SUCCESSFULLY
                    </div>
                    <p className='d-flex align-items-center justify-content-center text-center mt-2 mb-4 description'>YOU WILL SHOW BE RETURNED TO THE LOGIN SCREEN.</p>
                    <div className='d-flex align-items-center justify-content-center'>
                        <Button
                            type='button'
                            className='btn btn-primary login-btn'
                            onClick={this.goNext}
                            ref={node => (this.btn = node)}
                        >
                            NEXT
                        </Button>
                    </div>
                </Form>
                <div className='background-overlay'></div>
                {/* <video className='video' autoPlay loop muted>
                    <source
                        src={require('../../../assets/video/background.mp4')}
                    />
                </video> */}
            </div>
        );
    }
}

export default CompleteResetPass;
