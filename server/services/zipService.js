import archiver from 'archiver';
import { Readable } from 'stream';

export async function createZipArchive(buffer, filename) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const buffers = [];

    archive.on('data', (data) => buffers.push(data));
    archive.on('end', () => resolve(Buffer.concat(buffers)));
    archive.on('error', (err) => reject(err));

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    archive.append(stream, { name: filename });
    archive.finalize();
  });
}
