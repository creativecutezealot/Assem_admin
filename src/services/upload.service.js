import S3 from 'react-aws-s3';
import environment from '../enviroments';
import { awsImageConfig, awsAudioConfig } from '../enviroments/aws_config';

const ReactS3ImageClient = new S3(awsImageConfig);
const ReactS3AudioClient = new S3(awsAudioConfig);

export const handleUploadToS3 = async (
    file,
    file_name,
    ratio = environment.ratio4_3
) => {
    let result = '';
    if (file === '' || file == null) {
        return result;
    } else {
        await ReactS3ImageClient.uploadFile(file, file_name)
            .then((data) => {
                result = `${environment.cdnlink}${ratio}/${data.key}`;
            })
            .catch((err) => {
                console.log('image uploading error', err);
            });
    }
    return new Promise((resolve) => {
        resolve(result);
    });
};

export const handleUploadAudioToS3 = async (file, file_name) => {
    let result = '';
    if (file === '' || file == null) {
        return result;
    } else {
        await ReactS3AudioClient.uploadFile(file, file_name)
            .then((data) => {
                result = `${environment.cdnlink_audio}/${data.key}`;
            })
            .catch((err) => {
                console.log('image uploading error', err);
            });
    }
    return new Promise((resolve) => {
        resolve(result);
    });
};
