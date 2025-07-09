// src/lib/bunny.ts

import crypto from 'crypto';

/**
 * Generates a secure, signed URL for a Bunny.net video.
 * This URL is temporary and prevents unauthorized access.
 *
 * @param videoId The ID of the video from your Bunny.net library.
 * @param expirationTime The number of seconds the URL should be valid for. Default is 3 hours.
 * @returns A secure URL with a token.
 */
export function getSignedBunnyUrl(videoId: string, expirationTime: number = 10800): string {
  const libraryId = process.env.BUNNY_LIBRARY_ID; // Your Video Library ID
  const apiKey = process.env.BUNNY_API_KEY; // Your API Key

  if (!libraryId || !apiKey) {
    console.error("Bunny.net credentials are not set in .env file");
    // Return a placeholder or throw an error. For production, throwing an error is better.
    return "https://vz-a.b-cdn.net/a/a/a/a.m3u8"; // A non-functional placeholder
  }

  // The base URL for your video library
  const baseUrl = `https://videos.bunny.net/hls/${libraryId}/${videoId}.m3u8`;

  // The expiration timestamp in Unix format
  const expires = Math.floor(Date.now() / 1000) + expirationTime;

  // The string to be hashed
  const signaturePath = `/${libraryId}/${videoId}`;
  const stringToSign = `${signaturePath}${expires}`;

  // Create the HMAC-SHA256 hash
  const hash = crypto
    .createHmac('sha256', apiKey)
    .update(stringToSign)
    .digest('base64');

  // URL-safe encoding for the hash
  const token = hash
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Construct the final secure URL
  const secureUrl = `${baseUrl}?token=${token}&expires=${expires}`;

  return secureUrl;
}