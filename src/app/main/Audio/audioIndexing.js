import React, { useEffect, useState } from 'react';
import { Form, Button, Row, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faVolumeUp,
    faSave,
    faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import TimeField from 'react-simple-timefield';
import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';

const TimeFiledStyle = {
    fontSize: 16,
    width: 96,
    height: 36,
    textAlign: 'center',
    marginRight: 16,
    backgroundColor: 'transparent',
    color: 'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: '.25rem',
    borderStyle: 'solid',
};

const converTimeToSecond = (time) => {
    const splitTimeStr = time.split(':');
    const hour = splitTimeStr[0];
    const minintes = splitTimeStr[1];
    const seconds = splitTimeStr[2];
    const timeMilisec =
        Number(hour) * 3600 + Number(minintes) * 60 + Number(seconds);
    return timeMilisec;
};

function AudioIndexing(props) {
    const { item, audio_id, maxTime, onSave, onDelete, onTest } = props;
    const [time, setTime] = useState('00:00:00');
    const [description, setDescription] = useState('');
    const [fetching, setFetching] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (item) {
            setTime(item.start_time);
            setDescription(item?.description);
        }
    }, [item]);

    const saveValidation = () => {
        if (converTimeToSecond(time) >= maxTime / 1000) {
            helper.showToast(
                'Warning',
                'The time must be less than Audio duration',
                2
            );
            return false;
        } else if (converTimeToSecond(time) <= 0) {
            helper.showToast('Warning', 'The time must be greater than 0', 2);
            return false;
        } else if (!description || description === '') {
            helper.showToast('Warning', 'Please check all input fields', 2);
            return false;
        }
        return true;
    };

    const onSaveItem = async () => {
        if (!saveValidation()) {
            return;
        }

        /// creating audio
        if (!audio_id) {
            onSave(item.id, {
                start_time: time,
                description,
            });
            setEditing(false);
            return;
        }

        /// editing audio
        setFetching(true);
        if (item.audio_id && item.indexing_id) {
            try {
                const updateRes = await adminApi.updateAudioIndexing(
                    {
                        audio_id,
                        start_time: time,
                        description: description,
                    },
                    item.audio_id,
                    item.indexing_id
                );
                setFetching(false);
                setEditing(false);
                if (updateRes.status && updateRes.data) {
                    const audio_id = updateRes.data.pri_key.replace(
                        'INDEXINGAUDIO#',
                        ''
                    );
                    const indexing_id = updateRes.data.sort_key.replace(
                        '#METADATA#INDEXINGAUDIO#',
                        ''
                    );
                    onSave(item.id, {
                        audio_id,
                        indexing_id,
                        start_time: updateRes.data.start_time,
                        description: updateRes.data.description,
                    });
                }
            } catch (error) {
                setFetching(false);
                setEditing(false);
            }
        } else {
            try {
                const saveRes = await adminApi.createAudioIndexing({
                    audio_id,
                    start_time: time,
                    description: description,
                });
                setFetching(false);
                setEditing(false);
                if (saveRes.status && saveRes.data) {
                    const audio_id = saveRes.data.pri_key.replace(
                        'INDEXINGAUDIO#',
                        ''
                    );
                    const indexing_id = saveRes.data.sort_key.replace(
                        '#METADATA#INDEXINGAUDIO#',
                        ''
                    );
                    onSave(item.id, {
                        audio_id,
                        indexing_id,
                        start_time: saveRes.data.start_time,
                        description: saveRes.data.description,
                    });
                }
            } catch (error) {
                setFetching(false);
                setEditing(false);
            }
        }
    };

    const onDeleteItem = async () => {
        if (item.audio_id && item.indexing_id) {
            setDeleting(true);
            try {
                await adminApi.deleteAudioIndexing(
                    item.audio_id,
                    item.indexing_id
                );
                setDeleting(false);
            } catch (error) {
                setDeleting(false);
            }
        }
        onDelete(item.id);
    };

    const onTestItem = () => {
        const seekToTime = converTimeToSecond(time);
        onTest(seekToTime);
    };

    return (
        <Row className="align-items-center" style={{ paddingLeft: 10 }}>
            <InputGroup className="align-items-center">
                <TimeField
                    style={TimeFiledStyle}
                    value={time}
                    onChange={(event, value) => {
                        setEditing(true);
                        setTime(value);
                    }}
                    showSeconds
                />
                <Form.Control
                    style={{ marginRight: 16, maxWidth: '35vw' }}
                    type="text"
                    name={'description'}
                    value={description}
                    onChange={(event) => {
                        const desValue = event.target.value;
                        if (desValue !== '') {
                            setEditing(true);
                        } else {
                            setEditing(false);
                        }
                        setDescription(desValue);
                    }}
                />
                {editing && (
                    <Button
                        disabled={fetching}
                        onClick={() => {
                            onSaveItem();
                        }}
                    >
                        <FontAwesomeIcon icon={faSave} />{' '}
                        {fetching ? 'Saving...' : 'Save'}
                    </Button>
                )}
                <Button
                    disabled={deleting}
                    onClick={() => {
                        onDeleteItem();
                    }}
                >
                    <FontAwesomeIcon icon={faTrashAlt} />{' '}
                    {deleting ? 'Deleting...' : 'Delete'}
                </Button>
                <Button onClick={onTestItem}>
                    <FontAwesomeIcon icon={faVolumeUp} /> Test
                </Button>
            </InputGroup>
        </Row>
    );
}

const sortByIndexing = (a, b) => {
    return converTimeToSecond(a.start_time) - converTimeToSecond(b.start_time);
};

function AudioIndexingList(props) {
    const { audio_id, maxTime, onSeekToAudio, onChangeAudioIndexings } = props;
    const [list, setList] = React.useState([]);

    const getAudioIndexings = async () => {
        const result = await adminApi.getAudioIndexings(audio_id);
        if (result.status && result.data) {
            const cloneList = [];
            for (const index in result.data) {
                const item = result.data[index];
                const sort_key = item.sort_key;
                const pri_key = item.pri_key;
                const audio_id = pri_key.replace('INDEXINGAUDIO#', '');
                const indexing_id = sort_key.replace(
                    '#METADATA#INDEXINGAUDIO#',
                    ''
                );
                cloneList.push({
                    audio_id,
                    indexing_id,
                    id: indexing_id,
                    start_time: item.start_time,
                    description: item.description,
                });
            }
            setList(cloneList.sort(sortByIndexing));
        }
    };

    useEffect(() => {
        if (audio_id) {
            getAudioIndexings(audio_id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onAddIndexing = () => {
        const cloneList = [...list];
        const item = {
            id: new Date().getTime(),
            start_time: '00:00:00',
        };
        cloneList.push(item);
        setList(cloneList);
    };

    const onDeleteIndexing = (id) => {
        const cloneList = [...list];
        const deletedList = cloneList.filter((a) => a.id !== id);
        setList(deletedList.sort(sortByIndexing));
        if (!audio_id) {
            onChangeAudioIndexings(deletedList);
        }
    };

    const onSaveIndexing = (id, item) => {
        const cloneList = [...list];
        const findIndex = cloneList.findIndex((a) => a.id === id);
        if (findIndex !== -1) {
            cloneList[findIndex] = { ...item, id };
        } else {
            cloneList.push({ ...item, id });
        }
        setList(cloneList.sort(sortByIndexing));
        if (!audio_id) {
            onChangeAudioIndexings(cloneList);
        }
    };

    return (
        <div>
            <Button onClick={onAddIndexing}>
                <FontAwesomeIcon icon={faPlus} /> Add Index
            </Button>
            {list.map((item, index) => {
                return (
                    <AudioIndexing
                        key={index}
                        audio_id={audio_id}
                        maxTime={maxTime}
                        item={item}
                        onDelete={onDeleteIndexing}
                        onSave={onSaveIndexing}
                        onTest={onSeekToAudio}
                    />
                );
            })}
        </div>
    );
}

export default AudioIndexingList;
