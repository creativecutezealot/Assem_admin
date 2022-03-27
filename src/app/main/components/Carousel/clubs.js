import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Image } from 'react-bootstrap';
import './styles.scss';

import { checkURL } from '../../../database/Model';
import { useWindowSize } from './index';

const R = require('ramda');

const placeHolder_img = require('../../../../assets/img/wind-power.jpg');
const placeHolder_avatar = require('../../../../assets/avatar/admin.jpg');

type ItemProps = {
    item: Object,
    user: Object,
    selected_id: String,
    columHeight: Number,
    onSelect: (item: Object, selected: Boolean) => void,
};

function CarouselItem({
    item,
    user,
    selected_id,
    columHeight,
    onSelect,
}: ItemProps) {
    const selected = item.club_id === selected_id;
    return (
        <Col className="align-items-center data-item-container">
            <div
                style={{
                    background: `url(${
                        checkURL(item?.photo_url)
                            ? item?.photo_url
                            : placeHolder_img
                    }) no-repeat`,
                    backgroundSize: 'cover',
                    width: `${columHeight}px`,
                    height: `${columHeight}px`,
                    alignItems: 'center',
                    margin: 3,
                }}
            >
                <Col className="align-items-center">
                    <Row className="justify-content-center data-item">
                        <Image
                            src={
                                checkURL(user?.photo_url)
                                    ? user?.photo_url
                                    : placeHolder_avatar
                            }
                            style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: 'white',
                                marginTop: '25%',
                                resize: 'both',
                            }}
                        />
                    </Row>
                    <Row className="justify-content-center data-item">
                        <h6 className="text-center">
                            {item?.club_name ?? '' + user?.user_id ?? ''}
                        </h6>
                    </Row>
                    <Row className="d-flex justify-content-center  data-item">
                        <Button
                            variant={selected ? 'secondary' : 'primary'}
                            type="button"
                            onClick={() => {
                                onSelect(item, selected);
                            }}
                        >
                            {selected ? 'Selected' : 'Select'}
                        </Button>
                    </Row>
                </Col>
            </div>
        </Col>
    );
}

function ClubCarousel({ data, users, selected_id, onSelect }) {
    const [colums, setColums] = useState(3);
    const [columHeight, setColumeHeight] = useState(240);
    const [width, height] = useWindowSize();

    useEffect(() => {
        updateWindowDimensions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height]);

    const updateWindowDimensions = () => {
        if (width > 1500) {
            setColums(3);
            setColumeHeight(240);
        } else if (width > 1200) {
            setColums(2);
            setColumeHeight(200);
        } else {
            setColums(2);
            setColumeHeight(160);
        }
    };

    const renderRow = (datas, index) => {
        return (
            <Row key={`${index}`} xs={1} md={colums}>
                {datas.map((item) => (
                    <CarouselItem
                        key={item.club_id}
                        user={users.find((a) => a.user_id === item.user_id)}
                        item={item}
                        selected_id={selected_id}
                        columHeight={columHeight}
                        onSelect={onSelect}
                    />
                ))}
            </Row>
        );
    };

    return (
        <Row className="justify-content-center">
            <Col className="data-list">
                {data.length > 0 &&
                    R.splitEvery(colums, data).map((datas, index) =>
                        renderRow(datas, index)
                    )}
            </Col>
        </Row>
    );
}

export default ClubCarousel;
