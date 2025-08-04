// src/lib/bunny.ts

import crypto from 'crypto';

interface BunnyVideoOptions {
  expirationTime?: number;
  userIp?: string;
  userId?: string;
  preventDownload?: boolean;
}

/**
 * Enhanced Bunny.net service with improved security
 */
class BunnyVideoService {
  private apiKey: string;
  private securityKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.BUNNY_API_KEY || '';
    this.securityKey = process.env.BUNNY_SECURITY_KEY || this.apiKey;
    this.baseUrl = process.env.BUNNY_CDN_HOSTNAME || 'b-cdn.net';
  }

  /**
   * Generates a secure, signed URL for a Bunny.net video with enhanced security
   */
  generateSecureUrl(
    libraryId: string,
    videoId: string,
    options: BunnyVideoOptions = {}
  ): string {
    const {
      expirationTime = 3600, // 1 hour default
      userIp,
      userId,
      preventDownload = true
    } = options;

    if (!libraryId || !this.apiKey) {
      console.error("Bunny.net credentials or libraryId are not set correctly");
      return ""; // Return empty string to prevent video loading
    }

    const expires = Math.floor(Date.now() / 1000) + expirationTime;
    const videoPath = `/${libraryId}/${videoId}`;
    
    // Create signature string with additional security parameters
    let signatureData = `${videoPath}${expires}`;
    
    // Add IP restriction if provided
    if (userIp) {
      signatureData += userIp;
    }
    
    // Add user ID for additional security
    if (userId) {
      signatureData += userId;
    }

    // Generate secure hash
    const hash = crypto
      .createHmac('sha256', this.securityKey)
      .update(signatureData)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Build secure URL with anti-download measures
    const baseVideoUrl = `https://vz-${libraryId}.${this.baseUrl}${videoPath}/playlist.m3u8`;
    const params = new URLSearchParams({
      token: hash,
      expires: expires.toString(),
    });

    // Add IP restriction parameter
    if (userIp) {
      params.append('ip', userIp);
    }

    // Add download prevention parameters
    if (preventDownload) {
      params.append('dl', '0'); // Disable download
      params.append('stream', '1'); // Force streaming only
    }

    return `${baseVideoUrl}?${params.toString()}`;
  }

  /**
   * Verify if a video URL is still valid
   */
  isUrlValid(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const expires = urlObj.searchParams.get('expires');
      
      if (!expires) return false;
      
      const expirationTime = parseInt(expires);
      const currentTime = Math.floor(Date.now() / 1000);
      
      return currentTime < expirationTime;
    } catch {
      return false;
    }
  }

  /**
   * Get video analytics from Bunny.net
   */
  async getVideoAnalytics(libraryId: string, videoId: string, dateFrom?: string, dateTo?: string) {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await fetch(
        `https://api.bunny.net/videolibrary/${libraryId}/videos/${videoId}/statistics?${params}`,
        {
          headers: {
            'AccessKey': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Bunny API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching video analytics:', error);
      return null;
    }
  }
}

// Create singleton instance
const bunnyService = new BunnyVideoService();

/**
 * Legacy function for backward compatibility
 * @deprecated Use bunnyService.generateSecureUrl instead
 */
export function getSignedBunnyUrl(
  libraryId: string,
  videoId: string,
  expirationTime: number = 3600
): string {
  return bunnyService.generateSecureUrl(libraryId, videoId, { expirationTime });
}

export { bunnyService };
export default bunnyService;