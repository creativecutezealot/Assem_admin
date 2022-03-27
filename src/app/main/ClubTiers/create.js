import React, { createRef } from 'react';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';

import './styles.scss';

import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';
import Content from '../../../components/content';

const form_attries = [
    {
        name: 'clubtier_name',
        label: 'CLUB TIER NAME',
    },
    {
        name: 'price',
        label: 'PRICE',
        type: 'price',
    },
];

class CreateClubTier extends React.Component {
    constructor(props) {
        super();
        this.state = {
            club_name: '',
            description: '',
            memebership: '',
            validated: false,
            loading: false,
            submitTitle: 'Submit',
        };
        this.createRefs();
    }

    componentDidMount() {
        this.createRefs();
    }

    handleInputChange = (event) => {
        let target = event.target;
        let name = target.name;
        let value = target.value;
        this.setState({
            [name]: value,
        });
    };

    createRefs = () => {
        form_attries.map((attr) => {
            this[`${attr.name}Ref`] = createRef();
            return 0;
        });
    };

    handleBack = () => {
        this.props.history.push('/admin/clubtiers');
    };

    handleSubmit = async (event) => {
        const { submitTitle } = this.state;
        if (submitTitle !== 'Submit') {
            return;
        }
        const form = event.currentTarget;
        event.preventDefault();
        console.log('create checkValidity ==> ', form.checkValidity());
        if (form.checkValidity() === false) {
            event.stopPropagation();
            this.setState({ validated: true });
            return;
        }

        this.setState({ validated: true, submitTitle: 'Creating...' });
        const updateObj = {};
        console.log('form_attries: ', form_attries);
        for (const idx in form_attries) {
            const attr = form_attries[idx];
            const ref = this[`${attr.name}Ref`];
            if (ref && ref.current) {
                if (ref.current.value === '') {
                    this.setState({ validated: true, submitTitle: 'Submit' });
                    return;
                }
                updateObj[attr.name] = ref.current.value;
                console.log('ref.current.value: ', ref.current.value);
                this.setState({
                    [attr.name]: ref.current.value,
                });
            } else {
                return;
            }
        }
        console.log('updateObj: ', updateObj);
        this.createClubTier(updateObj);
    };

    createClubTier = (updateObj) => {
        adminApi
            .createClubTier(updateObj)
            .then((response) => {
                this.setState({ submitTitle: 'Success' });
                setTimeout(() => {
                    this.setState({ submitTitle: 'Submit' });
                }, 2000);
                console.log('create res', response);
                if (response.status === true) {
                    helper.showToast(
                        'Success',
                        'Club tier created successfully.',
                        1
                    );
                    this.handleBack();
                } else {
                    helper.showToast(
                        'Error',
                        response.data || 'Failed to create the club tier',
                        3
                    );
                }
            })
            .catch((error) => {
                this.setState({ submitTitle: 'Failed' });
                setTimeout(() => {
                    this.setState({ submitTitle: 'Submit' });
                }, 2000);
                console.log('err: ', error);
                helper.showToast(
                    'Error',
                    error.message || 'Failed to create the club tier',
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
                className="justify-content-md-center input-row"
                style={{ maxWidth: '40vw' }}
            >
                <Form.Label as={Col}>{form_attr.label}</Form.Label>

                <InputGroup as={Col} className="input-area">
                    {form_attr.type === 'price' ? (
                        <>
                            <InputGroup.Prepend>
                                <InputGroup.Text>$</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                                ref={this[`${form_attr.name}Ref`]}
                                required
                                type="number"
                                name={form_attr.name}
                                onChange={this.handleInputChange}
                            />
                        </>
                    ) : (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            required
                            type="text"
                            name={form_attr.name}
                            onChange={this.handleInputChange}
                        />
                    )}
                </InputGroup>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
        );
    };

    render() {
        const { validated, loading } = this.state;
        return (
            <Content>
                <div className="club-list">
                    <Row className="justify-content-start">
                        <h4>CLUB TIERS</h4>
                    </Row>
                    <div className="club-list-container">
                        <Row className="justify-content-start">
                            <h5>CREATE CLUB TIER</h5>
                        </Row>
                        <Col style={{ marginTop: 30 }}>
                            {!loading ? (
                                <Form
                                    noValidate
                                    validated={validated}
                                    onSubmit={this.handleSubmit}
                                >
                                    {form_attries.map((attr) =>
                                        this.renderRow(attr)
                                    )}
                                    <Row className="justify-content-start">
                                        <Button
                                            variant={'primary'}
                                            type={'submit'}
                                            className="btn mt-5"
                                            onClick={this.handleSubmit}
                                        >
                                            Submit
                                        </Button>
                                        <Button
                                            type="button"
                                            className="btn btn-primary mt-5"
                                            style={{
                                                marginLeft: 30,
                                                backgroundColor: 'white',
                                                color: '#3B75B4',
                                            }}
                                            onClick={this.handleBack}
                                        >
                                            Cancel
                                        </Button>
                                    </Row>
                                </Form>
                            ) : (
                                <p className="text-center">Loading...</p>
                            )}
                        </Col>
                    </div>
                </div>
            </Content>
        );
    }
}

export default CreateClubTier;
