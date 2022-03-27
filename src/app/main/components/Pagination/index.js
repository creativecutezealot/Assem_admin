import React from 'react';
import { Row, Pagination } from 'react-bootstrap';

export const PERPAGE = 8;

function PanigationComp(props) {
    const {
        isFull = false,
        totalData,
        curPage,
        prevPage,
        nextPage,
        changePage,
    } = props;
    if (totalData.length > 1) {
        return (
            <Row
                style={{ width: isFull ? '100%' : '80%', marginTop: 16 }}
                className="align-items-end justify-content-end"
            >
                <Pagination size="sm">
                    {curPage > 0 && (
                        <Pagination.Item key={'prev'} onClick={prevPage}>
                            Prev
                        </Pagination.Item>
                    )}
                    {totalData.map((item, index) => (
                        <Pagination.Item
                            key={index}
                            active={index === curPage}
                            onClick={() => {
                                changePage(index);
                            }}
                        >
                            {index + 1}
                        </Pagination.Item>
                    ))}
                    {curPage < totalData.length - 1 && (
                        <Pagination.Item key={'next'} onClick={nextPage}>
                            Next
                        </Pagination.Item>
                    )}
                </Pagination>
            </Row>
        );
    }
    return null;
}

export default PanigationComp;
