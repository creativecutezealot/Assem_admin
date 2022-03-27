import React from 'react';
import { Row, Col, Image, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPodcast, faUsers } from '@fortawesome/free-solid-svg-icons';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import './styles.scss';
import { checkURL } from '../../../database/Model';

const SortableItem = SortableElement(
    ({ club_data, item, order, handlePinnedReorder }) => (
        <li>
            {item.audio_id && item.audio_id !== '' ? (
                <CarouselAudioItem
                    key={item.audio_id}
                    order={order}
                    item={item}
                    club_data={club_data}
                    handlePinnedReorder={handlePinnedReorder}
                />
            ) : (
                <CarouselAssembleItem
                    key={item.assemble_id}
                    order={order}
                    item={item}
                    club_data={club_data}
                    handlePinnedReorder={handlePinnedReorder}
                />
            )}
        </li>
    )
);

const SortableList = SortableContainer(
    ({ club_data, data, handlePinnedReorder }) => {
        return (
            <ul style={{ listStyleType: 'none', paddingInlineStart: 0 }}>
                {data.map((item, index) => (
                    <SortableItem
                        index={index}
                        disabled={true}
                        order={index}
                        key={index}
                        item={item}
                        club_data={club_data}
                        handlePinnedReorder={handlePinnedReorder}
                    />
                ))}
            </ul>
        );
    }
);

function CarouselAudioItem({ club_data, item, order, handlePinnedReorder }) {
    const clubname = `${item.enter_club_name}`.replace(/\s/g, '').trim();
    return (
        <Row
            style={{ width: '100%', marginBottom: 10 }}
            className="align-items-center data-item-container-boder"
        >
            <Form.Check
                type={'checkbox'}
                checked={item.is_pinned}
                onChange={(e) => {
                    handlePinnedReorder(item, e.target.checked);
                }}
            />
            <span style={{ marginLeft: 20 }}>{Number(order + 1)}</span>
            <Image
                src={
                    checkURL(item.photo_url)
                        ? item.photo_url
                        : club_data.voice_photo_url
                }
                style={{
                    maxHeight: '100%',
                    width: (220 * 4) / 3,
                    height: 220,
                    marginLeft: 20,
                    resize: 'inherit',
                }}
            />
            <Col style={{ marginLeft: 20 }}>
                <Row style={{ fontWeight: 'bold' }}>{item.audio_name}</Row>
                <Row style={{ marginTop: 10 }}>#{clubname}</Row>
                <Row style={{ marginTop: 10 }}>{item.description}</Row>
            </Col>
            <FontAwesomeIcon style={{ marginLeft: 20 }} icon={faPodcast} />
        </Row>
    );
}

function CarouselAssembleItem({ club_data, item, order, handlePinnedReorder }) {
    return (
        <Row
            style={{ width: '100%', marginBottom: 10 }}
            className="align-items-center data-item-container-boder"
        >
            <Form.Check
                type={'checkbox'}
                checked={item.is_pinned}
                onChange={(e) => {
                    handlePinnedReorder(item, e.target.checked);
                }}
            />
            <span style={{ marginLeft: 20 }}>{Number(order + 1)}</span>
            <Image
                src={
                    checkURL(item.photo_url)
                        ? item.photo_url
                        : club_data.assemble_photo_url
                }
                style={{
                    maxHeight: '100%',
                    width: (220 * 4) / 3,
                    height: 220,
                    marginLeft: 20,
                    resize: 'inherit',
                }}
            />
            <Col style={{ marginLeft: 20 }}>
                <Row style={{ fontWeight: 'bold' }}>{item.assemble_name}</Row>
                <Row style={{ marginTop: 10 }}>
                    #{`${item.enter_club_name}`.replace(/\s/g, '').trim()}
                </Row>
                <Row style={{ marginTop: 10 }}>{item.description}</Row>
                <Row style={{ marginTop: 10 }}>
                    {`${new Date(item.start_time).getFullYear()}-${
                        new Date(item.start_time).getMonth() + 1
                    }-${new Date(item.start_time).getDate()}`}{' '}
                    /{' '}
                    {`${new Date(item.start_time).getHours()}:${new Date(
                        item.start_time
                    ).getMinutes()}`}
                </Row>
            </Col>
            <FontAwesomeIcon style={{ marginLeft: 20 }} icon={faUsers} />
        </Row>
    );
}

function SortCarousel({ data, club_data, loading, handlePinnedReorder }) {
    if (loading) {
        return <p className="text-center">Loading...</p>;
    }

    if (data && Array.isArray(data) && data.length > 0) {
        return (
            <SortableList
                distance={1}
                lockAxis="y"
                data={data}
                club_data={club_data}
                handlePinnedReorder={handlePinnedReorder}
                onSortEnd={({ oldIndex, newIndex }) => {}}
            />
        );
    }

    return <p className="text-center">NO DATA</p>;
}

export default SortCarousel;
