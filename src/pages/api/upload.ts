import type { APIRoute } from 'astro';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
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
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: fileName,
        Body: optimizedBuffer,
        ContentType: 'image/webp',
      })
    );

    // Construct the public URL (assuming bucket is public or mapped to a custom domain)
    // For local dev without R2 setup, this will just return a simulated URL if credentials aren't set
    // But since it's a real implementation, we assume a public URL structure
    const publicUrl = `${process.env.CLOUDFLARE_R2_ENDPOINT}/${process.env.CLOUDFLARE_R2_BUCKET_NAME}/${fileName}`;

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
