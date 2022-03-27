import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import moment from 'moment-timezone';
import helper from '../../../../services/helper.service';
import adminApi from '../../../../services/admin.service';
import './styles.scss';
import { checkURL } from '../../../database/Model';
import PanigationComp, { PERPAGE } from '../Pagination';
import session from '../../../../services/session.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';

const R = require('ramda');

const MAX_WIDTH = '100%';

function CarouselItem({
    item,
    handleEdit,
    handleDelete,
    handleCalendarEvent,
    handleUpdateAllAccess,
}) {
    const eventTime = moment.tz(item.event_time, 'America/Los_Angeles');
    const eventDate = eventTime.format('L');
    const eventHour = eventTime.format('hh:mm A z');
    const currentUser = session.get('futureof-user');
    const club = (currentUser.user_role === 'user' || currentUser.user_role === '') ? session.get('audio-club') : session.get('futureof-club');
    const [more, setMore] = useState(false);

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
            </Row>

            <Row className='flex-column' style={{ padding: 10, height: more && '300px' }}>
                <Row className='justify-content-center align-items-center'>
                    <Col md='auto'>Event name:</Col>
                    <Col>
                        <span
                            style={{
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                display: 'block',
                                wordWrap: 'break-word',
                            }}
                        >
                            {item.event_name}
                        </span>
                    </Col>
                </Row>
                <Row className='justify-content-center align-items-center'>
                    <Col md='auto'>Date:</Col>
                    <Col>
                        <span
                            style={{
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                display: 'block',
                                wordWrap: 'break-word',
                            }}
                        >
                            {eventDate}
                        </span>
                    </Col>
                </Row>
                <Row className='justify-content-center align-items-center'>
                    <Col md='auto'>Time:</Col>
                    <Col>
                        <span
                            style={{
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                display: 'block',
                                wordWrap: 'break-word',
                            }}
                        >
                            {eventHour}
                        </span>
                    </Col>
                </Row>
                <Row
                    className='justify-content-center'
                >
                    <Col md='auto'>Description:</Col>
                    <Col>
                        <span
                            style={{
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                display: 'block',
                                wordWrap: 'break-word',
                            }}
                        >
                            {item.description}
                        </span>
                    </Col>
                </Row>
                <Row
                    className='justify-content-center'
                >
                    <Col md='auto'>Link:</Col>
                    <Col>
                        <span
                            style={{
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                display: 'block',
                                wordWrap: 'break-word',
                            }}
                        >
                            <a href={item.link} target='_blank'>{item.link}</a>
                        </span>
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
                                handleEdit(item.event_id);
                            }}
                        >
                            Edit
                        </Button>

                        <Button
                            type='button'
                            className='btn btn-primary mt-1'
                            style={{ marginTop: 16 }}
                            size='sm'
                            onClick={() => {
                                handleDelete(item.event_id);
                            }}
                        >
                            Delete
                        </Button>
                    </div>}
                </Col>

                {/* <div
                    onClick={() => {
                        handleCalendarEvent(item);
                    }}
                    style={{
                        position: 'absolute',
                        bottom: '0px',
                        right: '10px',
                        textAlign: 'center',
                        width: '100px',
                        cursor: 'pointer'
                    }}
                >
                    <FontAwesomeIcon icon={faCalendarAlt} style={{ transform: 'scale(3)' }} />
                    <p style={{ fontSize: '10px', marginTop: '14px' }}>Add to Cal</p>
                </div> */}
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
    handleCalendarEvent,
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
                                key={item.event_id}
                                item={item}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                handleCalendarEvent={handleCalendarEvent}
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
