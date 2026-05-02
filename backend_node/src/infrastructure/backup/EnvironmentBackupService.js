const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

/**
 * Environment Variable Backup Service
 * 
 * Solusi otomatis untuk Railway data persistence:
 * - Auto-backup users.json ke Railway environment variables
 * - Auto-restore saat server startup
 * - Kompresi data untuk menghemat space
 * - Split data jika terlalu besar (32KB limit per env var)
 * 
 * Environment Variables yang digunakan:
 * - STELLAR_USERS_BACKUP_1, STELLAR_USERS_BACKUP_2, dst
 * - STELLAR_USERS_BACKUP_COUNT (jumlah chunks)
 * - STELLAR_USERS_BACKUP_TIMESTAMP (waktu backup terakhir)
 */
class EnvironmentBackupService {
  constructor() {
    this.MAX_ENV_SIZE = 30000; // 30KB (safety margin dari 32KB limit)
    this.BACKUP_PREFIX = 'STELLAR_USERS_BACKUP_';
    this.COUNT_KEY = 'STELLAR_USERS_BACKUP_COUNT';
    this.TIMESTAMP_KEY = 'STELLAR_USERS_BACKUP_TIMESTAMP';
  }

  /**
   * Backup users data ke environment variables
   * @param {Array} usersData - Array of user objects
   * @returns {Promise<boolean>} - Success status
   */
  async backup(usersData) {
    try {
      console.log('🔄 Starting Environment Variable backup...');
      
      // Convert to JSON dan compress
      const jsonData = JSON.stringify(usersData, null, 0); // No formatting untuk save space
      const compressedData = await gzip(jsonData);
      const base64Data = compressedData.toString('base64');
      
      console.log(`📊 Original size: ${jsonData.length} bytes`);
      console.log(`📦 Compressed size: ${base64Data.length} bytes`);
      
      // Split data jika terlalu besar
      const chunks = this.splitData(base64Data);
      console.log(`🔢 Split into ${chunks.length} chunks`);
      
      // Clear existing backup environment variables
      this.clearExistingBackup();
      
      // Set new backup chunks
      chunks.forEach((chunk, index) => {
        const envKey = `${this.BACKUP_PREFIX}${index + 1}`;
        process.env[envKey] = chunk;
        console.log(`✅ Set ${envKey} (${chunk.length} bytes)`);
      });
      
      // Set metadata
      process.env[this.COUNT_KEY] = chunks.length.toString();
      process.env[this.TIMESTAMP_KEY] = new Date().toISOString();
      
      console.log(`✅ Environment Variable backup completed successfully`);
      console.log(`📅 Backup timestamp: ${process.env[this.TIMESTAMP_KEY]}`);
      
      return true;
    } catch (error) {
      console.error('❌ Environment Variable backup failed:', error);
      return false;
    }
  }

  /**
   * Restore users data dari environment variables
   * @returns {Promise<Array|null>} - Restored users data atau null jika gagal
   */
  async restore() {
    try {
      console.log('🔄 Starting Environment Variable restore...');
      
      // Check if backup exists
      const chunkCount = parseInt(process.env[this.COUNT_KEY] || '0');
      if (chunkCount === 0) {
        console.log('📝 No Environment Variable backup found');
        return null;
      }
      
      console.log(`🔢 Found backup with ${chunkCount} chunks`);
      console.log(`📅 Backup timestamp: ${process.env[this.TIMESTAMP_KEY]}`);
      
      // Reconstruct data dari chunks
      let base64Data = '';
      for (let i = 1; i <= chunkCount; i++) {
        const envKey = `${this.BACKUP_PREFIX}${i}`;
        const chunk = process.env[envKey];
        
        if (!chunk) {
          throw new Error(`Missing backup chunk: ${envKey}`);
        }
        
        base64Data += chunk;
        console.log(`✅ Loaded ${envKey} (${chunk.length} bytes)`);
      }
      
      // Decompress data
      const compressedData = Buffer.from(base64Data, 'base64');
      const jsonData = await gunzip(compressedData);
      const usersData = JSON.parse(jsonData.toString());
      
      console.log(`✅ Environment Variable restore completed successfully`);
      console.log(`👥 Restored ${usersData.length} users`);
      
      return usersData;
    } catch (error) {
      console.error('❌ Environment Variable restore failed:', error);
      return null;
    }
  }

  /**
   * Split data menjadi chunks yang fit dalam environment variable limits
   * @param {string} data - Data to split
   * @returns {Array<string>} - Array of chunks
   */
  splitData(data) {
    const chunks = [];
    let offset = 0;
    
    while (offset < data.length) {
      const chunk = data.slice(offset, offset + this.MAX_ENV_SIZE);
      chunks.push(chunk);
      offset += this.MAX_ENV_SIZE;
    }
    
    return chunks;
  }

  /**
   * Clear existing backup environment variables
   */
  clearExistingBackup() {
    // Get current chunk count
    const currentCount = parseInt(process.env[this.COUNT_KEY] || '0');
    
    // Clear all existing chunks
    for (let i = 1; i <= currentCount + 5; i++) { // +5 safety margin
      const envKey = `${this.BACKUP_PREFIX}${i}`;
      delete process.env[envKey];
    }
    
    // Clear metadata
    delete process.env[this.COUNT_KEY];
    delete process.env[this.TIMESTAMP_KEY];
    
    console.log(`🧹 Cleared existing backup environment variables`);
  }

  /**
   * Get backup status dan info
   * @returns {Object} - Backup status info
   */
  getBackupStatus() {
    const chunkCount = parseInt(process.env[this.COUNT_KEY] || '0');
    const timestamp = process.env[this.TIMESTAMP_KEY];
    
    return {
      exists: chunkCount > 0,
      chunkCount,
      timestamp,
      age: timestamp ? Date.now() - new Date(timestamp).getTime() : null
    };
  }

  /**
   * Verify backup integrity
   * @returns {Promise<boolean>} - Integrity check result
   */
  async verifyBackup() {
    try {
      const restoredData = await this.restore();
      return restoredData !== null && Array.isArray(restoredData);
    } catch (error) {
      console.error('❌ Backup verification failed:', error);
      return false;
    }
  }
}

module.exports = new EnvironmentBackupService();