import React, { createRef } from 'react';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';

import './styles.scss';

import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';
import Content from '../../../components/content';

const form_attries = [
    {
        name: 'group_name',
        label: 'GROUP NAME',
    },
    {
        name: 'description',
        label: 'GROUP DESCRIPTION',
        type: 'textarea',
        maxLength: 500,
    },
    {
        name: 'coupon_code',
        label: 'COUPON CODE',
        type: 'code',
    },
];

class EditGroup extends React.Component {
    constructor(props) {
        super();
        this.state = {
            group_name: '',
            description: '',
            coupon_code: '',
            validated: false,
            loading: false,
            submitTitle: 'Submit',
        };
        this.groupIdRef = createRef();
        this.groupIdRef.current = null;
        this.createRefs();
        this.initImageFile();
    }

    componentDidMount() {
        this.createRefs();
        this.getGroupDetails();
    }

    createRefs = () => {
        form_attries.map((attr) => {
            this[`${attr.name}Ref`] = createRef();
            return 0;
        });
    };

    initImageFile = () => {
        form_attries
            .filter((a) => a.type === 'image')
            .map((attr) => {
                this.setState({
                    [`imgFileSrc${attr.name}`]: null,
                });
                return 0;
            });
    };

    getGroupDetails = () => {
        this.setState({ loading: true });
        const group_id = window.location.href.split('/admin/groups/edit/')[1];
        this.groupIdRef.current = group_id;
        console.log('group edit ==>', this.groupIdRef.current);
        adminApi
            .getGroup(group_id)
            .then((response) => {
                this.setState({ loading: false });
                console.log('group edit res ==>', response);
                if (response.status === true) {
                    const group = response.data.group;
                    form_attries.map((attr) => {
                        this.setState({
                            [attr.name]: group[attr.name],
                        });
                        return 0;
                    });
                } else {
                    helper.showToast('Error', response.data, 3);
                }
            })
            .catch((error) => {
                this.setState({ loading: false });
                helper.showToast(
                    'Error',
                    error.message || 'There is an error while getting group.',
                    3
                );
                console.log('err: ', error);
            });
    };

    handleBack = () => {
        this.props.history.push('/admin/groups');
    };

    handleSubmit = async (event) => {
        const { submitTitle } = this.state;
        if (submitTitle !== 'Submit') {
            return;
        }
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.stopPropagation();
            this.setState({ validated: true });
            return;
        }

        this.setState({ validated: true, submitTitle: 'Updating...' });
        const updateObj = {};
        for (const idx in form_attries) {
            const attr = form_attries[idx];
            const ref = this[`${attr.name}Ref`];
            if (ref && ref.current) {
                if (ref.current.value === '') {
                    this.setState({ validated: true, submitTitle: 'Submit' });
                    return;
                }
                updateObj[attr.name] = ref.current.value;
                this.setState({
                    [attr.name]: ref.current.value,
                });
            }
        }
        console.log('update obj ==> ', updateObj);
        this.updateGroup(updateObj);
    };

    updateGroup = (updateObj) => {
        if (this.groupIdRef.current) {
            adminApi
                .updateGroup(this.groupIdRef.current, updateObj)
                .then((response) => {
                    this.setState({ submitTitle: 'Success' });
                    setTimeout(() => {
                        this.setState({ submitTitle: 'Submit' });
                    }, 2000);
                    if (response.status === true && response.data) {
                        helper.showToast(
                            'Success',
                            'Group updated successfully.',
                            1
                        );
                        this.handleBack();
                    } else {
                        helper.showToast(
                            'Error',
                            'Failed to update the group',
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
                        error.message || 'Failed to update the group',
                        3
                    );
                });
        }
    };

    renderRow = (form_attr) => {
        // const group_id = window.location.href.split('/admin/groups/edit/')[1];
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
                    {form_attr.type === 'textarea' ? (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            as="textarea"
                            rows={5}
                            maxLength={form_attr.maxLength}
                            required
                            defaultValue={this.state[form_attr.name]}
                            name={form_attr.name}
                        />
                    ) : form_attr.type === 'code' ? (
                        <>
                            <Form.Control
                                ref={this[`${form_attr.name}Ref`]}
                                required
                                type="text"
                                maxLength={7}
                                value={this.state[form_attr.name]}
                                name={form_attr.name}
                                onChange={this.handleInputChange}
                            />
                            <Button
                                className="ml-2"
                                onClick={this.generateCouponCode}
                            >
                                Change Code
                            </Button>
                        </>
                    ) : (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            required
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
        const { validated, loading } = this.state;
        return (
            <Content>
                <div className="group-list">
                    <Row className="justify-content-start">
                        <h4>GROUPS</h4>
                    </Row>
                    <div className="group-list-container">
                        <Row className="justify-content-start">
                            <h5>EDIT GROUP</h5>
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

export default EditGroup;
