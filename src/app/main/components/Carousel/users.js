import React, { useState } from 'react';
import { Button, Row, Col, Image, Form } from 'react-bootstrap';
import './styles.scss';

import { checkURL } from '../../../database/Model';
import PanigationComp, { PERPAGE } from '../Pagination';

const R = require('ramda');

const placeHolder_avatar = require('../../../../assets/avatar/admin.jpg');

function CarouselItem({ item, user, selected_id, onSelect }) {
    const selected = item.user_id === selected_id;
    return (
        <Row
            style={{ width: '80%' }}
            className="d-flex justify-content-between user-item"
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Image
                    src={
                        checkURL(item?.photo_url)
                            ? item?.photo_url
                            : placeHolder_avatar
                    }
                    style={{
                        width: 190,
                        height: 200,
                        borderColor: 'white',
                        resize: 'both',
                    }}
                />
            </div>
            <Col style={{ padding: 30 }}>
                <div className="profile-role">
                    Name: {item?.first_name} {item?.last_name}
                </div>
                <div className="profile-role">
                    Job: {item?.job} {item?.company}
                </div>
                <div className="profile-role">
                    Description: {item?.short_bio}
                </div>
            </Col>

            <Col md="auto" className="d-flex align-items-center">
                <Button
                    variant={selected ? 'secondary' : 'primary'}
                    type="button"
                    onClick={() => {
                        onSelect(item, selected);
                    }}
                >
                    {selected ? 'Selected' : 'Select'}
                </Button>
            </Col>
        </Row>
    );
}

type RowProps = {
    data: [Object],
    selected_id: String,
    onSelect: (item: Object, selected: Boolean) => void,
};

function UserCarousel({ data, selected_id, onSelect }: RowProps) {
    const [search, setSearch] = useState('');

    const [curPage, setCurPage] = React.useState(0);
    const splitData = R.splitEvery(PERPAGE, data);

    const nextPage = () => setCurPage(curPage + 1);
    const prevPage = () => setCurPage(curPage - 1);
    const changePage = (pageNum) => setCurPage(pageNum);

    const handleInputChange = (event) => {
        const search = event.target.value;
        setSearch(search);
    };
    return (
        <>
            <Form.Control
                type="text"
                defaultValue={''}
                name={'search'}
                placeholder="SEARCH"
                onChange={handleInputChange}
                style={{
                    width: 300,
                    marginLeft: 10,
                    marginTop: 10,
                    marginBottom: 20,
                }}
            />
            {data.length > 0 && (
                <>
                    {splitData[curPage]
                        .filter((a) =>
                            `${a.first_name}${a.last_name}`
                                .toLowerCase()
                                .includes(search)
                        )
                        .map((item, index) => (
                            <CarouselItem
                                key={item.user_id}
                                item={item}
                                selected_id={selected_id}
                                onSelect={onSelect}
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
            )}
        </>
    );
}

export default UserCarousel;
