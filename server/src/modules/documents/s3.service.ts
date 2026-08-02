import { randomUUID } from 'node:crypto';
import path from 'node:path';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { ServerEnv } from '../../config/env.js';

export class S3ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'S3ServiceError';
  }
}

const PRESIGN_UPLOAD_EXPIRY_SECONDS = 300;
const PRESIGN_DOWNLOAD_EXPIRY_SECONDS = 300;

const createS3Client = (env: ServerEnv): S3Client => {
  const config: ConstructorParameters<typeof S3Client>[0] = {
    region: env.s3Region,
    credentials: {
      accessKeyId: env.s3AccessKeyId,
      secretAccessKey: env.s3SecretAccessKey,
    },
  };

  if (env.s3Endpoint) {
    config.endpoint = env.s3Endpoint;
    config.forcePathStyle = env.s3ForcePathStyle;
  }

  return new S3Client(config);
};

export const assertS3Configured = (env: ServerEnv): void => {
  if (!env.s3Bucket || !env.s3AccessKeyId || !env.s3SecretAccessKey) {
    throw new S3ServiceError(
      'Document storage is not configured (S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY)',
      503
    );
  }
};

const sanitizeFileName = (fileName: string): string => {
  const base = path.basename(fileName).replace(/[^\w.\-() ]+/g, '_').trim();
  return base.length > 0 ? base.slice(0, 200) : 'document';
};

export const buildDocumentFileKey = (tenantId: string, fileName: string): string => {
  const safeName = sanitizeFileName(fileName);
  return `${tenantId}/documents/${randomUUID()}/${safeName}`;
};

export const buildExpenseFileKey = (tenantId: string, fileName: string): string => {
  const safeName = sanitizeFileName(fileName);
  return `${tenantId}/expenses/${randomUUID()}/${safeName}`;
};

export const createPresignedUploadUrl = async (
  env: ServerEnv,
  fileKey: string,
  mimeType: string
): Promise<string> => {
  assertS3Configured(env);

  const client = createS3Client(env);
  const command = new PutObjectCommand({
    Bucket: env.s3Bucket,
    Key: fileKey,
    ContentType: mimeType,
  });

  return getSignedUrl(client, command, { expiresIn: PRESIGN_UPLOAD_EXPIRY_SECONDS });
};

export const createPresignedDownloadUrl = async (
  env: ServerEnv,
  fileKey: string,
  fileName: string
): Promise<string> => {
  assertS3Configured(env);

  const client = createS3Client(env);
  const getCommand = new GetObjectCommand({
    Bucket: env.s3Bucket,
    Key: fileKey,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(fileName)}"`,
  });

  return getSignedUrl(client, getCommand, { expiresIn: PRESIGN_DOWNLOAD_EXPIRY_SECONDS });
};

export const verifyObjectExists = async (env: ServerEnv, fileKey: string): Promise<boolean> => {
  assertS3Configured(env);

  const client = createS3Client(env);

  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: env.s3Bucket,
        Key: fileKey,
      })
    );
    return true;
  } catch {
    return false;
  }
};

export const deleteObject = async (env: ServerEnv, fileKey: string): Promise<void> => {
  assertS3Configured(env);

  const client = createS3Client(env);
  await client.send(
    new DeleteObjectCommand({
      Bucket: env.s3Bucket,
      Key: fileKey,
    })
  );
};
