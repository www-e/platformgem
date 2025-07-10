// src/lib/bunny.ts

import crypto from 'crypto';

/**
 * Generates a secure, signed URL for a Bunny.net video.
 * This URL is temporary and prevents unauthorized access.
 *
 * @param libraryId The ID of the Bunny.net Video Library for this video.
 * @param videoId The ID of the video from your Bunny.net library.
 * @param expirationTime The number of seconds the URL should be valid for. Default is 3 hours.
 * @returns A secure URL with a token.
 */
export function getSignedBunnyUrl(
  libraryId: string, // CHANGED: Now passed as an argument
  videoId: string,
  expirationTime: number = 10800
): string {
  const apiKey = process.env.BUNNY_API_KEY; // Your API Key

  if (!libraryId || !apiKey) {
    console.error("Bunny.net credentials or libraryId are not set correctly");
    return "https://vz-a.b-cdn.net/a/a/a/a.m3u8"; // A non-functional placeholder
  }

  const baseUrl = `https://videos.bunny.net/hls/${libraryId}/${videoId}.m3u8`;
  const expires = Math.floor(Date.now() / 1000) + expirationTime;
  const signaturePath = `/${libraryId}/${videoId}`;
  const stringToSign = `${signaturePath}${expires}`;

  const hash = crypto
    .createHmac('sha256', apiKey)
    .update(stringToSign)
    .digest('base64');

  const token = hash
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
    
  const secureUrl = `${baseUrl}?token=${token}&expires=${expires}`;

  return secureUrl;
}