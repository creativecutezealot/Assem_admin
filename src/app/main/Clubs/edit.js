import React, { createRef } from 'react';
import {
    Form,
    Button,
    Row,
    Col,
    InputGroup,
    ToggleButtonGroup,
    ToggleButton,
} from 'react-bootstrap';

import './styles.scss';
import { checkURL } from '../../database/Model';

import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';
import environment from '../../../enviroments';
import { handleUploadToS3 } from '../../../services/upload.service';
import Content from '../../../components/content';
import { ImageForm } from '../components/ImageForm';
import GalleryBtn from './gallery';

const form_attries = [
    {
        name: 'club_name',
        label: 'CLUB NAME',
    },
    {
        name: 'description',
        label: 'CLUB DESCRIPTION',
        type: 'textarea',
        maxLength: 500,
    },
    {
        name: 'photo_url',
        label: 'IMAGE',
        type: 'image',
        aspect: 4 / 5,
        ratio: environment.ratio4_5,
    },
    {
        name: 'banner_url',
        label: 'HEADER IMAGE',
        type: 'image',
        aspect: 4 / 1,
        ratio: environment.ratio4_1,
    },
    {
        name: 'assemble_photo_url',
        label: 'ROOM IMAGE',
        type: 'image',
        aspect: 4 / 3,
        ratio: environment.ratio4_3,
    },
    {
        name: 'web_banner_url',
        label: 'WEB BANNER IMAGE',
        type: 'image',
        aspect: 16 / 3,
        ratio: environment.ratio16_3,
    },
    // {
    //     name: 'voice_photo_url',
    //     label: 'VOICE NOTE IMAGE',
    //     type: 'image',
    //     aspect: 4 / 3,
    //     ratio: environment.ratio4_3
    // },
    // {
    //     name: 'isdue',
    //     label: 'PAID CLUB?',
    //     type: 'check',
    // },
    {
        name: 'memebership',
        label: 'CLUB TIER',
        type: 'select',
    },
    {
        name: 'is_private',
        label: 'CLUB TYPE',
        type: 'check',
    },
    {
        name: 'access_code',
        label: 'Invite Code',
        type: 'code',
    },
    {
        name: 'is_visible',
        label: 'CLUB VISIBILITY',
        type: 'visible',
    },
    {
        name: 'minimum_number',
        label: 'Minimum members:',
        type: 'minimum_number',
    },
    {
        name: 'maximum_number',
        label: 'Maximum members:',
        type: 'maximum_number',
    },
];

class EditClub extends React.Component {
    constructor(props) {
        super();
        this.state = {
            club_name: '',
            description: '',
            photo_url: '',
            banner_url: '',
            assemble_photo_url: '',
            web_banner_url: '',
            voice_photo_url: '',
            isdue: false,
            memebership: '',
            is_private: 0,
            is_visible: 0,
            access_code: '',
            validated: false,
            loading: false,
            audioFile: null,
            audioFileSrc: null,
            submitTitle: 'Submit',
            min_number: 0,
            max_number: 1000,
            club_tiers: [],
            club_list: [],
        };
        this.clubIdRef = createRef();
        this.clubIdRef.current = null;
        this.createRefs();
        this.initImageFile();
    }

    componentDidMount() {
        this.createRefs();
        this.getClubDetails();
        this.onGetAllClubTiers();
        this.getAllClubs();
    }

    getAllClubs = () => {
        this.setState({
            loading: true,
        });
        adminApi
            .getAllClubs()
            .then((response) => {
                if (response.status) {
                    console.log(response.data);
                    var results = response.data;
                    this.setState({
                        club_list: results,
                    });
                    console.log('results: ', results);
                }
            })
            .catch((error) => {
                console.log('err: ', error);
            });
    };

    onGetAllClubTiers = () => {
        adminApi
            .getAllClubTiers()
            .then((response) => {
                if (response.status === true) {
                    var results = response.data;
                    this.setState({
                        club_tiers: results.sort((a, b) => {
                            if (a.price < b.price) {
                                return -1;
                            }
                            if (a.price > b.price) {
                                return 1;
                            }
                            return 0;
                        }),
                        loading: false,
                    });
                }
            })
            .catch((error) => {
                console.log('err: ', error);
                this.setState({
                    loading: false,
                });
            });
    };

    handleInputChange = (event) => {
        let target = event.target;
        let name = target.name;
        let value = target.value;
        if (name === 'access_code') {
            const { club_list } = this.state;
            let clubs = club_list.filter((club) => club.access_code === value);
            let isCodeValid;
            console.log('inputechange: ', value.length);
            if ((clubs && clubs.length > 0) || value.length !== 5) {
                console.log('inputechange1: ');
                isCodeValid = false;
            } else {
                isCodeValid = true;
            }
            this.setState({
                isCodeValid,
            });
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

    getClubDetails = () => {
        this.setState({ loading: true });
        const club_id = window.location.href.split('/admin/clubs/edit/')[1];
        this.clubIdRef.current = club_id;
        console.log('club edit ==>', this.clubIdRef.current);
        adminApi
            .getClub(club_id)
            .then((response) => {
                this.setState({ loading: false });
                console.log('club edit res ==>', response);
                if (response.status === true) {
                    const club = response.data.club;
                    console.log('club: ', club);

                    form_attries.map((attr) => {
                        if (
                            attr.name === 'is_private' ||
                            attr.name === 'is_visible'
                        ) {
                            let that = this;
                            setTimeout(() => {
                                that.setState({
                                    [attr.name]: Number(club[attr.name]),
                                });
                            }, 1000);

                            console.log(attr.name, Number(club[attr.name]));
                        }
                        this.setState({
                            [attr.name]: club[attr.name],
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
                    error.message || 'There is an error while getting club.',
                    3
                );
                console.log('err: ', error);
            });
    };

    handleBack = () => {
        this.props.history.push('/admin/clubs');
    };

    handleFileChange = (blob, name) => {
        this.setState({
            [`imgFileSrc${name}`]: blob,
        });
    };

    handleSubmit = async (event) => {
        const { submitTitle, access_code, is_private } = this.state;
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

        if (is_private === 1 && access_code.length !== 5) {
            helper.showToast('Error', 'Invite code is incorrect.', 3);
            return;
        }

        this.setState({ validated: true, submitTitle: 'Updating...' });
        const updateObj = {};
        for (const idx in form_attries) {
            const attr = form_attries[idx];
            const ref = this[`${attr.name}Ref`];
            if (ref && ref.current) {
                if (attr.type === 'image') {
                    if (this.state[`imgFileSrc${attr.name}`]) {
                        this.setState({ submitTitle: 'Uploading...' });
                        const imgURL = await handleUploadToS3(
                            this.state[`imgFileSrc${attr.name}`],
                            Date.now().toString(),
                            attr.ratio
                        );
                        console.log('upload res', imgURL);
                        this.setState({
                            [attr.name]: imgURL,
                        });
                        updateObj[attr.name] = imgURL;
                        this.setState({ submitTitle: 'Updating...' });
                    } else if (checkURL(this.state[attr.name])) {
                        updateObj[attr.name] = this.state[attr.name];
                    } else {
                        this.setState({
                            validated: true,
                            submitTitle: 'Submit',
                        });
                        helper.showToast(
                            'Warning',
                            'Please upload an image.',
                            2
                        );
                        return;
                    }
                } else if (attr.type === 'check') {
                    updateObj['is_private'] =
                        this.state.is_private === 0 ? false : true;
                    this.setState({
                        is_private: this.state.is_private,
                    });
                } else if (attr.type === 'visible') {
                    updateObj['is_visible'] =
                        this.state.is_visible === 0 ? false : true;
                    this.setState({
                        is_visible: this.state.is_visible,
                    });
                } else if (
                    attr.type === 'minimum_number' ||
                    attr.type === 'maximum_number'
                ) {
                    updateObj[attr.name] = Number(ref.current.value);
                    this.setState({
                        [attr.name]: Number(ref.current.value),
                    });
                } else if (attr.type === 'code') {
                    if (
                        ref.current.value !== '' &&
                        ref.current.value.length === 5
                    ) {
                        updateObj[attr.name] = ref.current.value;
                        this.setState({
                            [attr.name]: ref.current.value,
                        });
                    } else {
                        return;
                    }
                } else {
                    if (ref.current.value === '') {
                        this.setState({
                            validated: true,
                            submitTitle: 'Submit',
                        });
                        return;
                    }
                    updateObj[attr.name] = ref.current.value;
                    this.setState({
                        [attr.name]: ref.current.value,
                    });
                }
            }
        }
        console.log('updateObj: ', updateObj);
        this.updateClub(updateObj);
    };

    updateClub = (updateObj) => {
        if (this.clubIdRef.current) {
            adminApi
                .updateClub(this.clubIdRef.current, updateObj)
                .then((response) => {
                    this.setState({ submitTitle: 'Success' });
                    setTimeout(() => {
                        this.setState({ submitTitle: 'Submit' });
                    }, 2000);
                    if (response.status === true && response.data) {
                        helper.showToast(
                            'Success',
                            'Club updated successfully.',
                            1
                        );
                        this.handleBack();
                    } else {
                        helper.showToast(
                            'Error',
                            'Failed to update the club',
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
                        error.message || 'Failed to update the club',
                        3
                    );
                });
        }
    };

    changeClubTier = (event) => {
        console.log('event: ', event.target.value);
        this.setState({
            memebership: event.target.value,
        });
    };

    handleSwitchChange = (val) => {
        console.log('val: ', val);
        this.setState({
            is_private: val,
        });
    };

    handleVisibility = (val) => {
        console.log('val: ', val);
        this.setState({
            is_visible: val,
        });
    };

    generateAccessCode = () => {
        let firstPart = (Math.random() * 46656) | 0;
        let secondPart = (Math.random() * 46656) | 0;
        firstPart = ('000' + firstPart.toString(36)).slice(-2);
        secondPart = ('000' + secondPart.toString(36)).slice(-3);
        let access_code = firstPart + secondPart;

        const { club_list } = this.state;

        let clubs = club_list.filter(
            (club) => club.access_code === access_code
        );
        let isCodeValid;
        if (clubs && clubs.length > 0) {
            isCodeValid = false;
        } else {
            isCodeValid = true;
        }

        this.setState({
            access_code: access_code,
            isCodeValid,
        });
    };

    changeMinimumNumber = (e) => {
        this.setState({
            minimum_number: Number(e.target.value),
        });
    };

    changeMaximumNumber = (e) => {
        this.setState({
            maximum_number: Number(e.target.value),
        });
    };

    renderRow = (form_attr) => {
        const { club_tiers, memebership } = this.state;
        const club_id = window.location.href.split('/admin/clubs/edit/')[1];
        return (
            <Form.Group
                key={form_attr.name}
                as={Col}
                controlId={`${form_attr.name}`}
                className="justify-content-md-center input-row"
                style={{ maxWidth: '40vw' }}
            >
                <Form.Label as={Col}>
                    {form_attr.type === 'minimum_number' ||
                    form_attr.type === 'maximum_number'
                        ? ''
                        : form_attr.type === 'code'
                        ? this.state.is_private
                            ? form_attr.label
                            : ''
                        : form_attr.label}
                </Form.Label>

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
                    ) : form_attr.type === 'image' ? (
                        <Row>
                            <InputGroup as={Col}>
                                <ImageForm
                                    ref={this[`${form_attr.name}Ref`]}
                                    previewSrc={this.state[form_attr.name]}
                                    name={form_attr.name}
                                    initWidth={80}
                                    aspect={form_attr.aspect}
                                    changeFileSrc={this.handleFileChange}
                                />
                            </InputGroup>
                            {form_attr.name === 'assemble_photo_url' && (
                                <GalleryBtn club_id={club_id} />
                            )}
                        </Row>
                    ) : form_attr.type === 'check' ? (
                        <ToggleButtonGroup
                            type="radio"
                            name="check"
                            defaultValue={this.state[form_attr.name]}
                            value={this.state[form_attr.name]}
                            onChange={this.handleSwitchChange}
                            ref={this[`${form_attr.name}Ref`]}
                        >
                            <ToggleButton value={0} variant="outline-primary">
                                PUBLIC
                            </ToggleButton>
                            <ToggleButton value={1} variant="outline-info">
                                PRIVATE
                            </ToggleButton>
                        </ToggleButtonGroup>
                    ) : form_attr.type === 'visible' ? (
                        <ToggleButtonGroup
                            type="radio"
                            name="visible"
                            defaultValue={this.state[form_attr.name]}
                            value={this.state[form_attr.name]}
                            onChange={this.handleVisibility}
                            ref={this[`${form_attr.name}Ref`]}
                        >
                            <ToggleButton value={0} variant="outline-primary">
                                VISIBLE
                            </ToggleButton>
                            <ToggleButton value={1} variant="outline-info">
                                HIDDEN
                            </ToggleButton>
                        </ToggleButtonGroup>
                    ) : form_attr.type === 'select' ? (
                        <Form.Control
                            as="select"
                            onChange={this.changeClubTier}
                            ref={this[`${form_attr.name}Ref`]}
                            value={memebership}
                        >
                            {club_tiers.map((club_tier) => {
                                return (
                                    <option key={club_tier.clubtier_id}>
                                        {club_tier.clubtier_name}
                                    </option>
                                );
                            })}
                        </Form.Control>
                    ) : form_attr.type === 'price' ? (
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text id="basic-addon1">
                                    $
                                </InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                                ref={this[`${form_attr.name}Ref`]}
                                required
                                type="number"
                                pattern="^\d+$"
                                defaultValue={this.state[form_attr.name]}
                                name={form_attr.name}
                            />
                        </InputGroup>
                    ) : form_attr.type === 'code' ? (
                        this.state.is_private === 1 && (
                            <>
                                <Form.Control
                                    ref={this[`${form_attr.name}Ref`]}
                                    required
                                    type="text"
                                    maxLength={5}
                                    value={this.state[form_attr.name]}
                                    name={form_attr.name}
                                    onChange={this.handleInputChange}
                                    isInvalid={
                                        this.state.isCodeValid !== undefined &&
                                        !this.state.isCodeValid
                                    }
                                />
                                <Button
                                    className="ml-2"
                                    onClick={this.generateAccessCode}
                                >
                                    Change Code
                                </Button>
                            </>
                        )
                    ) : form_attr.type === 'minimum_number' ? (
                        <Form.Row>
                            <Form.Label column lg={7}>
                                {form_attr.label}
                            </Form.Label>
                            <Col lg={5}>
                                <Form.Control
                                    ref={this[`${form_attr.name}Ref`]}
                                    required
                                    type="number"
                                    min={0}
                                    defaultValue={0}
                                    value={this.state[form_attr.name]}
                                    name={form_attr.name}
                                    onChange={this.changeMinimumNumber}
                                />
                            </Col>
                        </Form.Row>
                    ) : form_attr.type === 'maximum_number' ? (
                        <Form.Row>
                            <Form.Label column lg={7}>
                                {form_attr.label}
                            </Form.Label>
                            <Col lg={5}>
                                <Form.Control
                                    ref={this[`${form_attr.name}Ref`]}
                                    required
                                    type="number"
                                    min={0}
                                    defaultValue={1000}
                                    value={this.state[form_attr.name]}
                                    name={form_attr.name}
                                    onChange={this.changeMaximumNumber}
                                />
                            </Col>
                        </Form.Row>
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
                <div className="club-list">
                    <Row className="justify-content-start">
                        <h4>CLUBS</h4>
                    </Row>
                    <div className="club-list-container">
                        <Row className="justify-content-start">
                            <h5>EDIT CLUB</h5>
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

export default EditClub;
