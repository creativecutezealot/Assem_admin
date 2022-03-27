import React, { createRef } from 'react';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import './styles.scss';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';
import Content from '../../../components/content';

const form_attries = [
    {
        name: 'referral_name',
        label: 'Name',
        required: true,
    },
    {
        name: 'referral_email',
        label: 'Email',
        required: true,
    },
    {
        name: 'referral_phone',
        label: 'Phone',
        required: false,
    },
    {
        name: 'referral_linkedin',
        label: 'LinkedIn',
        type: 'url',
        required: false,
    },
    {
        name: 'referral_info',
        label: 'Ohter Info',
        type: 'textarea',
        maxLength: 500,
        required: false,
    },
];

class MemberReferral extends React.Component {
    constructor(props) {
        super();
        this.state = {
            referral_email: '',
            referral_name: '',
            referral_phone: '',
            referral_info: '',
            referral_linkedin: '',
            refreral_res: null,
            validated: false,
            updating: false,
        };
        this.createRefs();
    }

    getClub = () => {
        const {
            history: {
                location: {
                    state: { club },
                },
            },
        } = this.props;
        return club;
    };

    createRefs = () => {
        form_attries.map((attr) => {
            this[`${attr.name}Ref`] = createRef();
            return 0;
        });
    };

    handleBack = () => {
        this.props.history.push('/user/clubs');
    };

    handleReset = () => {
        this.setState({
            referral_email: '',
            referral_name: '',
            referral_phone: '',
            referral_info: '',
            referral_linkedin: '',
            refreral_res: null,
            validated: false,
            updating: false,
        });
    };

    handleSubmit = async (event) => {
        const form = event.currentTarget;
        const user = session.get('futureof-user');
        const club = this.getClub();

        event.preventDefault();
        if (form.checkValidity() === false) {
            event.stopPropagation();
            this.setState({ validated: true });
            return;
        }

        this.setState({
            updating: true,
        });

        this.setState({ validated: true });
        const referralObj = {};
        form_attries.map((attr) => {
            const ref = this[`${attr.name}Ref`];
            if (ref && ref.current) {
                referralObj[attr.name] = ref.current.value;
                this.setState({
                    [attr.name]: ref.current.value,
                });
            }
            return 0;
        });
        referralObj['referral_user_id'] = user.user_id;
        referralObj[
            'referral_user_name'
        ] = `@${user.first_name}${user.last_name}`;
        referralObj['referral_club_id'] = club.club_id;
        referralObj['referral_club_name'] = club.club_name;
        console.log(referralObj);
        this.createReferral(referralObj);
    };

    createReferral = (referralObj) => {
        adminApi
            .createReferral(referralObj)
            .then((response) => {
                this.setState({
                    updating: false,
                });
                if (response.status === true && response.data) {
                    this.setState({
                        refreral_res: response.data,
                    });
                    helper.showToast(
                        'Success',
                        'Member referral created successfully.',
                        1
                    );
                } else {
                    helper.showToast(
                        'Error',
                        'Failed to create the member referral',
                        3
                    );
                }
            })
            .catch((error) => {
                console.log('err: ', error);
                this.setState({
                    updating: false,
                });
                helper.showToast(
                    'Error',
                    'Failed to create the member referral',
                    3
                );
            });
    };

    renderRow = (form_attr) => {
        return (
            <Form.Group
                key={form_attr.name}
                as={Col}
                controlId={`${form_attr.name}`}
                className="justify-content-md-start input-row"
            >
                <Form.Label as={Col}>{form_attr.label}</Form.Label>

                <InputGroup as={Col} className="input-area">
                    {form_attr.type === 'textarea' ? (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            as="textarea"
                            rows={5}
                            maxLength={form_attr.maxLength}
                            required={form_attr.required}
                            defaultValue={this.state[form_attr.name]}
                            name={form_attr.name}
                        />
                    ) : form_attr.type === 'url' ? (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            type="text"
                            required={form_attr.required}
                            pattern="[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)"
                            defaultValue={this.state[form_attr.name]}
                            name={form_attr.name}
                        />
                    ) : (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            required={form_attr.required}
                            type="text"
                            defaultValue={this.state[form_attr.name]}
                            name={form_attr.name}
                        />
                    )}
                </InputGroup>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
        );
    };

    render() {
        const { validated, updating, refreral_res } = this.state;
        return (
            <Content>
                <div className="referral">
                    <Row className="justify-content-md-start">
                        <h4>
                            MEMBER REFERRALS for{' '}
                            {helper.getDisplayName(
                                this.getClub().club_name,
                                '#'
                            )}
                        </h4>
                    </Row>
                    <div className="referral-container">
                        <div className="referral-wrapper">
                            <Row className="justify-content-md-start profile-form">
                                <Col className="referral-section">
                                    {refreral_res === null ? (
                                        <Form
                                            noValidate
                                            validated={validated}
                                            onSubmit={this.handleSubmit}
                                        >
                                            {form_attries.map((attr) =>
                                                this.renderRow(attr)
                                            )}
                                            <Row className="justify-content-md-start">
                                                <Col>
                                                    <Button
                                                        disabled={updating}
                                                        style={{
                                                            marginTop: 30,
                                                        }}
                                                        type="submit"
                                                        className="btn btn-primary"
                                                    >
                                                        SUBMIT
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Form>
                                    ) : (
                                        <>
                                            <Row
                                                className="justify-content-md-center"
                                                style={{ marginTop: '10vh' }}
                                            >
                                                <h4>Thank you!</h4>
                                            </Row>
                                            <Row className="justify-content-md-center">
                                                <h5>
                                                    Your information has been
                                                    sent and will be reviewed by
                                                    your Club Managers.
                                                </h5>
                                            </Row>
                                            <Row
                                                className="justify-content-md-center"
                                                style={{ marginTop: 60 }}
                                            >
                                                <Button
                                                    onClick={this.handleReset}
                                                    style={{
                                                        minWidth: 200,
                                                        marginRight: 30,
                                                    }}
                                                    className="btn btn-primary"
                                                >
                                                    SUBMIT ANOTHER REFERRAL
                                                </Button>
                                                <Button
                                                    onClick={this.handleBack}
                                                    style={{
                                                        minWidth: 200,
                                                        marginLeft: 30,
                                                    }}
                                                    className="btn btn-primary"
                                                >
                                                    RETURN TO CLUBS
                                                </Button>
                                            </Row>
                                        </>
                                    )}
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </Content>
        );
    }
}

export default MemberReferral;
