// Simple encryption/decryption utility (bcrypt-like functionality)
// Note: This is a simplified version for demo purposes
// In production, use proper bcrypt library

class CryptoUtils {
  static async hashPassword(password) {
    // Simple hash function - in production use proper bcrypt
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  static async verifyPassword(password, hashedPassword) {
    const hash = await this.hashPassword(password);
    return hash === hashedPassword;
  }

  // Simple encryption for storing in localStorage
  static encrypt(text, key = 'pingup-secret-key') {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    // Simple XOR encryption
    const keyData = encoder.encode(key);
    const encrypted = new Uint8Array(data.length);
    
    for (let i = 0; i < data.length; i++) {
      encrypted[i] = data[i] ^ keyData[i % keyData.length];
    }
    
    return btoa(String.fromCharCode(...encrypted));
  }

  static decrypt(encryptedText, key = 'pingup-secret-key') {
    try {
      const decoder = new TextDecoder();
      const encrypted = new Uint8Array(atob(encryptedText).split('').map(c => c.charCodeAt(0)));
      const keyData = new TextEncoder().encode(key);
      const decrypted = new Uint8Array(encrypted.length);
      
      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keyData[i % keyData.length];
      }
      
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }
}

export default CryptoUtils; 