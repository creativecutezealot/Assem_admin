import React, { createRef } from 'react';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import ReactAudioPlayer from 'react-audio-player';

import './styles.scss';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';
import {
    handleUploadToS3,
    handleUploadAudioToS3,
} from '../../../services/upload.service';
import environment from '../../../enviroments';

import { ImageForm } from '../components/ImageForm';
import Content from '../../../components/content';
import AudioIndexingList from './audioIndexing';

const form_attries = [
    {
        name: 'audio_name',
        label: 'TOPIC',
    },
    {
        name: 'description',
        label: 'DESCRIPTION',
        type: 'textarea',
    },
    {
        name: 'photo_url',
        label: 'PHOTO (OR THE CLUB DEFAULT IMAGE WILL BE USED)',
        type: 'image',
        aspect: 4 / 3,
    },
    {
        name: 'audio_url',
        label: 'UPLOAD FILE \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0    COPY URL',
        type: 'audio',
    },
    // {
    //     name: 'is_allow_all',
    //     label: 'Allow access all',
    //     type: 'check',
    // },
];

const audioKeys = [
    'audio_name',
    'description',
    'photo_url',
    'audio_url',
    'audio_duration',
    'audio_file_name',
    'enter_club_id',
    'enter_club_name',
    'is_allow_all',
];

class EditAudio extends React.Component {
    constructor(props) {
        super();
        const currentUser = session.get('futureof-user');
        const club = currentUser.user_role === 'manager' ? session.get('futureof-club') : props.location.state.club;
        this.state = {
            audio_name: '',
            description: '',
            photo_url: '',
            audio_url: '',
            audio_status: '',
            audio_file_name: '',
            audio_duration: 0,
            is_allow_all: true,
            enter_club_id: club.club_id,
            enter_club_name: club.club_name,
            validated: false,
            loading: false,
            imgFileSrc: null,
            audioFile: null,
            audioFileSrc: null,
            submitTitle: 'Submit',
            pagenumber: 0,
        };
        this.audioIdRef = createRef();
        this.audioIdRef.current = null;
        this.createRefs();
    }

    componentDidMount() {
        console.log('edit audio');
        this.createRefs();
        this.getAudioDetails();
    }

    createRefs = () => {
        form_attries.map((attr) => {
            this[`${attr.name}Ref`] = createRef();
            return 0;
        });
        this.podcastRef = createRef();
        this.podcastPlayRef = createRef();
    };

    getAudioDetails = () => {
        this.setState({ loading: true });
        const currentUser = session.get('futureof-user');
        const audio_id = currentUser.user_role === 'manager' ? window.location.href.split('/manager/audios/edit/')[1] : window.location.href.split('/user/audios/edit/')[1];
        this.audioIdRef.current = audio_id;
        console.log('audio_id edit ==>', this.audioIdRef.current);
        adminApi
            .getAudio(audio_id)
            .then((response) => {
                this.setState({ loading: false });
                console.log('audio_id edit res ==>', response);
                if (response.status === true) {
                    const audio = response.data;
                    console.log(audio);
                    audioKeys.map((attr) => {
                        this.setState({
                            [attr]: audio[attr],
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
                    error.message || 'There is an error while getting audio.',
                    3
                );
                console.log('err: ', error);
            });
    };

    handleBack = () => {
        const currentUser = session.get('futureof-user');
        if (currentUser.user_role === 'manager') {
            this.props.history.push('/manager/audios');
        } else if (currentUser.user_role === 'user' || currentUser.user_role === '') {
            this.props.history.push('/user/audios');
        }
    };

    handleFileChange = (blob, name) => {
        this.setState({
            imgFileSrc: blob,
        });
    };

    handleAudioChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            let audio = event.target.files[0];
            this.setState({
                audio_url: '',
                audioFile: URL.createObjectURL(audio),
                audioFileSrc: audio,
                audio_file_name: audio.name ?? new Date().getTime().toString(),
            });
        }
    };

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value,
        });
        if (name === 'audio_url' && value !== '') {
            this.setState({
                audio_file_name: 'PodCast',
                audioFile: null,
                audioFileSrc: null,
            });
        }
    };

    handleSwitchChange = (event) => {
        const target = event.target;
        const value = target.checked;
        const name = target.name;
        this.setState({
            [name]: value,
        });
    };

    handleSubmit = async (event) => {
        const currentUser = session.get('futureof-user');
        for (const idx in form_attries) {
            const attr = form_attries[idx];
            if (
                attr.name !== '' &&
                attr.type !== 'check' &&
                attr.type !== 'image'
            ) {
                const value = this.state[attr.name];
                if (value !== undefined && value !== '') {
                    this.setState({ validated: true });
                } else {
                    if (attr.name === 'audio_url') {
                        if (this.state.audioFile) {
                            continue;
                        }
                    }
                    console.log('validation', attr.name);
                    this.setState({ validated: true });
                    helper.showToast('Warning', 'Please fill out all info', 2);
                    return;
                }
            }
        }
        this.setState({ submitTitle: 'Uploading...' });
        if (this.state.imgFileSrc != null) {
            const photo_url = await handleUploadToS3(
                this.state.imgFileSrc,
                Date.now().toString(),
                environment.ratio4_3
            );
            console.log('upload res', photo_url);
            await this.setState({
                photo_url,
            });
        }
        if (this.state.audioFileSrc != null) {
            const audioURL = await handleUploadAudioToS3(
                this.state.audioFileSrc,
                Date.now().toString()
            );
            console.log('upload res', audioURL);
            await this.setState({
                audio_url: audioURL,
            });
        }
        this.setState({ submitTitle: 'Updating...' });
        const updateObj = {};
        for (const idx in audioKeys) {
            const key = audioKeys[idx];
            const value = this.state[key];
            if (value !== undefined && value !== '') {
                updateObj[key] = value;
            } else {
                console.log(key);
                // Either both of one
                if (key === 'photo_url') {
                    continue;
                }
                this.setState({ validated: true });
                helper.showToast('Warning', 'Please fill out all info', 2);
                return;
            }
        }
        console.log('update obj ==> ', updateObj);
        updateObj['is_allow_all'] = true;
        updateObj['from_web'] = true;
        if (currentUser.user_role === 'user' || currentUser.user_role === '') {
            updateObj['audio_status'] = 'submitted';
        }
        this.updateAudio(updateObj);
    };

    updateAudio = (updateObj) => {
        if (this.audioIdRef.current) {
            adminApi
                .updateAudio(this.audioIdRef.current, updateObj)
                .then((response) => {
                    this.setState({ submitTitle: 'Success' });
                    setTimeout(() => {
                        this.setState({ submitTitle: 'Submit' });
                    }, 2000);
                    if (response.status === true && response.data) {
                        helper.showToast(
                            'Success',
                            'Audio updated successfully.',
                            1
                        );
                        this.handleBack();
                    } else {
                        helper.showToast(
                            'Error',
                            'Failed to update the audio',
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
                        error.message || 'Failed to update the audio',
                        3
                    );
                });
        }
    };

    onSeekToAudio = (seekTime) => {
        if (
            this.podcastPlayRef &&
            this.podcastPlayRef.current &&
            this.podcastPlayRef.current.audioEl
        ) {
            this.podcastPlayRef.current.audioEl.current.currentTime = seekTime;
            this.podcastPlayRef.current.audioEl.current.play();
        }
    };

    onKeyPress = (event) => {
        if (event.charCode === 13) {
            this.btn.click();
        }
    }

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
                    {form_attr.type === 'image' ? (
                        <ImageForm
                            ref={this[`${form_attr.name}Ref`]}
                            previewSrc={this.state[form_attr.name]}
                            name={form_attr.name}
                            initWidth={80}
                            aspect={form_attr.aspect}
                            changeFileSrc={this.handleFileChange}
                        />
                    ) : form_attr.type === 'audio' ? (
                        <>
                            <InputGroup className="align-items-center">
                                <Button
                                    type="button"
                                    className="btn"
                                    onClick={() => {
                                        const fileRef =
                                            this[`${form_attr.name}Ref`];
                                        if (fileRef.current) {
                                            fileRef.current.click();
                                        }
                                    }}
                                >
                                    {this.state.audioFileSrc ||
                                    (this.state.audio_url !== '' &&
                                        helper.isURL(this.state.audio_url))
                                        ? this.state.audio_file_name
                                        : 'UPLOAD'}
                                </Button>
                                <Form.File
                                    ref={this[`${form_attr.name}Ref`]}
                                    required
                                    name={form_attr.name}
                                    id={form_attr.name}
                                    accept="audio/*"
                                    label=""
                                    className="hidden"
                                    onChange={this.handleAudioChange}
                                />
                                <span style={{ marginLeft: 10 }}>OR</span>
                                <Form.Control
                                    style={{ marginLeft: 10 }}
                                    ref={this.podcastRef}
                                    type="text"
                                    value={this.state.audio_url}
                                    defaultValue={this.state.audio_url}
                                    name={'audio_url'}
                                    onChange={this.handleInputChange}
                                    onKeyPress={this.onKeyPress}
                                />
                                <Button
                                    style={{ marginLeft: 10 }}
                                    type="button"
                                    className="btn"
                                    onClick={() => {
                                        if (
                                            this.podcastPlayRef &&
                                            this.podcastPlayRef.current &&
                                            this.podcastPlayRef.current.audioEl
                                        ) {
                                            this.podcastPlayRef.current.audioEl.current.play();
                                        }
                                    }}
                                >
                                    TEST
                                </Button>
                            </InputGroup>
                            <InputGroup>
                                {this.state.audioFile ||
                                (this.state.audio_url !== '' &&
                                    helper.isURL(this.state.audio_url)) ? (
                                    <ReactAudioPlayer
                                        src={
                                            this.state.audioFile
                                                ? this.state.audioFile
                                                : this.state.audio_url
                                        }
                                        ref={this.podcastPlayRef}
                                        autoPlay={false}
                                        controls
                                        style={{ marginTop: 20 }}
                                        onCanPlayThrough={(e) => {
                                            this.setState({
                                                audio_duration:
                                                    (e.target.duration || 0) *
                                                    1000,
                                            });
                                        }}
                                        onLoadedMetadata={(e) => {
                                            this.setState({
                                                audio_duration:
                                                    (e.target.duration || 0) *
                                                    1000,
                                            });
                                        }}
                                    />
                                ) : null}
                            </InputGroup>
                        </>
                    ) : form_attr.type === 'textarea' ? (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            as="textarea"
                            rows={5}
                            maxLength={1000}
                            required
                            defaultValue={this.state[form_attr.name]}
                            name={form_attr.name}
                            onChange={this.handleInputChange}
                        />
                    ) : form_attr.type === 'check' ? (
                        <Form.Check
                            ref={this[`${form_attr.name}Ref`]}
                            type="switch"
                            id={form_attr.name}
                            name={form_attr.name}
                            checked={this.state[form_attr.name]}
                            onChange={this.handleSwitchChange}
                            label={'NO/YES'}
                        />
                    ) : (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            required
                            type="text"
                            defaultValue={this.state[form_attr.name]}
                            name={form_attr.name}
                            onChange={this.handleInputChange}
                            onKeyPress={this.onKeyPress}
                        />
                    )}
                </InputGroup>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
        );
    };

    render() {
        const { loading } = this.state;
        const audio_id = window.location.href.split('/manager/audios/edit/')[1];
        return (
            <Content>
                <div className="audio-list">
                    <Row className="justify-content-start">
                        <h4>AUDIOS</h4>
                    </Row>
                    <div className="audio-list-container">
                        <Row className="justify-content-start">
                            <h5>EDIT AUDIO</h5>
                        </Row>
                        <Col style={{ marginTop: 30 }}>
                            {!loading ? (
                                <div>
                                    {form_attries.map((attr) =>
                                        this.renderRow(attr)
                                    )}
                                    {this.state.audio_duration > 0 && (
                                        <AudioIndexingList
                                            audio_id={audio_id}
                                            maxTime={this.state.audio_duration}
                                            onSeekToAudio={this.onSeekToAudio}
                                        />
                                    )}
                                    <Row className="justify-content-start">
                                        <Button
                                            variant={'primary'}
                                            type={'submit'}
                                            className="btn mt-5"
                                            onClick={() => {
                                                this.handleSubmit();
                                            }}
                                            ref={node => (this.btn = node)}
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
                                </div>
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

export default EditAudio;
