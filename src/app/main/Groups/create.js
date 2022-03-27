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

class CreateGroup extends React.Component {
    constructor(props) {
        super();
        this.state = {
            data_list: [],
            group_name: '',
            description: '',
            coupon_code: '',
            validated: false,
            loading: false,
            submitTitle: 'Submit',
            allGroups: [],
        };
        this.groupIdRef = createRef();
        this.groupIdRef.current = null;
        this.createRefs();
        this.initImageFile();
    }

    componentDidMount() {
        this.createRefs();
        this.getAllGroups();
    }

    getAllGroups = () => {
        adminApi
            .getAllGroups()
            .then((response) => {
                if (response.status === true) {
                    console.log(response.data);
                    var results = response.data;
                    this.setState({
                        allGroups: results,
                    });
                }
            })
            .catch((error) => {
                console.log('err: ', error);
            });
    };

    handleInputChange = (event) => {
        const { allGroups } = this.state;
        let target = event.target;
        let name = target.name;
        let value = target.value;
        if (name === 'group_name') {
            if (allGroups.length > 0) {
                let isValidGroup = false;
                for (let i = 0; i < allGroups.length; i++) {
                    if (allGroups[i]) {
                        if (allGroups[i].group_name === value || value === '') {
                            isValidGroup = false;
                            break;
                        } else {
                            isValidGroup = true;
                        }
                    }
                }
                console.log('isValidGroup: ', isValidGroup);
                this.setState({
                    isValidGroup: isValidGroup,
                });
            } else {
                this.setState({
                    isValidGroup: true,
                });
            }
        }
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

    handleBack = () => {
        this.props.history.push('/admin/groups');
    };

    handleFileChange = (blob, name) => {
        this.setState({
            [`imgFileSrc${name}`]: blob,
        });
    };

    handleSubmit = async (event) => {
        const { submitTitle, isValidGroup } = this.state;
        if (!isValidGroup) {
            helper.showToast('Error', 'Unique group name is required', 3);
            return;
        }
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
                this.setState({
                    [attr.name]: ref.current.value,
                });
            }
        }
        console.log('updateObj: ', updateObj);
        this.createGroup(updateObj);
    };

    createGroup = (updateObj) => {
        adminApi
            .createGroup(updateObj)
            .then((response) => {
                this.setState({ submitTitle: 'Success' });
                setTimeout(() => {
                    this.setState({ submitTitle: 'Submit' });
                }, 2000);
                console.log('create res', response);
                if (response.status === true && response.data) {
                    // if (this.state.roomUrls.length > 0) {
                    //     this.createRoomUrls(response.data.group_id)
                    // }
                    helper.showToast(
                        'Success',
                        'Group created successfully.',
                        1
                    );
                    this.handleBack();
                } else {
                    helper.showToast('Error', 'Failed to create the group', 3);
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
                    error.message || 'Failed to create the group',
                    3
                );
            });
    };

    generateCouponCode = () => {
        let firstPart = (Math.random() * 46656) | 0;
        let secondPart = (Math.random() * 46656) | 0;
        firstPart = ('000' + firstPart.toString(36)).slice(-4);
        secondPart = ('000' + secondPart.toString(36)).slice(-4);
        let coupon_code = firstPart + '-' + secondPart;

        this.setState({
            coupon_code: coupon_code,
        });
    };

    renderRow = (form_attr) => {
        const { isValidGroup } = this.state;
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
                            onChange={this.handleInputChange}
                            isValid={isValidGroup !== undefined && isValidGroup}
                            isInvalid={
                                isValidGroup !== undefined && !isValidGroup
                            }
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
                            <h5>CREATE GROUP</h5>
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

export default CreateGroup;
