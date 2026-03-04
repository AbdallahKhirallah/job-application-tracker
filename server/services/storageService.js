const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');


const s3 = new S3Client({
  endpoint: `https://${process.env.DO_SPACES_REGION}.digitaloceanspaces.com`,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
  forcePathStyle: false,
});

async function uploadResume(file, userId, applicationId) {
  const ext = file.originalname.split('.').pop();
  const key = `resumes/${userId}/${applicationId}-${Date.now()}.${ext}`;

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    },
  });

  await upload.done();
  return `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com/${key}`;
}

async function deleteResume(resumeUrl) {
  const key = resumeUrl.split('.digitaloceanspaces.com/')[1];
  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: key,
  }));
}

module.exports = { uploadResume, deleteResume };