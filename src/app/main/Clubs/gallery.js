import React, { useState, useEffect } from 'react';
import { Button, Col, InputGroup, Modal, Image } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ImageForm } from '../components/ImageForm/gallery';
import helpService from '../../../services/helper.service';
import adminService from '../../../services/admin.service';
import { handleUploadToS3 } from '../../../services/upload.service';
import environment from '../../../enviroments';

const ratio = 4 / 3;

function Gallery(props) {
    const { club_id, onHandleUploadURLs } = props;

    const [visible, setVisible] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (club_id && club_id) {
            getImages();
        } else {
            // setFiles([])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [club_id, visible]);

    const getImages = () => {
        adminService
            .getClubImages(club_id)
            .then((res) => {
                console.log('clubRoomImages', res);
                if (res.status && res.data) {
                    normalizeData(res.data);
                }
            })
            .catch((error) => {
                console.log('clubRoomImages error', error);
            });
    };

    const normalizeData = (data) => {
        const sortedData = data.sort((a, b) => {
            return (
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );
        });
        const cloneFiles = [];
        for (const item of sortedData) {
            const club_id = item.pri_key.replace('ROOMIMAGES#', '');
            const image_id = item.sort_key.replace('#METADATA#ROOMIMAGES#', '');
            cloneFiles.push({
                id: image_id,
                club_id,
                blob: item.photo_url,
            });
        }
        console.log('cloneFiles: ', cloneFiles);
        setFiles(cloneFiles);
    };

    const handleSetVisible = () => {
        setVisible(true);
    };

    const hideModal = () => {
        setVisible(false);
    };

    const onUpload = async () => {
        const uploadBlobs = files.filter((a) => typeof a.blob !== 'string');
        if (uploadBlobs && uploadBlobs.length > 0) {
            setUploading(true);
            const uploadResults = [];
            for (const blobObj of uploadBlobs) {
                try {
                    const resultURL = await handleUploadToS3(
                        blobObj.blob,
                        blobObj.id,
                        environment.ratio4_3
                    );
                    if (club_id && club_id !== '') {
                        // const createRes = await adminService.createClubRoomImage({
                        //     club_id,
                        //     photo_url: resultURL
                        // })
                    }
                    uploadResults.push(resultURL);
                } catch (error) {
                    console.log('upload error', error);
                }
            }
            if (uploadResults.length > 0) {
                if (club_id && club_id !== '') {
                    getImages();
                } else {
                    if (onHandleUploadURLs) {
                        onHandleUploadURLs(uploadResults);
                        hideModal();
                    }
                }
            }
            setUploading(false);
            helpService.showToast('Success', 'Images uploaded successfully', 1);
        } else {
            helpService.showToast('Warning', 'There is no pending images', 2);
        }
    };

    const onRemove = async (id, club_id) => {
        if (club_id) {
            try {
                await adminService.deleteClubRoomImage(club_id, id);
                console.log('Remove image id', id);
                setFiles(files.filter((a) => a.id !== id));
            } catch (error) {
                console.log(error);
            }
        } else {
            console.log('Remove image id', id);
            setFiles(files.filter((a) => a.id !== id));
        }
    };

    const handleFileChange = (blob, name) => {
        const cloneFiles = [
            {
                id: new Date().getTime(),
                blob,
            },
            ...files,
        ];
        setFiles(cloneFiles);
    };

    const getImgSrc = (blob) => {
        if (typeof blob === 'string' && helpService.isURL(blob)) {
            return blob;
        } else {
            return URL.createObjectURL(blob);
        }
    };

    return (
        <div>
            <InputGroup as={Col} style={{ marginLeft: 32 }}>
                <Button
                    type="button"
                    className="btn btn-gallery"
                    onClick={handleSetVisible}
                />
            </InputGroup>
            <Modal
                show={visible}
                aria-labelledby="contained-modal-title-vcenter"
                centered
                size="xl"
                onHide={hideModal}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Room Images
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ImageForm
                        name={'room_image'}
                        initWidth={80}
                        aspect={ratio}
                        changeFileSrc={handleFileChange}
                    />
                    <div
                        style={{
                            marginTop: 16,
                            paddingBottom: 16,
                            overflowX: 'auto',
                            overflowY: 'hidden',
                            maxHeight: 200,
                            whiteSpace: 'nowrap',
                            display: 'flex',
                        }}
                    >
                        {files.map((file, index) => {
                            return (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        marginRight: 16,
                                        position: 'relative',
                                        width: 154 * ratio,
                                        // display: 'inline-block'
                                    }}
                                >
                                    <Image
                                        src={getImgSrc(file.blob)}
                                        className="image img-upload"
                                        style={{
                                            width: 154 * ratio,
                                            height: 154,
                                        }}
                                    ></Image>
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 5,
                                            right: 5,
                                        }}
                                        onClick={() => {
                                            onRemove(file.id, file.club_id);
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faTimesCircle}
                                            color="white"
                                            size="2x"
                                            style={{ fontSize: 22 }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hideModal}>
                        Close
                    </Button>
                    <Button
                        disabled={uploading}
                        variant="primary"
                        onClick={onUpload}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Gallery;
