import CryptoUtils from './crypto.js';

class StorageManager {
  static async saveCredentials(email, password) {
    const hashedPassword = await CryptoUtils.hashPassword(password);
    const encryptedPassword = CryptoUtils.encrypt(password);
    
    return new Promise((resolve) => {
      chrome.storage.local.set({
        email,
        hashedPassword,
        encryptedPassword,
        isAuthenticated: true,
        lastLogin: Date.now()
      }, resolve);
    });
  }

  static async verifyCredentials(email, password) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['email', 'hashedPassword'], async (data) => {
        if (data.email === email && data.hashedPassword) {
          const isValid = await CryptoUtils.verifyPassword(password, data.hashedPassword);
          resolve(isValid);
        } else {
          resolve(false);
        }
      });
    });
  }

  static getDecryptedPassword() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['encryptedPassword'], (data) => {
        if (data.encryptedPassword) {
          const decrypted = CryptoUtils.decrypt(data.encryptedPassword);
          resolve(decrypted);
        } else {
          resolve(null);
        }
      });
    });
  }

  static saveTodos(todos) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ todos }, resolve);
    });
  }

  static getTodos() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['todos'], (data) => {
        resolve(data.todos || []);
      });
    });
  }

  static saveEmailSettings(settings) {
    return new Promise((resolve) => {
      chrome.storage.local.set(settings, resolve);
    });
  }

  static getEmailSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['toEmail', 'ccEmail', 'bccEmail', 'autoSendEnabled'], (data) => {
        resolve({
          toEmail: data.toEmail || '',
          ccEmail: data.ccEmail || '',
          bccEmail: data.bccEmail || '',
          autoSendEnabled: data.autoSendEnabled || false
        });
      });
    });
  }

  static saveEmailContext(context) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ emailContext: context }, resolve);
    });
  }

  static getEmailContext() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['emailContext'], (data) => {
        resolve(data.emailContext || '');
      });
    });
  }

  static clearExpiredTodos() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['todos'], (data) => {
        const todos = data.todos || [];
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        const validTodos = todos.filter(todo => {
          return (now - todo.createdAt) < oneDayMs;
        });
        
        chrome.storage.local.set({ todos: validTodos }, resolve);
      });
    });
  }

  static logout() {
    return new Promise((resolve) => {
      chrome.storage.local.remove([
        'email', 
        'hashedPassword', 
        'encryptedPassword', 
        'isAuthenticated',
        'todos'
      ], resolve);
    });
  }

  static isAuthenticated() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['isAuthenticated'], (data) => {
        resolve(data.isAuthenticated || false);
      });
    });
  }
}

export default StorageManager; 