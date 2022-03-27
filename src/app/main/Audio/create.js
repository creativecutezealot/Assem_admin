import React, { createRef } from 'react';
import {
    Form,
    Button,
    Row,
    Col,
    InputGroup,
    Image,
    Modal,
    Table,
    FormControl,
    Dropdown,
    DropdownButton,
} from 'react-bootstrap';
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
    //     name: 'is_sent_message',
    //     label: 'Message to All Members',
    //     type: 'check',
    // },
];

const audioKeys = [
    'audio_name',
    'description',
    'photo_url',
    'audio_url',
    'audio_file_name',
    'audio_duration',
    'enter_club_id',
    'enter_club_name',
    // 'is_sent_message',
];

// const episode_model = {
//     'audio': 'String',
//     'audio_length_sec': 'Number',
//     'rss': 'String',
//     'description_highlighted': 'String',
//     'description_original': 'String',
//     'title_highlighted': 'String',
//     'title_original': 'String',
//     'transcripts_highlighted': 'Array<Object>',
//     'image': 'String',
//     'thumbnail': 'String',
//     'itunes_id': 'Number',
//     'pub_date_ms': 'Number',
//     'id': 'String',
//     'listennotes_url': 'String',
//     'explicit_content': 'Boolean',
//     'link': 'String',
//     'guid_from_rss': 'String',
//     'podcast': {
//         'listennotes_url': 'String',
//         'id': 'String',
//         'title_highlighted': 'String',
//         'title_original': 'String',
//         'publisher_highlighted': 'String',
//         'publisher_original': 'String',
//         'image': 'String',
//         'thumbnail': 'String',
//         'genre_ids': 'Array<Number>',
//         'listen_score': 'String',
//         'listen_score_global_rank': 'String'
//     }
// }

// const podcast_model = {
//     'rss': 'String',
//     'description_highlighted': 'String',
//     'description_original': 'String',
//     'title_highlighted': 'String',
//     'title_original': 'String',
//     'publisher_highlighted': 'String',
//     'publisher_original': 'String',
//     'image': 'String',
//     'thumbnail': 'String',
//     'itunes_id': 'Number',
//     'latest_pub_date_ms': 'Number',
//     'earliest_pub_date_ms': 'Number',
//     'id': '912f36444ea6475693ab3ab899cc3782',
//     'genre_ids': 'Array<Number>',
//     'listennotes_url': 'String',
//     'total_episodes': 'Number',
//     'email': 'String',
//     'explicit_content': 'Boolean',
//     'website': 'String',
//     'listen_score': 'String',
//     'listen_score_global_rank': 'String'
// };

class CreateAudio extends React.Component {
    constructor(props) {
        super();
        const currentUser = session.get('futureof-user');
        const club = currentUser.user_role === 'manager' ? session.get('futureof-club') : props.location.state.club;
        this.state = {
            audio_name: '',
            description: '',
            photo_url: '',
            audio_url: '',
            audio_file_name: '',
            audio_duration: 0,
            enter_club_id: club.club_id,
            enter_club_name: club.club_name,
            is_sent_message: false,
            validated: false,
            loading: false,
            imgFileSrc: null,
            audioFile: null,
            audioFileSrc: null,
            submitTitle: 'Submit',
            pagenumber: 0,
            audioIndexings: [],
            modalShow: false,
            playAudioModalShow: false,
            searchText: '',
            sortType: 'Date',
            searchType: 'Episode',
            playAudioItem: null,
            createAudioItem: null,
            results: [],
            isGetEpisodes: false,
            offset: 0,
        };
        this.createRefs();
    }

    componentDidMount() {
        this.createRefs();
        this.podcastPlayRef = createRef();
    }

    createRefs = () => {
        form_attries.map((attr) => {
            this[`${attr.name}Ref`] = createRef();
            return 0;
        });
        console.log(this);
        this.podcastRef = createRef();
        this.podcastPlayRef = createRef();
    };

    handleBack = () => {
        // this.props.history.push('/manager/audios');
        this.props.history.goBack();
    };

    handleFileChange = (blob, name) => {
        this.setState({
            imgFileSrc: blob,
        });
    };

    handleAudioChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            let audio = event.target.files[0];
            console.log(audio);
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
        console.log('switch: ', name, value);
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
                    console.log('Here1: ', value);
                    this.setState({ validated: true });
                    helper.showToast('Warning', 'Please fill out all info', 2);
                    return;
                }
            }
        }
        console.log('Here2: ');
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
        updateObj['is_allow_all'] = true;
        updateObj['from_web'] = true;
        updateObj['host_name'] = `${currentUser.first_name} ${currentUser.last_name}`;
        updateObj['host_id'] = currentUser.user_id;
        if (currentUser.user_role === 'manager') {
            updateObj['audio_status'] = 'approved';
        } else if (currentUser.user_role === 'user' || currentUser.user_role === '') {
            updateObj['audio_status'] = 'submitted';
        }
        console.log('update obj ==> ', updateObj);
        this.createAudio(updateObj);
    };

    showCreateFromPodcastModal = async () => {
        this.setState({
            modalShow: true,
        });
    };

    hideModal = () => {
        this.setState({
            modalShow: false,
        });
    };

    onSearchPodcast = (index) => {
        const q = this.state.searchText;
        const sort_by_date = this.state.sortType === 'Date' ? 0 : 1;
        let offset = this.state.offset;
        if (index == 0) offset = 0;
        if (index == -1) offset = offset - 20;
        const type =
            this.state.searchType === 'Episode' ? 'episode' : 'podcast';
        if (q === '') {
            helper.showToast('Error', 'Input the search field.', 3);
            return;
        }
        let that = this;
        console.log('Here: ', offset);
        adminApi
            .searchPodcast(q, sort_by_date, type, offset)
            .then((response) => {
                if (response.status === true && response.data) {
                    that.setState({
                        isGetEpisodes: false,
                        results: response.data.results,
                        offset: offset > 10 && response.data.next_offset == 0 ? offset : response.data.next_offset,
                    });
                    console.log('response: ', response.data);
                    // helper.showToast(
                    //     'Success',
                    //     'Podcast searched successfully.',
                    //     1
                    // );
                } else {
                    helper.showToast(
                        'Error',
                        'Failed to search the podcast',
                        3
                    );
                }
            })
            .catch((error) => {
                console.log('err: ', error);
                helper.showToast('Error', error.message, 3);
            });
    };

    getEpisodes = (id) => {
        if (id === undefined && id === '') {
            helper.showToast('Error', 'Podcast id is empty.', 3);
            return;
        }

        let that = this;

        adminApi
            .getEpisodes(id)
            .then((response) => {
                if (response.status === true && response.data) {
                    that.setState({
                        // searchType: 'Episode',
                        results: response.data.episodes,
                    });
                    console.log('response: ', response.data.episodes);
                    helper.showToast(
                        'Success',
                        'Episodes fetched successfully.',
                        1
                    );
                } else {
                    helper.showToast('Error', 'Failed to fetch the podcast', 3);
                }
            })
            .catch((error) => {
                console.log('err: ', error);
                helper.showToast('Error', error.message, 3);
            });
    };

    searchResults = () => {
        return this.state.results !== null && this.state.results.length > 0 ? (
            <>
                {this.state.results.map((item, index) => {
                    return (
                        <>
                            <tr
                                key={item.id}
                                onClick={(e) => {
                                    console.log('e.target', e.target.tagName);
                                    if (e.target.tagName === 'BUTTON') {
                                        return;
                                    }
                                    if (
                                        (e.target.tagName === 'DIV' ||
                                            e.target.tagName === 'IMG' ||
                                            e.target.tagName === 'P' ||
                                            e.target.tagName === 'TD') &&
                                        this.state.isGetEpisodes === true
                                    ) {
                                        return;
                                    }
                                    this.setState({
                                        isGetEpisodes: true,
                                    });
                                    this.getEpisodes(item.id);
                                }}
                            >
                                <td>
                                    <div>{index + 1 + this.state.offset - 10}</div>
                                </td>
                                <td>
                                    <div
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                        }}
                                    >
                                        <Image
                                            src={
                                                this.state.searchType ===
                                                    'Episode' && item.podcast
                                                    ? item.podcast.thumbnail
                                                    : item.thumbnail
                                            }
                                            thumbnail
                                        />
                                    </div>
                                </td>
                                {this.state.searchType === 'Episode' ? (
                                    <td>
                                        <div
                                            style={{
                                                width: '200px',
                                                height: '100px',
                                            }}
                                        >
                                            {item.title_original}
                                        </div>
                                    </td>
                                ) : this.state.isGetEpisodes ? (
                                    <td>
                                        <div
                                            style={{
                                                width: '200px',
                                                height: '100px',
                                            }}
                                        >
                                            {item.title_original}
                                        </div>
                                    </td>
                                ) : (
                                    <></>
                                )}
                                <td>
                                    <div
                                        style={{
                                            width: '200px',
                                            height: '100px',
                                        }}
                                    >
                                        {this.state.searchType === 'Episode'
                                            ? item.podcast.title_original
                                            : this.state.isGetEpisodes
                                            ? item.title
                                            : item.title_original}
                                        :{' '}
                                    </div>
                                </td>
                                <td
                                    style={{
                                        maxWidth: '500px',
                                        height: '100px',
                                    }}
                                >
                                    <div
                                        style={{
                                            maxWidth: '500px',
                                            height: '100px',
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                this.state.searchType ===
                                                'Episode'
                                                    ? item.description_original.substring(
                                                          0,
                                                          200
                                                      )
                                                    : this.state.isGetEpisodes
                                                    ? item.description
                                                    : item.description_original.substring(
                                                          0,
                                                          200
                                                      ),
                                        }}
                                    ></div>
                                </td>
                                <td>
                                    <div
                                        style={{
                                            width: '200px',
                                            height: '100px',
                                        }}
                                    >
                                        {this.state.searchType === 'Episode'
                                            ? item.audio
                                            : this.state.isGetEpisodes
                                            ? item.audio
                                            : item.listennotes_url}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ width: '100px' }}>
                                        {this.state.searchType === 'Episode' &&
                                        item.podcast ? (
                                            <Button
                                                onClick={() => {
                                                    this.onPlayAudio(item);
                                                }}
                                            >
                                                PLAY
                                            </Button>
                                        ) : this.state.isGetEpisodes ? (
                                            <Button
                                                onClick={() => {
                                                    this.onPlayAudio(item);
                                                }}
                                            >
                                                PLAY
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => {
                                                    this.onPlayAudio(item);
                                                }}
                                                disabled
                                            >
                                                PLAY
                                            </Button>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ width: '150px' }}>
                                        {this.state.searchType === 'Episode' &&
                                        item.podcast ? (
                                            <Button
                                                onClick={() => {
                                                    this.onCreateAudio(item);
                                                }}
                                            >
                                                CREATE AUDIO
                                            </Button>
                                        ) : this.state.isGetEpisodes ? (
                                            <Button
                                                onClick={() => {
                                                    this.onCreateAudio(item);
                                                }}
                                            >
                                                CREATE AUDIO
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => {
                                                    this.onCreateAudio(item);
                                                }}
                                                disabled
                                            >
                                                CREATE AUDIO
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        </>
                    );
                })}
            </>
        ) : (
            <></>
        );
    };

    createAudio = (updateObj) => {
        adminApi
            .createAudio(updateObj)
            .then((response) => {
                this.setState({ submitTitle: 'Success' });
                setTimeout(() => {
                    this.setState({ submitTitle: 'Submit' });
                }, 2000);
                if (response.status === true && response.data) {
                    this.createAudioIndeinxg(response.data.audio_id);
                    if (updateObj.is_sent_message) {
                        this.createHelloAudios(response.data);
                    }
                    console.log('response.data: ', response.data);
                    helper.showToast(
                        'Success',
                        'Audio created successfully.',
                        1
                    );
                    this.handleBack();
                } else {
                    helper.showToast('Error', 'Failed to create the audio', 3);
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
                    error.message || 'Failed to create the audio',
                    3
                );
            });
    };

    createHelloAudios = (audio) => {
        const currentUser = session.get('futureof-user');
        const club = currentUser.user_role === 'manager' ? session.get('futureof-club') : this.props.location.state.club;
        const obj = {
            description: audio.description,
            audio_url: audio.audio_url,
            audio_duration: audio.audio_duration,
            audio_file_name: audio.audio_file_name,
            hello_audio_id: audio.audio_id,
            enter_club_id: club.club_id,
            enter_club_name: club.club_name,
            from_manager: true,
            host_name: 'ClubManager',
        };
        adminApi
            .createVoiceNotes(obj)
            .then((response) => {
                console.log('create hello audios', response);
            })
            .catch((error) => {
                console.log('err: ', error);
            });
    };

    createAudioIndeinxg = async (audio_id) => {
        const { audioIndexings } = this.state;
        if (audioIndexings.length > 0) {
            const promiseList = [];
            for (const indexing of audioIndexings) {
                promiseList.push(
                    adminApi.createAudioIndexing({
                        audio_id,
                        ...indexing,
                    })
                );
            }
            await Promise.all(promiseList);
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

    onChangeAudioIndexings = (indexings) => {
        this.setState({
            audioIndexings: indexings,
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
                {form_attr.type !== 'check' && (
                    <Form.Label as={Col}>{form_attr.label}</Form.Label>
                )}
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
                                        console.log(fileRef);
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
                                    // defaultValue={this.state.audio_url}
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
                            inline
                            type="checkbox"
                            id={form_attr.name}
                            name={form_attr.name}
                            checked={this.state[form_attr.name]}
                            onChange={this.handleSwitchChange}
                            label={form_attr.label}
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

    onCreateAudio = (item) => {
        this.setState({
            modalShow: false,
            createAudioItem: item,
            audio_name:
                this.state.searchType === 'Episode' && item.podcast
                    ? 'PODCAST ' + item.podcast.title_original
                    : 'PODCAST ' + item.title,
            description:
                this.state.searchType === 'Episode'
                    ? item.description_original
                          .replace(/<[^>]+>/g, '')
                          .replace(/&nbsp;/g, ' ')
                    : item.description
                          .replace(/<[^>]+>/g, '')
                          .replace(/&nbsp;/g, ' '),
            photo_url:
                this.state.searchType === 'Episode' && item.podcast
                    ? item.podcast.image
                    : item.image,
            audio_url:
                this.state.searchType === 'Episode' && item.podcast
                    ? item.audio
                    : item.audio,
            audio_file_name:
                this.state.searchType === 'Episode' ? 'Episode' : 'Podcast',
        });
    };

    onPlayAudio = (item) => {
        this.setState({
            playAudioModalShow:
                item.audio !== '' && helper.isURL(item.audio) ? true : false,
            playAudioItem: item,
        });
    };

    playAudioModalHide = async () => {
        this.setState({
            playAudioModalShow: false,
        });
    };

    onKeyPress = (event) => {
        if (event.charCode === 13) {
            this.btn.click();
        }
    }

    createFromPodcastModal = () => {
        return (
            <Modal
                show={this.state.modalShow}
                onHide={() => {
                    this.hideModal();
                }}
                // size='lg'
                aria-labelledby="contained-modal-title-vcenter"
                centered
                dialogClassName="modal-90w podcast-search"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        PODCAST SEARCH
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body search-Modal">
                    {this.playAudioModal()}
                    <Row className="mt-3">
                        <Col xs="12" lg="4">
                            <InputGroup size="sm" className="mb-3">
                                <FormControl
                                    required
                                    type="text"
                                    // defaultValue=""
                                    value={this.state.searchText}
                                    style={{ color: 'white' }}
                                    onChange={(e) => {
                                        this.setState({
                                            searchText: e.target.value,
                                        });
                                    }}
                                />
                            </InputGroup>
                        </Col>
                        <Col xs="12" lg="1">
                            <Button
                                onClick={() => {
                                    this.onSearchPodcast(0);
                                }}
                            >
                                SEARCH
                            </Button>
                        </Col>
                        <Col xs="6" lg="2">
                            <InputGroup size="sm" className="mb-3">
                                <InputGroup.Text
                                    style={{
                                        border: 'none',
                                        borderRadius: '8px',
                                    }}
                                >
                                    Sort By
                                </InputGroup.Text>

                                <DropdownButton
                                    variant="outline-secondary"
                                    title={this.state.sortType}
                                    id="input-group-dropdown-1"
                                    align="end"
                                    className="ml-2"
                                >
                                    <Dropdown.Item
                                        href="#"
                                        onSelect={(eventKey, event) => {
                                            this.setState({
                                                sortType:
                                                    event.target.innerText,
                                            });
                                        }}
                                    >
                                        Date
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        href="#"
                                        onSelect={(eventKey, event) => {
                                            this.setState({
                                                sortType:
                                                    event.target.innerText,
                                            });
                                        }}
                                    >
                                        Relevance
                                    </Dropdown.Item>
                                </DropdownButton>
                            </InputGroup>
                        </Col>
                        <Col xs="6" lg="2">
                            <InputGroup size="sm" className="mb-3">
                                <InputGroup.Text
                                    style={{
                                        border: 'none',
                                        borderRadius: '8px',
                                    }}
                                >
                                    Search For
                                </InputGroup.Text>

                                <DropdownButton
                                    variant="outline-secondary"
                                    title={this.state.searchType}
                                    id="input-group-dropdown-2"
                                    align="end"
                                    className="ml-2"
                                >
                                    <Dropdown.Item
                                        href="#"
                                        onSelect={(eventKey, event) => {
                                            this.setState({
                                                searchType: 'Episode',
                                            });
                                        }}
                                    >
                                        Episode
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        href="#"
                                        onSelect={(eventKey, event) => {
                                            this.setState({
                                                searchType: 'Podcast',
                                                results: null,
                                            });
                                        }}
                                    >
                                        Podcast
                                    </Dropdown.Item>
                                </DropdownButton>
                            </InputGroup>
                        </Col>
                        <Col xs="6" lg="3">
                            <Button
                                size="sm"
                                onClick={() => {
                                    this.onSearchPodcast(-1);
                                }}
                                disabled={this.state.offset > 10 ? false : true}
                            >
                                PREVIOUS
                            </Button>{' '}
                            <Button
                                size="sm"
                                onClick={() => {
                                    this.onSearchPodcast(1);
                                }}
                                disabled={ this.state.results && this.state.results.length > 0 ? false : true }
                                
                            >
                                NEXT
                            </Button>
                        </Col>
                    </Row>
                    <Modal.Title id="contained-modal-title-vcenter">
                        RESULTS
                    </Modal.Title>
                    <Table
                        striped
                        bordered
                        hover
                        variant="dark"
                        className="searchPodcast"
                    >
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>#</th>
                                <th style={{ width: '100px' }}>Image</th>
                                {this.state.searchType === 'Episode' ? (
                                    <th style={{ width: '200px' }}>
                                        Episode Title
                                    </th>
                                ) : this.state.isGetEpisodes ? (
                                    <th style={{ width: '200px' }}>
                                        Episode Title
                                    </th>
                                ) : (
                                    <></>
                                )}
                                <th style={{ width: '200px' }}>
                                    Podcast Title
                                </th>
                                <th style={{ maxWidth: '500px' }}>
                                    Description
                                </th>
                                <th style={{ width: '200px' }}>URL</th>
                                <th style={{ width: '100px' }}></th>
                                <th style={{ width: '150px' }}></th>
                            </tr>
                        </thead>
                        <tbody>{this.searchResults()}</tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => {
                            this.hideModal();
                        }}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    };

    playAudioModal = () => {
        return (
            <Modal
                show={this.state.playAudioModalShow}
                onHide={() => {
                    this.hideModal();
                }}
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Body style={{ height: '150px', overflow: 'hidden' }}>
                    <InputGroup>
                        {this.state.playAudioItem !== null &&
                        this.state.playAudioItem.audio !== '' &&
                        helper.isURL(this.state.playAudioItem.audio) ? (
                            <ReactAudioPlayer
                                src={this.state.playAudioItem.audio}
                                ref={this.podcastPlayRef}
                                autoPlay={false}
                                controls
                                style={{ marginTop: 20 }}
                                onCanPlayThrough={(e) => {
                                    this.setState({
                                        audio_duration:
                                            (e.target.duration || 0) * 1000,
                                    });
                                }}
                                onLoadedMetadata={(e) => {
                                    this.setState({
                                        audio_duration:
                                            (e.target.duration || 0) * 1000,
                                    });
                                }}
                            />
                        ) : null}
                    </InputGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => {
                            this.playAudioModalHide();
                        }}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    };

    render() {
        const { loading } = this.state;
        return (
            <Content>
                <div className="audio-list">
                    <Row className="justify-content-start">
                        <h4>AUDIOS</h4>
                    </Row>
                    <div className="audio-list-container">
                        <Row className="justify-content-start">
                            <Col className="d-flex align-items-center">
                                <h5>CREATE AUDIO</h5>
                            </Col>
                            <Col
                                xs
                                lg="3"
                                className="d-flex align-items-center"
                            >
                                <Button
                                    variant={'primary'}
                                    type={'submit'}
                                    className="btn"
                                    onClick={() => {
                                        this.showCreateFromPodcastModal();
                                    }}
                                >
                                    Create From Podcast
                                </Button>
                                {this.createFromPodcastModal()}
                                {this.playAudioModal()}
                            </Col>
                        </Row>
                        <Col style={{ marginTop: 30 }}>
                            {!loading ? (
                                <div>
                                    {form_attries.map((attr) =>
                                        this.renderRow(attr)
                                    )}
                                    {this.state.audio_duration > 0 && (
                                        <AudioIndexingList
                                            maxTime={this.state.audio_duration}
                                            onSeekToAudio={this.onSeekToAudio}
                                            onChangeAudioIndexings={
                                                this.onChangeAudioIndexings
                                            }
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

export default CreateAudio;
