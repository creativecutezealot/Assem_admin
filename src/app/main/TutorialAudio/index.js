import React, { createRef } from 'react';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import ReactAudioPlayer from 'react-audio-player';

import './styles.scss';

import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';
import { handleUploadAudioToS3 } from '../../../services/upload.service';

import Content from '../../../components/content';

const form_attries = [
    {
        name: 'audio_url',
        label: 'AUDIO FILE',
        type: 'audio',
    },
];

// const audioKeys = [
//     "audio_url",
//     "audio_file_name",
//     "audio_duration",
// ];

class TutorialAudio extends React.Component {
    constructor(props) {
        super();
        this.state = {
            audio_url: '',
            audio_file_name: '',
            audio_duration: 0,
            audioFile: null,
            audioFileSrc: null,
            loading: false,
        };
        this.createRefs();
    }

    componentDidMount() {
        this.createRefs();
        this.getTutorAudio();
    }

    createRefs = () => {
        form_attries.map((attr) => {
            this[`${attr.name}Ref`] = createRef();
            return 0;
        });
    };

    getTutorAudio = () => {
        this.setState({ loading: true });
        adminApi
            .getTutorAudio()
            .then((response) => {
                this.setState({ loading: false });
                if (response.status === true && response.data) {
                    console.log(JSON.stringify(response.data));
                    var result = response.data;
                    this.setState({
                        audio_url: result.audio_url,
                        audio_file_name: result.audio_file_name,
                        audio_duration: result.audio_duration,
                    });
                }
            })
            .catch((error) => {
                this.setState({ loading: false });
                console.log('err: ', error);
            });
    };

    handleAudioChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            let audio = event.target.files[0];
            console.log(audio);
            this.setState({
                audioFile: URL.createObjectURL(audio),
                audioFileSrc: audio,
                audio_file_name: audio.name ?? new Date().getTime().toString(),
            });
        }
    };

    handleSubmit = async (event) => {
        if (this.state.audioFileSrc != null) {
            this.setState({ loading: true });
            const audioURL = await handleUploadAudioToS3(
                this.state.audioFileSrc,
                Date.now().toString()
            );
            console.log('upload res', audioURL);
            await this.setState({
                audio_url: audioURL,
            });
            adminApi
                .createTutorAudio(this.state)
                .then((response) => {
                    this.setState({ loading: false });
                    if (response.status === true) {
                        console.log(JSON.stringify(response.data));
                        var result = response.data;
                        this.setState({
                            audio_url: result.audio_url,
                            audio_file_name: result.audio_file_name,
                            audio_duration: result.audio_duration,
                        });
                    }
                })
                .catch((error) => {
                    this.setState({ loading: false });
                    console.log('err: ', error);
                });
        } else {
            helper.showToast('Warning', 'Please choose an audio file', 2);
        }
    };

    render() {
        return (
            <Content>
                <div className="assemble-list">
                    <Row className="justify-content-start">
                        <h4>HELP AUDIO</h4>
                    </Row>
                    <div className="assemble-list-container">
                        <Row className="justify-content-start">
                            <h5>UPLOAD NEW AUDIO</h5>
                        </Row>
                        <Col style={{ marginTop: 30 }}>
                            <>
                                <InputGroup className="align-items-center">
                                    <Button
                                        type="button"
                                        className="btn"
                                        onClick={() => {
                                            const fileRef =
                                                this['audio_urlRef'];
                                            if (fileRef.current) {
                                                fileRef.current.click();
                                            }
                                        }}
                                    >
                                        {this.state.audioFileSrc ||
                                        this.state.audio_url !== ''
                                            ? this.state.audio_file_name
                                            : 'UPLOAD'}
                                    </Button>
                                    <Form.File
                                        ref={this['audio_urlRef']}
                                        required
                                        name={'audio_url'}
                                        id={'audio_url'}
                                        accept="audio/*"
                                        label=""
                                        className="hidden"
                                        onChange={this.handleAudioChange}
                                    />
                                </InputGroup>
                                <InputGroup className="mt-4">
                                    {this.state.audioFile ||
                                    this.state.audio_url !== '' ? (
                                        <ReactAudioPlayer
                                            src={
                                                this.state.audioFile
                                                    ? this.state.audioFile
                                                    : this.state.audio_url
                                            }
                                            ref={this.podcastPlayRef}
                                            autoPlay={false}
                                            controls
                                            onCanPlayThrough={(e) => {
                                                this.setState({
                                                    audio_duration:
                                                        (e.target.duration ||
                                                            0) * 1000,
                                                });
                                            }}
                                            onLoadedMetadata={(e) => {
                                                this.setState({
                                                    audio_duration:
                                                        (e.target.duration ||
                                                            0) * 1000,
                                                });
                                            }}
                                        />
                                    ) : null}
                                </InputGroup>
                            </>
                            <Row className="justify-content-start">
                                <Button
                                    disabled={this.state.loading}
                                    variant={'primary'}
                                    type={'button'}
                                    className="btn mt-5"
                                    onClick={this.handleSubmit}
                                >
                                    {this.state.loading ? 'Loading...' : 'Save'}
                                </Button>
                            </Row>
                        </Col>
                    </div>
                </div>
            </Content>
        );
    }
}

export default TutorialAudio;
