import type { APIRoute } from 'astro';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: import.meta.env.CLOUDFLARE_R2_ENDPOINT!,
  credentials: {
    accessKeyId: import.meta.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: import.meta.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const file = data.get('image');

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'No image file provided' }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Compress and optimize image using sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}.webp`;

    // Upload to Cloudflare R2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: import.meta.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: fileName,
        Body: optimizedBuffer,
        ContentType: 'image/webp',
      })
    );

    const publicBase = import.meta.env.CLOUDFLARE_R2_PUBLIC_URL!;
    const publicUrl = `${publicBase}/${fileName}`;

    return new Response(JSON.stringify({ url: publicUrl }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in upload API:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
