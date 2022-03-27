import React, { useState } from 'react';
import '../tbl-clubs.scss';
import { Link } from 'react-router-dom';
import { Table, Form, Modal, Button, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSortAmountDown,
    faSortAmountUp,
    faPencilAlt,
} from '@fortawesome/free-solid-svg-icons';
import _clonedeep from 'lodash.clonedeep';
import ReactAudioPlayer from 'react-audio-player';
import PanigationComp from '../../main/components/Pagination';
import Linkify from 'react-linkify';

import DatabaseConnectClubs from '../ConnectClubs';
import DatabaseConnectClubsWithUser from '../ConnectClubs/clubs';
import DatabaseConnectUsers from '../ConnectUsers';
import DatabaseConnectAssembles from '../ConnectAssembles';
import DatabaseConnectAssemblesWithUser from '../ConnectAssembles/assembles';
import DatabaseConnectReferralsWithUser from '../ReferralUsers';
import DatabaseConnectReferralsWithClub from '../ReferralClubs';

import { checkURL } from '../Model';
const R = require('ramda');

function TableHeader({
    sorted,
    deleting,
    key_val,
    edit_keys,
    change_keys,
    selectedAll,
    onSort,
    onSelectAll,
    onDeleteAll,
}) {
    const sort_value = sorted[key_val] || false;
    const isEdit = edit_keys.includes(key_val) || change_keys.includes(key_val);
    return (
        <th id={key_val} onClick={key_val === 'delete_item' ? null : onSort}>
            {key_val === 'delete_item' && deleting ? (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <img
                        className="trash"
                        onClick={onDeleteAll}
                        style={{ width: 24, height: 24 }}
                        src={require('../../../assets/img/trash.png')}
                        alt=""
                    />
                    <Form.Check
                        style={{ marginLeft: 24 }}
                        type="checkbox"
                        checked={selectedAll}
                        onChange={onSelectAll}
                    />
                </div>
            ) : (
                <>
                    {key_val}{' '}
                    <div id={key_val} onClick={onSort}>
                        <FontAwesomeIcon
                            icon={
                                sort_value ? faSortAmountUp : faSortAmountDown
                            }
                        />{' '}
                    </div>
                    {isEdit && (
                        <div>
                            <FontAwesomeIcon icon={faPencilAlt} />
                        </div>
                    )}
                </>
            )}
        </th>
    );
}

////////////
type BProps = {
    key_val: String,
    type: String,
    deleting: Boolean,
    data: Object,
    link_keys: [String],
    link_paths: [String],
    main_key: String,
    edit_keys: [String],
    change_keys: [String],
    del_ids: [String],
    onChangeBoolValue: (event: Event) => void,
    onChangeStrValue: (event: Event) => void,
    onDeleteItem: (event: Event) => void,
    onBulkDeleteItem: (event: Event) => void,
    onShowModal: (key: any, value: any) => void,
};
function TableBody({
    data,
    key_val,
    type,
    link_keys,
    link_paths,
    main_key,
    edit_keys,
    change_keys,
    deleting,
    del_ids,
    onChangeBoolValue,
    onChangeStrValue,
    onDeleteItem,
    onBulkDeleteItem,
    onShowModal,
}: BProps) {
    let value = data[key_val];
    const isDelChecked = del_ids.includes(data[main_key]);
    if (key_val === 'user_role') {
        value = value !== '' ? value : 'user';
    }
    if (key_val === 'show_club_name') {
        // value = user_role && user_role === 'manager' ? data[key_val] : '';
        const club_name_list = data[key_val];
        if (club_name_list) {
            return (
                <td>
                    {club_name_list.map((club_name, index) => {
                        return <p key={index}>{club_name}</p>;
                    })}
                </td>
            );
        }
    }
    if (type === 'Boolean') {
        if (change_keys.includes(key_val)) {
            return (
                <td>
                    <Form.Check
                        id={data[main_key]}
                        name={key_val}
                        type="checkbox"
                        checked={value}
                        onChange={onChangeBoolValue}
                    />
                </td>
            );
        }
        return (
            <td>
                <Form.Check type="checkbox" checked={value} readOnly />
            </td>
        );
    } else if (type === 'Number') {
        return <td>{value}</td>;
    } else {
        if (value) {
            if (key_val !== '' && edit_keys.includes(key_val)) {
                return (
                    <td>
                        <div
                            id={data[main_key]}
                            name={key_val}
                            data-record-id={value}
                            onClick={onChangeStrValue}
                        >
                            {value ?? ''}
                        </div>
                    </td>
                );
            }
            if (key_val !== '' && link_keys.includes(key_val)) {
                const indexLinkKey = link_keys.indexOf(key_val);
                return (
                    <td>
                        <Link
                            onClick={() => {
                                onShowModal(indexLinkKey, value);
                            }}
                            to="#"
                        >
                            {value}
                        </Link>
                    </td>
                );
            }
            if (
                key_val.includes('_url') ||
                key_val.toLowerCase().includes('photo')
            ) {
                if (checkURL(value)) {
                    return (
                        <td>
                            <img className="tbl-image" src={value} alt="" />
                        </td>
                    );
                }

                if (key_val === 'audio_url') {
                    return (
                        <td>
                            <ReactAudioPlayer
                                src={value}
                                autoPlay={false}
                                controls
                            />
                        </td>
                    );
                }
            }
            if (value.length > 45) {
                return (
                    <td>
                        <div
                            style={{
                                width: 300,
                                maxHeight: 150,
                                whiteSpace: 'normal',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                textAlign: 'left',
                                overflowX: 'hidden',
                                overflowY: 'auto',
                            }}
                        >
                            <Linkify
                                properties={{
                                    target: '_blank',
                                }}
                            >
                                {value}
                            </Linkify>
                        </div>
                    </td>
                );
            }
        }
        return (
            <>
                {key_val === 'delete_item' && deleting ? (
                    <td>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <img
                                className="trash"
                                style={{ width: 24, height: 24 }}
                                id={data[main_key]}
                                onClick={onDeleteItem}
                                src={require('../../../assets/img/trash.png')}
                                alt=""
                            />
                            <Form.Check
                                style={{ marginLeft: 24 }}
                                id={data[main_key]}
                                name={key_val}
                                type="checkbox"
                                checked={isDelChecked}
                                onChange={onBulkDeleteItem}
                            />
                        </div>
                    </td>
                ) : (
                    <td>
                        <Linkify
                            p
                            properties={{
                                target: '_blank',
                            }}
                        >
                            {value}
                        </Linkify>
                    </td>
                )}
            </>
        );
    }
}

/////////////

type CompProps = {
    data_list: Array<Object>,
    dataModel: Object,
    filterItem: Object,
    search: String,
    loading: Boolean,
    link_keys: [String],
    link_paths: [String],
    main_key: String,
    edit_keys: [String],
    change_keys: [String],
    perPage: Number,
    hover: Boolean,
    onChangeBoolValue: (event: Event) => void,
    onChangeStrValue: (event: Event) => void,
    onDeleteItem: (event: Event) => void,
    onDeleteBulk: (ids: [String], () => void) => void,
};

function TableComp({
    data_list,
    dataModel,
    filterItem,
    search,
    loading,
    link_keys = [],
    link_paths = [],
    main_key,
    edit_keys = [],
    change_keys = [],
    perPage = 10,
    hover = false,
    deleting = true,
    onChangeBoolValue,
    onChangeStrValue,
    onDeleteItem,
    onDeleteBulk,
}: CompProps) {
    var model_keys = Object.keys(dataModel);
    if (deleting) {
        model_keys = ['delete_item', ...model_keys];
    }
    const [sorted, setSorted] = useState({});
    const [sort_key, setSortKey] = useState('');
    const [curPage, setCurPage] = React.useState(0);
    const [showModal, setShowModal] = React.useState(false);
    const [showDelModal, setShowDelModal] = React.useState(false);
    const [showDelAllModal, setShowDelAllModal] = React.useState(false);
    const [connectKey, setConnectKey] = React.useState('');
    const [connectValue, setConnectValue] = React.useState('');
    const [delId, setDelId] = React.useState(null);
    const [delIds, setDelIds] = React.useState([]);

    const nextPage = () => setCurPage(curPage + 1);
    const prevPage = () => setCurPage(curPage - 1);
    const changePage = (pageNum) => setCurPage(pageNum);

    const onShowModal = (key, value) => {
        console.log(link_paths[key], value);
        setShowModal(!showModal);
        setConnectKey(link_paths[key]);
        setConnectValue(value);
    };

    const onShowDelModal = (event) => {
        const del_id = event.target.id;
        console.log('del_id', del_id);
        setDelId(del_id);
        setShowDelModal(!showDelModal);
    };

    const onAddBulkDelId = (event) => {
        const del_id = event.target.id;
        if (event.target.checked) {
            setDelIds([...delIds, del_id]);
        } else {
            setDelIds(delIds.filter((id) => id !== del_id));
        }
    };

    const onSelectAll = (event) => {
        if (event.target.checked) {
            const selDelIds = (data_list || []).map((a) => a[main_key]);
            setDelIds(selDelIds);
        } else {
            setDelIds([]);
        }
    };

    const onDeleteAll = () => {
        if (delIds.length > 0) {
            setShowDelAllModal(true);
        }
    };

    const handleSortClick = (event) => {
        const key = event.target.id;
        if (key === '' || !key) {
            return;
        }
        let tempSorted = _clonedeep(sorted);
        const sorted_value = tempSorted[key] || false;
        tempSorted[key] = !sorted_value;
        setSortKey(key);
        setSorted(tempSorted);
    };

    const sorted_value = sorted[sort_key] || false;
    const data = data_list.sort((a, b) => {
        if (!sorted_value) {
            if (a[sort_key] > b[sort_key]) {
                return 1;
            } else if (a[sort_key] < b[sort_key]) {
                return -1;
            } else {
                return 0;
            }
        } else {
            if (a[sort_key] > b[sort_key]) {
                return -1;
            } else if (a[sort_key] < b[sort_key]) {
                return 1;
            } else {
                return 0;
            }
        }
    });

    const splitData = R.splitEvery(perPage, data);

    const renderConnetComponet = (key, value) => {
        if (key === '/database/connect/users/') {
            return <DatabaseConnectUsers id={value} />;
        } else if (key === '/database/connect/assembles/') {
            return <DatabaseConnectAssembles id={value} />;
        } else if (key === '/database/connect/assembles/users/') {
            return <DatabaseConnectAssemblesWithUser id={value} />;
        } else if (key === '/database/connect/clubs/') {
            return (
                <DatabaseConnectClubs
                    id={value}
                    club={data.find((a) => a.club_id === value)}
                />
            );
        } else if (key === '/database/connect/clubs/users/') {
            return (
                <DatabaseConnectClubsWithUser
                    id={value}
                    club={data.find((a) => a.club_id === value)}
                />
            );
        } else if (key === '/database/connect/referrals/user') {
            return <DatabaseConnectReferralsWithUser id={value} />;
        } else if (key === '/database/connect/referrals/club') {
            return <DatabaseConnectReferralsWithClub id={value} />;
        } else {
            return null;
        }
    };

    return data_list.length > 0 ? (
        <>
            <Table striped bordered responsive size="sm" hover={hover}>
                <thead>
                    <tr>
                        {model_keys.map((key) => (
                            <TableHeader
                                key={key}
                                sorted={sorted}
                                key_val={key}
                                edit_keys={edit_keys}
                                change_keys={change_keys}
                                onSort={handleSortClick}
                                onSelectAll={onSelectAll}
                                onDeleteAll={onDeleteAll}
                                selectedAll={data_list.length === delIds.length}
                                deleting={deleting}
                            />
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {splitData[curPage]
                        .filter((rr) =>
                            `${rr[filterItem]}`
                                .toLowerCase()
                                .includes(search.toLowerCase())
                        )
                        .map((item, key) => (
                            <tr key={key}>
                                {model_keys.map((r, index) => (
                                    <TableBody
                                        key={index}
                                        data={item}
                                        key_val={r}
                                        type={dataModel[r]}
                                        link_keys={link_keys}
                                        link_paths={link_paths}
                                        main_key={main_key}
                                        edit_keys={edit_keys}
                                        change_keys={change_keys}
                                        del_ids={delIds}
                                        onChangeBoolValue={onChangeBoolValue}
                                        onChangeStrValue={onChangeStrValue}
                                        onDeleteItem={onShowDelModal}
                                        onBulkDeleteItem={onAddBulkDelId}
                                        onShowModal={onShowModal}
                                        deleting={deleting}
                                    />
                                ))}
                            </tr>
                        ))}
                </tbody>
            </Table>
            <PanigationComp
                isFull={true}
                totalData={splitData}
                curPage={curPage}
                prevPage={prevPage}
                nextPage={nextPage}
                changePage={changePage}
            />
            <Modal
                size="lg"
                show={showModal}
                aria-labelledby="contained-modal-title-vcenter"
                dialogClassName="connect-modal-90vw"
                centered
                onHide={() => {
                    setShowModal(!showModal);
                }}
            >
                <Modal.Body>
                    {renderConnetComponet(connectKey, connectValue)}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={onShowModal}>Close</Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showDelModal}
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                onHide={onShowDelModal}
                dialogClassName={'primaryModal'}
            >
                <Modal.Body>
                    <Row className="justify-content-center">
                        Do you really want to delete this item?
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={onShowDelModal}>
                        CANCEL
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            if (delId) {
                                onDeleteItem(delId);
                                setDelId(null);
                            }
                            setShowDelModal(false);
                        }}
                    >
                        DELETE
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal
                show={showDelAllModal}
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                onHide={() => {
                    setShowDelAllModal(false);
                }}
                dialogClassName={'primaryModal'}
            >
                <Modal.Body>
                    <Row className="justify-content-center">
                        Do you really want to delete selected items?
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setShowDelAllModal(false);
                        }}
                    >
                        CANCEL
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            if (delIds.length > 0) {
                                onDeleteBulk(delIds, () => {
                                    setDelIds([]);
                                });
                            }
                            setShowDelAllModal(false);
                        }}
                    >
                        DELETE
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    ) : loading ? (
        <p className="text-center">Loading...</p>
    ) : (
        <p className="text-center">NO DATA</p>
    );
}

export default TableComp;
