import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import { Form, Button, InputGroup, Image, Modal } from 'react-bootstrap';
import 'react-image-crop/dist/ReactCrop.css';
import './styles.scss';

const pixelRatio = window.devicePixelRatio || 1;
function getResizedCanvas(canvas, newWidth, newHeight) {
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = newWidth;
    tmpCanvas.height = newHeight;

    const ctx = tmpCanvas.getContext('2d');
    ctx.drawImage(
        canvas,
        0,
        0,
        canvas.width,
        canvas.height,
        0,
        0,
        newWidth,
        newHeight
    );

    return tmpCanvas;
}

export const ImageForm = React.forwardRef((props, forwardedRef) => {
    const { name, initWidth, aspect, changeFileSrc, previewSrc } = props;
    const [upImg, setUpImg] = useState(null);
    const [blob, setBlob] = useState(null);
    const [crop, setCrop] = useState({ unit: '%', width: initWidth, aspect });
    const [previewURL, setPreviewURL] = useState(null);
    const imgRef = useRef(null);
    const fileRef = useRef();
    const previewCanvasRef = useRef(null);
    const [completedCrop, setCompletedCrop] = useState(null);

    const handleFileChange = (e) => {
        console.log(e.target.files);
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setUpImg(reader.result));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onLoad = useCallback((img) => {
        imgRef.current = img;
    }, []);

    useEffect(() => {
        if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
            return;
        }

        const image = imgRef.current;
        const canvas = previewCanvasRef.current;
        const crop = completedCrop;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext('2d');

        canvas.width = crop.width * pixelRatio;
        canvas.height = crop.height * pixelRatio;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );
        const canvasPreview = getResizedCanvas(
            previewCanvasRef.current,
            completedCrop.width,
            completedCrop.height
        );

        canvasPreview.toBlob(
            (blob) => {
                const previewUrl = window.URL.createObjectURL(blob);
                setBlob(blob);
                setPreviewURL(previewUrl);
            },
            'image/png',
            1
        );
    }, [completedCrop]);

    const previewWidth = Math.round(completedCrop?.width ?? 0);
    const previewHeight = Math.round(completedCrop?.height ?? 0);
    const radio =
        previewWidth > 0 && previewHeight > 0
            ? previewWidth / previewHeight
            : aspect;
    return (
        <InputGroup ref={forwardedRef}>
            {previewURL || previewSrc ? (
                <Image
                    src={previewURL ? previewURL : previewSrc}
                    className="image img-upload"
                    style={{
                        width: 154 * radio,
                        height: 154,
                    }}
                    onClick={() => {
                        if (fileRef.current) {
                            fileRef.current.click();
                        }
                    }}
                />
            ) : (
                <Button
                    type="button"
                    className="btn btn-upload"
                    onClick={() => {
                        if (fileRef.current) {
                            fileRef.current.click();
                        }
                    }}
                />
            )}
            <Form.File
                ref={fileRef}
                required
                name={name}
                id={name}
                label=""
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
            <Modal
                show={upImg !== null}
                aria-labelledby="contained-modal-title-vcenter"
                centered
                size="lg"
                onHide={() => {
                    setUpImg(null);
                }}
                dialogClassName="image-form"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Edit Image
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='d-flex align-items-center justify-content-center'>
                    <ReactCrop
                        src={upImg}
                        onImageLoaded={onLoad}
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                    />
                    <div>
                        <canvas
                            ref={previewCanvasRef}
                            style={{ display: 'none' }}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setUpImg(null);
                            setPreviewURL(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setUpImg(null);
                            changeFileSrc(blob, name);
                        }}
                    >
                        Ok
                    </Button>
                </Modal.Footer>
            </Modal>
        </InputGroup>
    );
});
