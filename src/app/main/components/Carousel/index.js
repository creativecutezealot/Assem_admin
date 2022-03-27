import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import moment from 'moment-timezone';
import helper from '../../../../services/helper.service';
import adminApi from '../../../../services/admin.service';
import './styles.scss';
import { checkURL } from '../../../database/Model';
import PanigationComp, { PERPAGE } from '../Pagination';
import session from '../../../../services/session.service';

const R = require('ramda');

const MAX_WIDTH = '100%';

function CarouselItem({
    item,
    handleEdit,
    handleDelete,
    handleUpdateAllAccess,
}) {
    const startTime = moment.tz(item.start_time, 'America/Los_Angeles');
    const startHour = startTime.format('MM-DD/hh:mm A z');
    const isStarted = helper.assembleStarted(item);
    const badgeBgColor = isStarted ? 'red' : '#3B75B4';
    const badgeText = isStarted
        ? 'Room Is Live'
        : `Room starts at\n ${startHour}`;

    const [viewers, setViewers] = useState([]);
    const currentUser = session.get('futureof-user');
    const club = (currentUser.user_role === 'user' || currentUser.user_role === '') ? session.get('audio-club') : session.get('futureof-club');

    const [more, setMore] = useState(false);
    useEffect(() => {
        if (isStarted) {
            adminApi
                .getViewersWithAssembleId(item.assemble_id)
                .then((response) => {
                    if (response.status === true) {
                        setViewers(response.data);
                    }
                })
                .catch((error) => { });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStarted]);

    const handleMore = () => {
        setMore(!more);
    }

    return (
        <Col className='user-item'>
            <Row
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    backgroundImage: `url(${checkURL(item?.photo_url)
                        ? item?.photo_url
                        : club.assemble_photo_url
                        })`,
                    // width: (210 * 4) / 3,
                    height: 210,
                    borderColor: 'white',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                }}
            >
                <span
                    style={{
                        textAlign: 'center',
                        backgroundColor: badgeBgColor,
                        width: '100%',
                        paddingRight: 10,
                        paddingLeft: 10,
                        display: 'block',
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-line',
                    }}
                >
                    {badgeText}
                </span>
            </Row>

            <Row className='flex-column' style={{ padding: 10, height: more && '300px' }}>
                <Row className='justify-content-center align-items-center'>
                    {/* <Col md='auto'>Topic:</Col> */}
                    <Col>
                        {/* <span
                            style={{
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                display: 'block',
                                wordWrap: 'break-word',
                            }}
                        > */}
                        Topic: {item.assemble_name}
                        {/* </span> */}
                    </Col>
                </Row>
                <Row
                    className='justify-content-center '
                    style={{ marginTop: 10 }}
                >
                    {/* <Col md='auto'>Host:</Col> */}
                    <Col>
                        {/* <span
                            style={{
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                display: 'block',
                                wordWrap: 'break-word',
                            }}
                        > */}
                        Host: {helper.getDisplayName(item.host_name)}
                        {/* </span> */}
                    </Col>
                </Row>
                <Row
                    className='justify-content-center '
                    style={{ marginTop: 10 }}
                >
                    {/* <Col md='auto'>Created:</Col> */}
                    <Col>
                        {/* <span
                            style={{
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                display: 'block',
                                wordWrap: 'break-word',
                            }}
                        > */}
                        Created: {helper.getDisplayName(
                            item?.user_name || item?.host_name
                        )}
                        {/* </span> */}
                    </Col>
                </Row>
                <Row
                    className='justify-content-center '
                    style={{ marginTop: 10 }}
                >
                    {/* <Col md='auto'>#MEMBERS:</Col> */}
                    <Col>
                        {/* <span
                            style={{
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                display: 'block',
                                wordWrap: 'break-word',
                            }}
                        > */}
                        #MEMBERS: {isStarted
                            ? viewers.length
                            : item.notify_users.length}
                        {/* </span> */}
                    </Col>
                </Row>
            </Row>

            <Row className='justify-content-center mb-1'>
                <Col xs={6} md={6} className='d-flex flex-column justify-content-end'>
                    <Button
                        type='button'
                        variant='outline-dark'
                        className='btn'
                        size='sm'
                        onClick={() => {
                            handleMore();
                        }}
                    >
                        {more ? 'Less' : 'More'}
                    </Button>
                </Col>
                <Col xs={6} md={6} className='d-flex flex-column justify-content-end'>
                    {currentUser.user_role === 'manager' && <div className='d-flex align-items-end flex-column'
                        style={{
                            height: '100%',
                        }}
                    >
                        <Button
                            type='button'
                            className='btn btn-primary'
                            size='sm'
                            onClick={() => {
                                handleEdit(item.assemble_id);
                            }}
                        >
                            Edit
                        </Button>

                        <Button
                            type='button'
                            className='btn btn-primary mt-1'
                            size='sm'
                            onClick={() => {
                                handleDelete(item.assemble_id);
                            }}
                        >
                            Delete
                        </Button>
                    </div>}
                </Col>
            </Row>
        </Col>
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

function Carousel({
    data,
    loading,
    handleEdit,
    handleDelete,
    handleReorderItems,
    handleUpdateAllAccess,
}) {
    const [curPage, setCurPage] = React.useState(0);
    const splitData = R.splitEvery(PERPAGE, data);

    const nextPage = () => setCurPage(curPage + 1);
    const prevPage = () => setCurPage(curPage - 1);
    const changePage = (pageNum) => setCurPage(pageNum);

    return (
        <>
            {data.length > 0 ? (
                <Row>
                    {splitData[curPage].map((item) => (
                        <Col xs={12} md={4} lg={3} key={item.assemble_id} className='px-1' style={{ minWidth: (210 * 4) / 3 }}>
                            <CarouselItem
                                key={item.assemble_id}
                                item={item}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                handleUpdateAllAccess={handleUpdateAllAccess}
                            />
                        </Col>
                    ))}
                    <PanigationComp
                        totalData={splitData}
                        curPage={curPage}
                        prevPage={prevPage}
                        nextPage={nextPage}
                        changePage={changePage}
                    />
                </Row>
            ) : loading ? (
                <p className='text-center'>Loading...</p>
            ) : (
                <p className='text-center'>NO DATA</p>
            )}
        </>
    );
}

export default Carousel;
