import React, { useState } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import helper from '../../../../services/helper.service';
import './styles.scss';
import { checkURL } from '../../../database/Model';
import PanigationComp, { PERPAGE } from '../Pagination';
import session from '../../../../services/session.service';
const MAX_WIDTH = '100%';
const R = require('ramda');

function CarouselItem({
    item,
    club_data,
    updating,
    handleEdit,
    handleDelete,
    handleReject,
    handleRemove,
    handleApprove,
    handleUpdateHelloAudio,
    handleUpdateAllAccess,
}) {
    const club = club_data;
    const currentUser = session.get('futureof-user');

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
                        : club.voice_photo_url
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
                    <Col md='auto'>Topic:</Col>
                    <Col>
                        <span
                            style={{
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                display: 'block',
                                wordWrap: 'break-word',
                            }}
                        >
                            {item.audio_name}
                        </span>
                    </Col>
                </Row>
                <Row className='justify-content-center '>
                    <Col md='auto'>Created:</Col>
                    <Col>
                        <span
                            style={{
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                display: 'block',
                                wordWrap: 'break-word',
                            }}
                        >
                            {helper.getDisplayName(item.host_name)}
                        </span>
                    </Col>
                </Row>

                <Row className='justify-content-center '>
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
                            {helper.getTime(item.created_at)}
                        </span>
                    </Col>
                </Row>

                <Row className='justify-content-center '>
                    <Col md='auto'>#LIKES:</Col>
                    <Col>
                        <span
                            style={{
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                display: 'block',
                                wordWrap: 'break-word',
                            }}
                        >
                            {item.likes_gained}
                        </span>
                    </Col>
                </Row>

                <Row className='justify-content-center '>
                    <Col md='auto'>Status:</Col>
                    <Col>
                        <span
                            style={{
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                display: 'block',
                                wordWrap: 'break-word',
                                textTransform: 'capitalize'
                            }}
                        >
                            {item.audio_status}
                        </span>
                    </Col>
                </Row>
                {
                    item.reject_reason && item.audio_status === 'rejected' && (
                        <Row className='justify-content-center '>
                            <Col md='auto'>Comment:</Col>
                            <Col>
                                <span
                                    style={{
                                        width: '100%',
                                        maxWidth: MAX_WIDTH,
                                        display: 'block',
                                        wordWrap: 'break-word',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {item.reject_reason}
                                </span>
                            </Col>
                        </Row>
                    )
                }

                {/* <Row className='justify-content-center'>
                    <Col md='auto'>
                        <Row className='justify-content-center align-items-center'>
                            <Form.Check
                                type={'checkbox'}
                                checked={item.is_sent_message}
                                readOnly                                
                            />
                            <span style={{ marginLeft: 4 }}>Message to All Members</span>
                        </Row>
                    </Col>
                    <Col></Col>
                </Row> */}
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
                    {
                        (currentUser.user_role === 'user' || currentUser.user_role === '') ?
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
                                    type='button'
                                    className='btn btn-primary'
                                    size='sm'
                                    onClick={() => {
                                        handleEdit(item.audio_id);
                                    }}
                                >
                                    Edit
                                </Button>

                                <Button
                                    type='button'
                                    className='btn btn-primary'
                                    style={{ marginTop: 16 }}
                                    size='sm'
                                    onClick={() => {
                                        handleDelete(item.audio_id);
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                            :
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                }}
                            >
                                {
                                    item.audio_status !== 'approved' && item.audio_status === 'submitted' && <Button
                                        type='button'
                                        className='btn btn-primary'
                                        size='sm'
                                        onClick={() => {
                                            handleApprove(item.audio_id);
                                        }}
                                    >
                                        {'Approve'}
                                    </Button>
                                }

                                {
                                    item.audio_status !== 'approved' && item.audio_status === 'submitted' && (
                                        <Button
                                            type='button'
                                            className='btn btn-primary mt-1'
                                            style={{ marginTop: 8 }}
                                            size='sm'
                                            onClick={() => {
                                                handleReject(item.audio_id);
                                            }}
                                        >
                                            {'Reject'}
                                        </Button>
                                    )
                                }

                                <Button
                                    type='button'
                                    className='btn btn-primary mt-1'
                                    size='sm'
                                    style={{ marginTop: 8 }}
                                    onClick={() => {
                                        handleEdit(item.audio_id);
                                    }}
                                >
                                    Edit
                                </Button>

                                <Button
                                    type='button'
                                    className='btn btn-primary mt-1'
                                    style={{ marginTop: 8 }}
                                    size='sm'
                                    onClick={() => {
                                        handleDelete(item.audio_id);
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                    }
                </Col>
            </Row>
        </Col>
    );
}

function Carousel({
    data,
    club_data,
    loading,
    updating,
    handleEdit,
    handleDelete,
    handleReject,
    handleRemove,
    handleApprove,
    handleReorderItems,
    handleUpdateHelloAudio,
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
                                key={item.audio_id}
                                club_data={club_data}
                                item={item}
                                updating={updating}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                handleReject={handleReject}
                                handleRemove={handleRemove}
                                handleApprove={handleApprove}
                                handleUpdateHelloAudio={handleUpdateHelloAudio}
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
