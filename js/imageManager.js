/**
 * @class ImageManager
 * @description Handles loading images from both local and remote sources,
 * ensuring proper normalization and managing client-side rendering.
 */
const sharp = require('sharp'); // For resizing images

class ImageManager {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} options.localPath - Base path for local images.
   * @param {boolean} options.normalize - Whether to normalize images.
   * @param {number} options.targetWidth - Target width for image resizing.
   * @param {number} options.targetHeight - Target height for image resizing.
   */
  constructor({ localPath = './images', normalize = false, targetWidth = 50, targetHeight = 50 } = {}) {
    this.localPath = localPath;
    this.normalize = normalize;
    this.targetWidth = targetWidth;
    this.targetHeight = targetHeight;
    this.remoteLoader = require('tech-stack-icons');
  }

  /**
   * Fetch an image, either local or remote.
   * @param {string} source - The image source path or identifier.
   * @param {boolean} isRemote - Whether the image should be fetched remotely.
   * @returns {Promise<string>} Resolves to the image URL.
   */
  async getImage(source, isRemote = false) {
    if (isRemote) {
      try {
        const remoteUrl = await this.remoteLoader.getIcon(source);
        return remoteUrl;
      } catch (error) {
        console.error(`Error fetching remote image: ${source}`, error);
        return null;
      }
    }
    return `${this.localPath}/${source}`;
  }

  /**
   * Normalize image size and type (if enabled).
   * @param {string} imageUrl - URL of the image to normalize.
   * @returns {Promise<string>} - Path to the resized image.
   */
  async normalizeImage(imageUrl) {
    if (!this.normalize) return imageUrl;

    try {
      const outputFilePath = `${imageUrl.split('.')[0]}_normalized.png`;
      await sharp(imageUrl)
        .resize(this.targetWidth, this.targetHeight)
        .png()
        .toFile(outputFilePath);
      return outputFilePath;
    } catch (error) {
      console.error('Error normalizing image:', error);
      return imageUrl;
    }
  }
}

module.exports = ImageManager;
