import React, { createRef } from 'react';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import './styles.scss';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';
import stripeService from '../../../services/stripe.service';
import environment from '../../../enviroments';
import { handleUploadToS3 } from '../../../services/upload.service';
import Content from '../../../components/content';

const querystring = require('querystring');
const placeHolderPng = require('../../../assets/avatar/admin.jpg');
const form_attries = [
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
    },
    {
        name: 'phone_number',
        label: 'Phone',
        type: 'tel',
        required: false,
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
        name: 'username',
        label: 'User Name',
        type: 'username',
        required: true,
    },
    {
        name: 'password',
        label: 'Password',
        type: 'password',
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
    // {
    //     name: 'industry',
    //     label: 'Industry',
    //     required: false
    // },
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

const form_attries1 = [
    {
        name: 'current_password',
        label: 'Current Password',
        type: 'current_password',
        required: true,
    },
    {
        name: 'new_password',
        label: 'New Password',
        type: 'new_password',
        required: true,
    },
    {
        name: 'rnew_password',
        label: 'Repeat New Password',
        type: 'rnew_password',
        required: true,
    },
];

class Profile extends React.Component {
    constructor(props) {
        super();
        this.state = {
            email: '',
            phone_number: '',
            short_bio: '',
            job: '',
            company: '',
            industry: '',
            first_name: '',
            last_name: '',
            username: '',
            password: '',
            web_site: '',
            twitter_url: '',
            linkedin_url: '',
            photo_url: '',
            validated: false,
            photoFile: null,
            photoFileSrc: null,
            photo_name: '',
            updating: false,
            stripeConnect: null,
            allusers: [],
            current_password: '',
            new_password: '',
            rnew_password: '',
        };
        this.createRefs();
    }

    componentDidMount() {
        this.getAuthAllUsers();
        const user = session.get('futureof-user');
        if (user) {
            this.loadUserInfo(user);
            this.getStripeConnect();
            const parsed = querystring.parse(this.props.location.search);
            if (parsed.code) {
                stripeService
                    .createStripeConnectRequest(parsed.code)
                    .then((data) => {
                        this.getStripeConnect();
                    })
                    .catch((error) => {
                        console.log('createStripeConnectRequest error', error);
                    });
            }
        }
    }

    getAuthAllUsers = async () => {
        try {
            const allusers = await adminApi.getAuthAllUsers();
            if (allusers.status) {
                if (allusers) {
                    this.setState({
                        allusers: allusers.data,
                    });
                    console.log('all users: ', allusers.data);
                    const currentUser = session.get('futureof-user');
                    if (currentUser) {
                        const email = currentUser.email
                            ? currentUser.email
                            : '';
                        const firstname = currentUser.first_name
                            ? currentUser.first_name
                            : '';
                        const lastname = currentUser.last_name
                            ? currentUser.last_name
                            : '';
                        const username = currentUser.username
                            ? currentUser.username
                            : '';
                        const users = allusers.data.filter(
                            (user) =>
                                user.approved === true &&
                                user.email !== email &&
                                user.username !== username
                        );
                        let isEmailValid = false;
                        let isValid = false;
                        for (let i = 0; i < users.length; i++) {
                            if (users[i]) {
                                if (users[i].email === email || email === '') {
                                    isEmailValid = false;
                                    break;
                                } else {
                                    isEmailValid = true;
                                }
                            }
                        }
                        for (let i = 0; i < users.length; i++) {
                            if (users[i]) {
                                if (
                                    users[i].username === username ||
                                    username === ''
                                ) {
                                    isValid = false;
                                    break;
                                } else {
                                    isValid = true;
                                }
                            }
                        }
                        this.setState({
                            email: email,
                            first_name: firstname,
                            last_name: lastname,
                            username: username,
                            isEmailValid: isEmailValid,
                            isValid: isValid,
                        });
                    }
                }
            } else {
                helper.showToast('Error', allusers.data, 3);
            }
        } catch (error) {
            helper.showToast('Error', 'Getting All User Failed', 3);
        }
    };

    loadUserInfo = (user) => {
        form_attries.map((attr) => {
            this.setState({
                [attr.name]: user[attr.name],
            });
            return 0;
        });

        this.setState({
            photo_url: user.photo_url,
        });
    };

    getStripeConnect = async () => {
        try {
            const data = await stripeService.getStripeConnect();
            if (data.status) {
                this.setState({
                    stripeConnect: data.data,
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    createRefs = () => {
        form_attries.map((attr) => {
            this[`${attr.name}Ref`] = createRef();
            return 0;
        });
        this.fileRef = createRef();
    };

    handleBack = () => {
        this.props.history.push('/');
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
        const { photo_url, photoFileSrc, photo_name } = this.state;
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.stopPropagation();
            this.setState({ validated: true });
            return;
        }

        if (photo_url === '' && !photoFileSrc) {
            event.stopPropagation();
            this.setState({ validated: true });
            return;
        }

        this.setState({
            updating: true,
        });

        this.setState({ validated: true });
        const updateObj = {};
        form_attries.map((attr) => {
            const ref = this[`${attr.name}Ref`];
            if (ref && ref.current) {
                updateObj[attr.name] = ref.current.value;
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
            updateObj['photo_url'] = imgURL;
        }
        this.updateAdmin(updateObj);
    };

    handlePasswordChange = async (event) => {
        const form = event.currentTarget;
        const { current_password, new_password, rnew_password } = this.state;
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
        console.log(
            'handlePasswordChange: ',
            current_password,
            new_password,
            rnew_password
        );
        if (!this.validatePassword(new_password)) {
            helper.showToast(
                'Error',
                'Password must include at least 8 characters including 1 number or 1 special character.',
                3
            );
            this.setState({
                updating: false,
            });
            return;
        }
        if (current_password === '') {
            this.setState({
                updating: false,
            });
            return;
        }
        if (new_password !== rnew_password) {
            helper.showToast('Error', 'Passwords do not match.', 3);
            this.setState({
                updating: false,
            });
            return;
        }
        const currentUser = session.get('futureof-user');
        const updateObj = {
            userid: currentUser.user_id,
            password: new_password,
            current_password: current_password,
        };
        this.updatePassword(updateObj);
    };

    updatePassword = (updateObj) => {
        adminApi
            .updateAdmin(updateObj)
            .then((response) => {
                this.setState({
                    updating: false,
                });
                if (response.status === true && response.data) {
                    session.set('futureof-user', response.data);
                    this.loadUserInfo(response.data);
                    helper.showToast(
                        'Success',
                        'Member password updated successfully.',
                        1
                    );
                } else {
                    helper.showToast('Error', response.data, 3);
                }
            })
            .catch((error) => {
                console.log('err: ', error);
                this.setState({
                    updating: false,
                });
                helper.showToast('Error', error, 3);
            });
    };

    updateAdmin = (updateObj) => {
        adminApi
            .updateAdmin(updateObj)
            .then((response) => {
                this.setState({
                    updating: false,
                });
                if (response.status === true && response.data) {
                    session.set('futureof-user', response.data);
                    this.loadUserInfo(response.data);
                    helper.showToast(
                        'Success',
                        'Member profile updated successfully.',
                        1
                    );
                } else {
                    helper.showToast(
                        'Error',
                        'Failed to update the member profile',
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
                    'Failed to update the member profile',
                    3
                );
            });
    };

    handleInputChange = (event) => {
        const currentUser = session.get('futureof-user');
        const { allusers, first_name, last_name } = this.state;
        let target = event.target;
        let name = target.name;
        let value = target.value;
        let isValid = false;
        let isEmailValid = true;

        let users = allusers.filter(
            (user) =>
                user.approved === true &&
                user.email !== currentUser.email &&
                user.username !== currentUser.username
        );

        if (name === 'email') {
            if (!this.validateEmail(value)) {
                isEmailValid = false;
                this.setState({
                    isEmailValid: isEmailValid,
                    email: value,
                });
                setTimeout(() => {
                    this.validateForm();
                }, 500);
                return;
            }

            for (let i = 0; i < users.length; i++) {
                if (users[i]) {
                    if (users[i].email === value || value === '') {
                        isEmailValid = false;
                        break;
                    } else {
                        isEmailValid = true;
                    }
                }
            }

            this.setState({
                isEmailValid: isEmailValid,
                email: value,
            });
            setTimeout(() => {
                this.validateForm();
            }, 500);
        }
        if (name === 'first_name') {
            const username = value + last_name;
            for (let i = 0; i < users.length; i++) {
                if (users[i]) {
                    if (users[i].username === username || value === '') {
                        isValid = false;
                        break;
                    } else {
                        isValid = true;
                    }
                }
            }

            this.setState({
                isValid: isValid,
                username: username.toLowerCase(),
            });
            setTimeout(() => {
                this.validateForm();
            }, 500);
        }
        if (name === 'last_name') {
            const username = first_name + value;
            for (let i = 0; i < users.length; i++) {
                if (users[i]) {
                    if (users[i].username === username || value === '') {
                        isValid = false;
                        break;
                    } else {
                        isValid = true;
                    }
                }
            }

            this.setState({
                isValid: isValid,
                username: username.toLowerCase(),
            });
            setTimeout(() => {
                this.validateForm();
            }, 500);
        }
        if (name === 'current_password') {
            this.setState({
                current_password: value,
            });
        }
        if (name === 'new_password') {
            this.setState({
                new_password: value,
            });
        }
        if (name === 'rnew_password') {
            this.setState({
                rnew_password: value,
            });
        } else {
            this.setState({
                [name]: value,
            });
            setTimeout(() => {
                this.validateForm();
            }, 500);
        }
    };

    handleUsername = async (event) => {
        const { allusers } = this.state;
        let target = event.target;
        let name = target.name;
        let value = target.value;

        let isValid = false;
        let users = allusers.filter((user) => user.approved === true);
        for (let i = 0; i < users.length; i++) {
            if (users[i]) {
                if (users[i].username === value || value === '') {
                    isValid = false;
                    break;
                } else {
                    isValid = true;
                }
            }
        }

        console.log('isValid: ', isValid, value);
        this.setState({
            isValid: isValid,
            [name]: value.toLowerCase(),
        });
        setTimeout(() => {
            this.validateForm();
        }, 500);
    };

    changePassword = () => {
        console.log('change password: ');
        this.setState({
            isChangePassword: true,
        });
    };

    validateEmail = (email) => {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    validatePassword = (password) => {
        const re =
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        return re.test(password);
    };

    validateForm = () => {
        const {
            isEmailValid,
            first_name,
            last_name,
            isValid,
            password,
            repassword,
        } = this.state;
        if (!isEmailValid) {
            this.setState({
                isValidForm: false,
            });
            return;
        }
        if (first_name === '') {
            this.setState({
                isValidForm: false,
            });
            return;
        }
        if (last_name === '') {
            this.setState({
                isValidForm: false,
            });
            return;
        }
        if (!isValid) {
            this.setState({
                isValidForm: false,
            });
            return;
        }
        if (password === '') {
            return false;
        }
        if (repassword === '') {
            this.setState({
                isValidForm: false,
            });
            return;
        }
        if (
            isValid === true &&
            isEmailValid === true &&
            first_name !== '' &&
            last_name !== '' &&
            password !== '' &&
            repassword !== ''
        ) {
            this.setState({
                isValidForm: true,
            });
            return;
        }
    };

    renderRow = (form_attr) => {
        const { isEmailValid } = this.state;
        return (
            <Form.Group
                key={form_attr.name}
                as={Col}
                controlId={`${form_attr.name}`}
                className="justify-content-md-start input-row"
            >
                <Form.Label as={Col}>{form_attr.label}</Form.Label>

                <InputGroup as={Col} className="input-area">
                    {form_attr.type === 'email' ? (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            type="email"
                            required={form_attr.required}
                            defaultValue={this.state[form_attr.name]}
                            name={form_attr.name}
                            onChange={this.handleInputChange}
                            onKeyPress={this.onKeyPress}
                            isInvalid={
                                isEmailValid !== undefined && !isEmailValid
                            }
                        />
                    ) : form_attr.type === 'textarea' ? (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            as="textarea"
                            rows={5}
                            maxLength={form_attr.maxLength}
                            required={form_attr.required}
                            defaultValue={this.state[form_attr.name]}
                            name={form_attr.name}
                            onKeyPress={this.onKeyPress}
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
                    ) : form_attr.type === 'tel' ? (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            type="tel"
                            required={form_attr.required}
                            readOnly
                            pattern="^\+(?:[0-9]●?){6,14}[0-9]$"
                            defaultValue={this.state[form_attr.name]}
                            name={form_attr.name}
                            // onChange={this.handleInputChange}
                            onKeyPress={this.onKeyPress}
                            style={{
                                backgroundColor: 'transparent',
                                color: 'grey',
                            }}
                        />
                    ) : form_attr.type === 'username' ? (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            type="text"
                            required={form_attr.required}
                            readOnly
                            defaultValue={this.state[form_attr.name]}
                            name={form_attr.name}
                            // onChange={this.handleUsername}
                            // isInvalid={this.state[form_attr.name] !== '' && isValid !== undefined && !isValid}
                            onKeyPress={this.onKeyPress}
                            style={{
                                backgroundColor: 'transparent',
                                color: 'grey',
                            }}
                        />
                    ) : form_attr.type === 'password' ? (
                        <>
                            <Form.Control
                                ref={this[`${form_attr.name}Ref`]}
                                type="password"
                                required={form_attr.required}
                                readOnly
                                defaultValue={this.state[form_attr.name]}
                                name={form_attr.name}
                                onChange={this.handleInputChange}
                                onKeyPress={this.onKeyPress}
                                style={{ backgroundColor: 'transparent' }}
                            />
                            <Button
                                className="btn btn-primary ml-2"
                                onClick={this.changePassword}
                            >
                                Change Password
                            </Button>
                        </>
                    ) : form_attr.type === 'current_password' ? (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            type="password"
                            required={form_attr.required}
                            defaultValue={this.state[form_attr.name]}
                            name={form_attr.name}
                            // pattern='^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$'
                            onChange={this.handleInputChange}
                            onKeyPress={this.onKeyPress}
                            style={{ backgroundColor: 'transparent' }}
                        />
                    ) : form_attr.type === 'new_password' ? (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            type="password"
                            required={form_attr.required}
                            defaultValue={this.state[form_attr.name]}
                            name={form_attr.name}
                            pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$"
                            onChange={this.handleInputChange}
                            style={{ backgroundColor: 'transparent' }}
                        />
                    ) : form_attr.type === 'rnew_password' ? (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            type="password"
                            required={form_attr.required}
                            defaultValue={this.state[form_attr.name]}
                            name={form_attr.name}
                            pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$"
                            onChange={this.handleInputChange}
                            onKeyPress={this.onKeyPress}
                            style={{ backgroundColor: 'transparent' }}
                        />
                    ) : (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            required={form_attr.required}
                            type="text"
                            defaultValue={this.state[form_attr.name]}
                            name={form_attr.name}
                            onKeyPress={this.onKeyPress}
                        />
                    )}
                </InputGroup>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
        );
    };

    onKeyPress = (event) => {
        if (event.charCode === 13) {
            this.btn.click();
        }
    }

    render() {
        const { validated, photoFile, photo_url, updating } = this.state;
        const photo_src = photoFile
            ? photoFile
            : photo_url !== ''
                ? photo_url
                : placeHolderPng;
        const user = session.get('futureof-user');
        const club = session.get('futureof-club');
        return (
            <Content>
                <div className="profile">
                    <Row className="justify-content-md-start">
                        <h4>EDIT PROFILE</h4>
                    </Row>
                    <div className="edit-profile-container">
                        <Row className="justify-content-md-start">
                            <h5>PROFILE</h5>
                        </Row>
                        <div className="edit-profile-wrapper">
                            <Row className="justify-content-md-start profile-form">
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <img
                                        className="edit-profile-img"
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
                                        EDIT PHOTO
                                    </Button>
                                    {user &&
                                        user.user_role === 'manager' &&
                                        club &&
                                        club.is_connect_stripe && (
                                            <Button
                                                style={{ marginTop: 16 }}
                                                onClick={() => {
                                                    window.location =
                                                        stripeService.getStripeStandardOAuthLink();
                                                }}
                                            >
                                                {this.state.stripeConnect
                                                    ? 'UPDATE PAYMENT INFO'
                                                    : 'ADD PAYMENT INFO'}
                                            </Button>
                                        )}
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
                                <Col className="edit-profile-section">
                                    {this.state.isChangePassword !== true ? (
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
                                                        ref={node => (this.btn = node)}
                                                    >
                                                        SAVE
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Form>
                                    ) : (
                                        <Form
                                            noValidate
                                            validated={validated}
                                            onSubmit={this.handlePasswordChange}
                                        >
                                            {form_attries1.map((attr) =>
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
                                                        CHANGE PASSWORD
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Form>
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

export default Profile;
