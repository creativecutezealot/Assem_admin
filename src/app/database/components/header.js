import React from 'react';
import '../tbl-clubs.scss';
import { Form } from 'react-bootstrap';

function TblHeader({
    title,
    filterItem,
    filter_keys,
    handleChangeSearch,
    handleChangeFilter,
}) {
    return (
        <div className="row" style={{ marginBottom: '20px', paddingRight: 20 }}>
            <div className="col-5">
                <h5 style={{ float: 'inline-start' }}>{title}</h5>
            </div>
            <div className="col-4">
                <Form.Control
                    className="form-control"
                    onChange={handleChangeSearch}
                    placeholder={`Search with ${filterItem || filter_keys[0]}`}
                />
            </div>
            <div className="col-3">
                <Form.Control as="select" onChange={handleChangeFilter}>
                    {filter_keys.map((k) => (
                        <option key={k} value={k}>
                            {k}
                        </option>
                    ))}
                </Form.Control>
            </div>
        </div>
    );
}

export default TblHeader;
