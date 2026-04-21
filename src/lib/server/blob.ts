import { Buffer } from 'node:buffer';
import { put } from '@vercel/blob';
import { getBlobReadWriteToken } from './env.js';

export type PutBlobOptions = {
	filename: string;
	contentType: string;
	access?: 'public';
};

export async function uploadPublicBlob(body: ArrayBuffer | Uint8Array, opts: PutBlobOptions) {
	const token = getBlobReadWriteToken();
	const buf = Buffer.isBuffer(body)
		? body
		: body instanceof ArrayBuffer
			? Buffer.from(body)
			: Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	return put(opts.filename, buf, {
		access: 'public',
		token,
		contentType: opts.contentType
	});
}
