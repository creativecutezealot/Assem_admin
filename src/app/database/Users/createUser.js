import React, { createRef } from 'react';
import { Form, Button, Row, Col, Modal, InputGroup } from 'react-bootstrap';

import './styles.scss';
import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';
import environment from '../../../enviroments';
import { handleUploadToS3 } from '../../../services/upload.service';
const placeHolderPng = require('../../../assets/avatar/admin.jpg');

const form_attries = [
    {
        name: 'email',
        label: 'Email',
        required: true,
    },
    {
        name: 'first_name',
        label: 'First Name',
        required: true,
    },
    {
        name: 'last_name',
        label: 'Last Name',
        required: true,
    },
    {
        name: 'phone_number',
        label: 'Phone Number',
        required: true,
    },
    {
        name: 'short_bio',
        label: 'Bio',
        type: 'textarea',
        maxLength: 500,
        required: true,
    },
    {
        name: 'job',
        label: 'Job Title',
        required: true,
    },
    {
        name: 'company',
        label: 'Company',
        required: true,
    },
    {
        name: 'industry',
        label: 'Industry',
        required: false,
    },
    {
        name: 'web_site',
        label: 'Web site',
        type: 'url',
        required: false,
    },
    {
        name: 'twitter_url',
        label: 'Twitter',
        type: 'url',
        required: false,
    },
    {
        name: 'linkedin_url',
        label: 'LinkedIn',
        type: 'url',
        required: false,
    },
];

class CreateUser extends React.Component {
    constructor(props) {
        super();
        this.state = {
            email: '',
            short_bio: '',
            job: '',
            company: '',
            industry: '',
            first_name: '',
            last_name: '',
            phone_number: '',
            web_site: '',
            twitter_url: '',
            linkedin_url: '',
            photoFile: null,
            photoFileSrc: null,
            photo_name: '',
            validated: false,
            updating: false,
        };
        this.createRefs();
    }

    createRefs = () => {
        form_attries.map((attr) => {
            this[`${attr.name}Ref`] = createRef();
            return 0;
        });
        this.fileRef = createRef();
    };

    handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            let userphoto = event.target.files[0];
            this.setState({
                photoFile: URL.createObjectURL(userphoto),
                photoFileSrc: userphoto,
                photo_name: userphoto.name ?? new Date().getTime().toString(),
            });
        }
    };

    handleSubmit = async (event) => {
        const form = event.currentTarget;
        const { photoFileSrc, photo_name } = this.state;
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.stopPropagation();
            this.setState({ validated: true });
            return;
        }

        if (!photoFileSrc) {
            event.stopPropagation();
            this.setState({ validated: true });
            helper.showToast('Warning', 'Please choose a user photo.', 2);
            return;
        }

        this.setState({
            updating: true,
        });

        this.setState({ validated: true });
        const createUserObj = {};
        form_attries.map((attr) => {
            const ref = this[`${attr.name}Ref`];
            if (ref && ref.current) {
                createUserObj[attr.name] = ref.current.value;
                this.setState({
                    [attr.name]: ref.current.value,
                });
            }
            return 0;
        });
        if (photoFileSrc) {
            const imgURL = await handleUploadToS3(
                photoFileSrc,
                photo_name,
                environment.ratio1_1
            );
            createUserObj['photo_url'] = imgURL;
        }
        this.createUser(createUserObj);
    };

    createUser = (createUserObj) => {
        adminApi
            .createUser(createUserObj)
            .then((response) => {
                this.setState({
                    updating: false,
                });
                if (response.status === true && response.data) {
                    this.props.getAllUsers();
                    this.props.handleShowModal();
                    helper.showToast(
                        'Success',
                        'User profile created successfully.',
                        1
                    );
                } else {
                    helper.showToast(
                        'Error',
                        'Failed to create the member profile',
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
                    'Failed to create the member profile',
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
                            className="input-row"
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
                            className="input-row"
                            ref={this[`${form_attr.name}Ref`]}
                            type="text"
                            required={form_attr.required}
                            pattern="[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)"
                            defaultValue={this.state[form_attr.name]}
                            name={form_attr.name}
                        />
                    ) : (
                        <Form.Control
                            className="input-row"
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
        const { showModal, handleShowModal } = this.props;
        const { validated, updating, photoFile } = this.state;
        const photo_src = photoFile ? photoFile : placeHolderPng;
        return (
            <Modal
                show={showModal}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                onHide={handleShowModal}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        ADD USER
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="create-user">
                        <div className="create-user-container">
                            <div className="create-user-wrapper">
                                <Row className="justify-content-md-start profile-form">
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <img
                                            className="create-user-img"
                                            src={photo_src}
                                            alt="profile"
                                        />
                                        <Button
                                            onClick={() => {
                                                if (this.fileRef.current) {
                                                    this.fileRef.current.click();
                                                }
                                            }}
                                        >
                                            ADD PHOTO
                                        </Button>
                                        <Form.File
                                            ref={this.fileRef}
                                            required
                                            name={'photo_url'}
                                            id={'photo_url'}
                                            label=""
                                            accept="image/*"
                                            className="hidden"
                                            onChange={this.handleFileChange}
                                        />
                                    </div>
                                    <Col className="create-user-section">
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
                                                        {updating
                                                            ? 'Processing...'
                                                            : 'SAVE'}
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleShowModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default CreateUser;
