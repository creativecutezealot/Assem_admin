import React, { useState, useLayoutEffect } from 'react';
import { Button, Row, Col, Image } from 'react-bootstrap';
import './styles.scss';
import helper from '../../../../services/helper.service';
import { checkURL } from '../../../database/Model';
import PanigationComp, { PERPAGE } from '../Pagination';

const R = require('ramda');
const MAX_WIDTH = '100%';
const placeHolder_img = require('../../../../assets/img/wind-power.jpg');

type ItemProps = {
    item: Object,
    handleEdit: (id: String) => void,
    handleDelete: (id: String) => void,
    handleSort: (id: String) => void,
};

function CarouselItem({
    item,
    handleEdit,
    handleDelete,
    handleSort,
}: ItemProps) {
    return (
        <Row
            style={{ width: '100%' }}
            className="d-flex justify-content-between user-item"
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: 3,
                }}
            >
                <Image
                    src={
                        checkURL(item.photo_url)
                            ? item.photo_url
                            : placeHolder_img
                    }
                    style={{
                        width: (220 * 4) / 5,
                        height: 220,
                        borderColor: 'white',
                        resize: 'both',
                    }}
                />
            </div>

            <Col style={{ padding: 30 }}>
                <Row className="justify-content-center align-items-center">
                    <Col>
                        <span
                            style={{
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                display: 'block',
                                wordWrap: 'break-word',
                            }}
                        >
                            Club Name: {item.club_name}
                        </span>
                    </Col>
                </Row>
                <Row className="justify-content-center align-items-center">
                    <Col>
                        <span
                            style={{
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                display: 'block',
                                wordWrap: 'break-word',
                            }}
                        >
                            Tier: {item.memebership}
                        </span>
                    </Col>
                </Row>
                <Row
                    className="justify-content-center "
                    style={{ marginTop: 10 }}
                >
                    <Col>
                        <span
                            style={{
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                display: 'block',
                                wordWrap: 'break-word',
                            }}
                        >
                            Desciption: {item.description}
                        </span>
                    </Col>
                </Row>
                <Row
                    className="justify-content-center "
                    style={{ marginTop: 10 }}
                >
                    <Col>
                        <span
                            style={{
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                display: 'block',
                                wordWrap: 'break-word',
                            }}
                        >
                            Created: {helper.getTime(item.created_at)}
                        </span>
                    </Col>
                </Row>
            </Col>
            <Col md="auto">
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                    }}
                >
                    <Button
                        type="button"
                        className="btn btn-primary"
                        size="sm"
                        onClick={() => {
                            handleEdit(item.club_id);
                        }}
                    >
                        Edit
                    </Button>

                    <Button
                        type="button"
                        className="btn btn-primary"
                        style={{ marginTop: 16 }}
                        size="sm"
                        onClick={() => {
                            handleDelete(item.club_id);
                        }}
                    >
                        Delete
                    </Button>
                </div>
            </Col>
        </Row>
    );
}

export function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
        function updateSize() {
            setSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}

type RowProps = {
    data: [Object],
    loading: Boolean,
    main_key: String,
    title_key: String,
    subtitle_key: String,
    date_key: String,
    handleEdit: (id: String) => void,
    handleDelete: (id: String) => void,
    handleSort: (id: String) => void,
};

function Carousel({
    data,
    loading,
    main_key,
    title_key,
    subtitle_key,
    date_key,
    handleEdit,
    handleDelete,
    handleSort,
}: RowProps) {
    const [curPage, setCurPage] = React.useState(0);
    const splitData = R.splitEvery(PERPAGE, data);

    const nextPage = () => setCurPage(curPage + 1);
    const prevPage = () => setCurPage(curPage - 1);
    const changePage = (pageNum) => setCurPage(pageNum);

    return (
        <>
            {data.length > 0 ? (
                <>
                    {splitData[curPage].map((item, index) => (
                        <CarouselItem
                            key={index}
                            item={item}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                            handleSort={handleSort}
                        />
                    ))}
                    <PanigationComp
                        totalData={splitData}
                        curPage={curPage}
                        prevPage={prevPage}
                        nextPage={nextPage}
                        changePage={changePage}
                    />
                </>
            ) : loading ? (
                <p className="text-center">Loading...</p>
            ) : (
                <p className="text-center">NO DATA</p>
            )}
        </>
    );
}

export default Carousel;
