import React, { useState } from 'react';
import './invitation-requests.scss';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';

class InvitationRequests extends React.Component {
    constructor(props) {
        super();
        this.state = {
            step: 1, ///
            request_lists: [],
            is_loading: true,
        };
    }

    componentDidMount() {
        adminApi
            .getReqests()
            .then((response) => {
                if (response.status === true) {
                    console.log(JSON.stringify(response.data));
                    var results = response.data;
                    this.setState({
                        request_lists: results,
                    });
                }
            })
            .catch((error) => {
                console.log('err: ', error);
            });
    }

    onApprove(request_id, state) {
        console.log(request_id, state);
        let request_state = state ? false : true;
        let data;
        for (let i = 0; i < this.state.request_lists.length; i++) {
            if (this.state.request_lists[i].request_id === request_id) {
                data = this.state.request_lists[i];
                break;
            }
        }
        data.request_state = request_state;
        adminApi
            .approve(data)
            .then((response) => {
                if (response.status === true) {
                    console.log(JSON.stringify(response.data));
                    for (let i = 0; i < this.state.request_lists.length; i++) {
                        if (
                            this.state.request_lists[i].request_id ===
                            request_id
                        ) {
                            // this.state.request_lists[i].request_state =
                            //     request_state;

                            let request_lists = [...this.state.request_lists];
                            // 2. Make a shallow copy of the item you want to mutate
                            let item = { ...request_lists[i] };
                            // 3. Replace the property you're intested in
                            item.request_state = request_state;
                            // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
                            request_lists[i] = item;
                            // 5. Set the state to our new copy
                            this.setState({ request_lists });
                            // this.state.request_lists.splice(i,1);
                            break;
                        }
                    }
                    let request_lists = this.state.request_lists;
                    helper.showToast('Success', 'Proving is success', 1);
                    this.setState({
                        request_lists: request_lists,
                        is_loading: false,
                    });
                } else {
                    helper.showToast('Error', 'Proving is failed', 3);
                }
            })
            .catch((error) => {
                console.log('err: ', error);
                helper.showToast('Error', 'Proving is failed', 3);
            });
    }

    render() {
        return (
            <div className="invitation-requests">
                <div className="content">
                    <form className="mx-auto px-1">
                        <h4>MEMBERSHIP REQUESTS</h4>
                        <div
                            className={
                                this.state.step === 1
                                    ? 'form-lg'
                                    : 'form-lg hidden'
                            }
                        >
                            <div className="row mt-5 mx-0">
                                {this.state.request_lists.length > 0 ? (
                                    <table className="table table-responsive">
                                        <thead>
                                            <tr>
                                                <th>FIRST NAME</th>
                                                <th>LAST NAME</th>
                                                <th>EMAIL</th>
                                                <th>PHONE</th>
                                                <th>BIO</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.request_lists.map(
                                                (request, key) => (
                                                    <tr key={key}>
                                                        <td>
                                                            {request.first_name}
                                                        </td>
                                                        <td>
                                                            {request.last_name}
                                                        </td>
                                                        <td>{request.email}</td>
                                                        <td>{request.phone}</td>
                                                        <td>{request.bio}</td>
                                                        {request.request_state ? (
                                                            <td className="d-flex h-100">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger"
                                                                >
                                                                    SENT
                                                                </button>
                                                            </td>
                                                        ) : (
                                                            <td className="d-flex h-100">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-primary"
                                                                    onClick={() =>
                                                                        this.onApprove(
                                                                            request.request_id,
                                                                            request.request_state
                                                                        )
                                                                    }
                                                                >
                                                                    APPROVE
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                ) : this.state.is_loading ? (
                                    <p className="text-center">Loading...</p>
                                ) : (
                                    <p className="text-center">No Request</p>
                                )}
                            </div>
                            <button
                                type="button"
                                className="btn btn-primary mt-5"
                            >
                                FINISH
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default InvitationRequests;
