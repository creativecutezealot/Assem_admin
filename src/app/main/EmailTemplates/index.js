import React, { createRef } from 'react';
import { Button, Row, Col, Modal, Form } from 'react-bootstrap';
import './styles.scss';

import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';

import Content from '../../../components/content';
import { Editor } from '@tinymce/tinymce-react';
import development from '../../../enviroments/development';

class EmailTemplates extends React.Component {
    constructor(props) {
        super();
        this.state = {
            showModal: false,
            initialValue: null,
            data_list: [],
            submit: true,
            approve: true,
            reject: true,
            delete: true
        };
        this.editorRef = createRef(null);
    }

    componentDidMount() {
        this.getAllEmailTemplates();
    }

    getAllEmailTemplates = () => {
        this.setState({
            loading: true,
        });
        adminApi
            .getAllEmailTemplates()
            .then((response) => {
                if (response.status === true) {
                    let results = response.data;

                    console.log('results: ', results);
                    const submitted = results.find(result => result.type === 'submit');
                    const approved = results.find(result => result.type === 'approve');
                    const rejected = results.find(result => result.type === 'reject');
                    const deleted = results.find(result => result.type === 'delete');
                    let data_list = [submitted, approved, rejected, deleted];
                    this.setState({
                        data_list: data_list,
                        submit: submitted.is_send,
                        approve: approved.is_send,
                        reject: rejected.is_send,
                        delete: deleted.is_send,
                    });
                }
            })
            .catch((error) => {
                console.log('err: ', error);
                this.setState({
                    loading: false,
                });
            });
    }

    createContent = () => {
        if (this.editorRef.current) {
            console.log(this.editorRef.current.getContent());
            let content = this.editorRef.current.getContent();
            let updateObj = {
                type: 'delete',
                content: content
            }
            adminApi
                .createEmailTemplate(updateObj)
                .then((response) => {
                    console.log('create res', response);
                    if (response.status === true) {
                    } else {

                    }
                })
                .catch((error) => {
                    console.log('err: ', error);
                });
        }
    };

    updateContent = () => {
        if (this.editorRef.current) {
            let content = this.editorRef.current.getContent();
            console.log(content);
            if (this.state.initialValue) {
                let template_id = this.state.initialValue.template_id;
                let updateObj = {
                    content: content
                }
                console.log('updateObj: ', updateObj);
                adminApi
                    .updateEmailTemplate(template_id, updateObj)
                    .then((response) => {
                        console.log('update res', response);
                        this.setState({
                            showModal: !this.state.showModal,
                        });
                        if (response.status === true) {
                            helper.showToast(
                                'Success',
                                'Template updated successfully',
                                1
                            );
                            let data_list = this.state.data_list;
                            let index = data_list.findIndex(data => data.template_id === template_id);
                            data_list[index] = response.data;
                            this.setState({
                                data_list: data_list
                            });
                        } else {
                            helper.showToast('Error', response.data, 3);
                        }
                    })
                    .catch((error) => {
                        console.log('err: ', error);
                        helper.showToast(
                            'Error',
                            error.message ||
                            'There was an error while updating the template.',
                            3
                        );
                        this.setState({
                            showModal: !this.state.showModal,
                        });
                    });
            }
        }
    };

    updateSendOption = (template, is_send) => {
        let template_id = template.template_id;
        let updateObj = {
            is_send: is_send
        };
        adminApi
            .updateEmailTemplate(template_id, updateObj)
            .then((response) => {
                if (response.status === true) {
                    this.setState({
                        [template.type]: is_send
                    });
                }
            })
            .catch((error) => {
                console.log('err: ', error);
            });
    }

    handleShowModal = (data) => {
        console.log(data);
        this.setState({
            initialValue: data,
            showModal: !this.state.showModal,
        });
    };

    addText = (text) => {
        this.editorRef.current.insertContent(text);
    }

    handleSwitchChange = (event) => {
        const target = event.target;
        const value = target.checked;
        const name = target.name;
        if (this.state.data_list && this.state.data_list.length > 0) {
            let template = this.state.data_list.find(item => item.type === name);
            this.updateSendOption(template, value);
        }
    }

    render() {
        const { showModal } = this.state;
        return (
            <Content>
                <div className='group-list'>
                    <Row className='justify-content-start'>
                        <h4>EMAIL TEMPLATES</h4>
                    </Row>
                    <div className='group-list-container'>
                        {
                            this.state.data_list.map((data, index) => (
                                <div key={index}>
                                    <Row className='justify-content-start mt-3'>
                                        {data.type === 'submit' && <h5>AUDIO SUBMITTED</h5>}
                                        {data.type === 'approve' && <h5>AUDIO APPROVED</h5>}
                                        {data.type === 'reject' && <h5>AUDIO REJECTED</h5>}
                                        {data.type === 'delete' && <h5>AUDIO DELETED</h5>}
                                        <Form.Check
                                            className='ml-2'
                                            inline
                                            type='checkbox'
                                            name={data.type}
                                            checked={this.state[data.type]}
                                            onChange={this.handleSwitchChange}
                                        />
                                    </Row>
                                    <div className='template' onClick={() => this.handleShowModal(data)}>
                                        <div className='email-template' dangerouslySetInnerHTML={{ __html: data.content }}></div>
                                    </div>
                                </div>
                            ))
                        }
                        <Modal
                            show={showModal}
                            size='lg'
                            aria-labelledby='contained-modal-title-vcenter'
                            centered
                            onHide={this.handleShowModal}
                            dialogClassName={'primaryModal'}
                        >
                            <Modal.Body>
                                <Row className='justify-content-center'>
                                    <Button
                                        className='m-2'
                                        variant='primary'
                                        onClick={() => this.addText('@username')}
                                    >
                                        @username
                                    </Button>
                                    <Button
                                        className='m-2'
                                        variant='primary'
                                        onClick={() => this.addText('@clubname')}
                                    >
                                        @clubname
                                    </Button>
                                    {this.state.initialValue && (this.state.initialValue.type === 'approve' || this.state.initialValue.type === 'reject') && <Button
                                        className='m-2'
                                        variant='primary'
                                        onClick={() => this.addText('@managername')}
                                    >
                                        @managername
                                    </Button>}
                                    <Editor
                                        apiKey={development.TINYMCEKEY}
                                        onInit={(evt, editor) => this.editorRef.current = editor}
                                        initialValue={this.state.initialValue ? this.state.initialValue.content : ''}
                                        init={{
                                            height: 500,
                                            auto_focus: true,
                                            menubar: true,
                                            anchor_top: false,
                                            anchor_bottom: false,
                                            plugins: [
                                                'advlist autolink lists link image charmap print preview anchor',
                                                'searchreplace visualblocks code fullscreen',
                                                'insertdatetime media table paste code help wordcount'
                                            ],
                                            toolbar: 'undo redo | formatselect | ' +
                                                'bold italic backcolor | alignleft aligncenter ' +
                                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                                'removeformat | help',
                                            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                            file_picker_callback: function (callback, value, meta) {
                                                /* Provide file and text for the link dialog */
                                                if (meta.filetype === 'file') {
                                                    callback('https://www.google.com/logos/google.jpg', { text: 'My text' });
                                                }

                                                /* Provide image and alt text for the image dialog */
                                                if (meta.filetype === 'image') {
                                                    callback('https://www.google.com/logos/google.jpg', { alt: 'My alt text' });
                                                }

                                                /* Provide alternative source and posted for the media dialog */
                                                if (meta.filetype === 'media') {
                                                    callback('movie.mp4', { source2: 'alt.ogg', poster: 'https://www.google.com/logos/google.jpg' });
                                                }
                                            },
                                        }}
                                    />
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant='primary'
                                    onClick={this.handleShowModal}
                                >
                                    CANCEL
                                </Button>
                                <Button
                                    variant='danger'
                                    onClick={this.updateContent}
                                >
                                    SAVE
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                </div>
            </Content>
        );
    }
}

export default EmailTemplates;
