import StorageManager from '../utils/storage.js';

class PingUpApp {
  constructor() {
    this.todos = [];
    this.currentTab = 'todos';
    this.initializeElements();
    this.bindEvents();
    this.loadInitialState();
  }

  initializeElements() {
    // Views
    this.authView = document.getElementById('authView');
    this.appView = document.getElementById('appView');
    
    // Auth elements
    this.authEmail = document.getElementById('authEmail');
    this.authPassword = document.getElementById('authPassword');
    this.loginBtn = document.getElementById('loginBtn');
    this.loginBtnText = document.getElementById('loginBtnText');
    this.loginBtnLoading = document.getElementById('loginBtnLoading');
    this.authAlert = document.getElementById('authAlert');
    
    // Tab elements
    this.navTabs = document.querySelectorAll('.nav-tab');
    this.tabContents = document.querySelectorAll('.tab-content');
    
    // Todo elements
    this.todoTitle = document.getElementById('todoTitle');
    this.todoDescription = document.getElementById('todoDescription');
    this.addTodoBtn = document.getElementById('addTodoBtn');
    this.todoList = document.getElementById('todoList');
    this.autoSendToggle = document.getElementById('autoSendToggle');
    this.sendEmailBtn = document.getElementById('sendEmailBtn');
    this.logoutBtn = document.getElementById('logoutBtn');
    
    // Credentials elements
    this.toEmail = document.getElementById('toEmail');
    this.ccEmail = document.getElementById('ccEmail');
    this.bccEmail = document.getElementById('bccEmail');
    this.saveCredentialsBtn = document.getElementById('saveCredentialsBtn');
    this.credentialsAlert = document.getElementById('credentialsAlert');
    
    // Context elements
    this.emailContext = document.getElementById('emailContext');
    this.saveContextBtn = document.getElementById('saveContextBtn');
    this.generatePreviewBtn = document.getElementById('generatePreviewBtn');
    this.emailPreview = document.getElementById('emailPreview');
    this.emailContent = document.getElementById('emailContent');
    this.contextAlert = document.getElementById('contextAlert');
  }

  bindEvents() {
    // Auth events
    this.loginBtn.addEventListener('click', () => this.handleLogin());
    this.authPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleLogin();
    });
    
    // Tab navigation
    this.navTabs.forEach(tab => {
      tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });
    
    // Todo events
    this.addTodoBtn.addEventListener('click', () => this.addTodo());
    this.todoTitle.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTodo();
    });
    this.autoSendToggle.addEventListener('change', () => this.toggleAutoSend());
    this.sendEmailBtn.addEventListener('click', () => this.sendEmail());
    this.logoutBtn.addEventListener('click', () => this.handleLogout());
    
    // Credentials events
    this.saveCredentialsBtn.addEventListener('click', () => this.saveCredentials());
    
    // Context events
    this.saveContextBtn.addEventListener('click', () => this.saveContext());
    this.generatePreviewBtn.addEventListener('click', () => this.generatePreview());
    
    // Auto-save context when user types
    this.emailContext.addEventListener('input', () => this.autoSaveContext());
  }

  async loadInitialState() {
    const isAuthenticated = await StorageManager.isAuthenticated();
    if (isAuthenticated) {
      this.showAppView();
      await this.loadTodos();
      await this.loadCredentials();
      await this.loadContext();
      await this.loadAutoSendSetting();
    } else {
      this.showAuthView();
    }
  }

  showAuthView() {
    this.authView.classList.add('active');
    this.appView.classList.remove('active');
  }

  showAppView() {
    this.authView.classList.remove('active');
    this.appView.classList.add('active');
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    
    // Update tab buttons
    this.navTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update tab content
    this.tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
  }

  showAlert(element, message, type = 'error') {
    element.textContent = message;
    element.className = `alert alert-${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
      element.style.display = 'none';
    }, 5000);
  }

  async handleLogin() {
    const email = this.authEmail.value.trim();
    const password = this.authPassword.value.trim();
    
    if (!email || !password) {
      this.showAlert(this.authAlert, 'Please enter both email and password.');
      return;
    }
    
    if (password.length !== 16) {
      this.showAlert(this.authAlert, 'App password must be exactly 16 characters.');
      return;
    }
    
    this.setLoginLoading(true);
    
    try {
      await StorageManager.saveCredentials(email, password);
      this.showAppView();
      await this.loadTodos();
      await this.loadCredentials();
      await this.loadContext();
      await this.loadAutoSendSetting();
    } catch (error) {
      this.showAlert(this.authAlert, 'Login failed. Please try again.');
    } finally {
      this.setLoginLoading(false);
    }
  }

  setLoginLoading(loading) {
    this.loginBtnText.style.display = loading ? 'none' : 'inline';
    this.loginBtnLoading.style.display = loading ? 'inline-block' : 'none';
    this.loginBtn.disabled = loading;
  }

  async handleLogout() {
    await StorageManager.logout();
    this.todos = [];
    this.showAuthView();
    this.authEmail.value = '';
    this.authPassword.value = '';
  }

  async addTodo() {
    const title = this.todoTitle.value.trim();
    const description = this.todoDescription.value.trim();
    
    if (!title) {
      this.showAlert(this.contextAlert, 'Please enter a task title.');
      return;
    }
    
    const todo = {
      id: Date.now(),
      title,
      description,
      completed: false,
      createdAt: Date.now()
    };
    
    this.todos.push(todo);
    await StorageManager.saveTodos(this.todos);
    this.renderTodos();
    
    this.todoTitle.value = '';
    this.todoDescription.value = '';
    this.todoTitle.focus();
  }

  async toggleTodoComplete(todoId) {
    const todo = this.todos.find(t => t.id === todoId);
    if (todo) {
      todo.completed = !todo.completed;
      await StorageManager.saveTodos(this.todos);
      this.renderTodos();
    }
  }

  async deleteTodo(todoId) {
    const todo = this.todos.find(t => t.id === todoId);
    if (!todo) return;
    
    // Remove from array
    this.todos = this.todos.filter(t => t.id !== todoId);
    await StorageManager.saveTodos(this.todos);
    this.renderTodos();
  }

  renderTodos() {
    this.todoList.innerHTML = '';
    
    if (this.todos.length === 0) {
      this.todoList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">No tasks yet. Add your first task above!</p>';
      return;
    }
    
    this.todos.forEach(todo => {
      const todoElement = document.createElement('div');
      todoElement.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      todoElement.setAttribute('data-todo-id', todo.id);
      
      const timeAgo = this.getTimeAgo(todo.createdAt);
      
      todoElement.innerHTML = `
        <div class="todo-header">
          <div class="todo-title">
            <label class="checkbox-container">
              <input type="checkbox" id="checkbox-${todo.id}" ${todo.completed ? 'checked' : ''}>
              <span class="checkmark"></span>
              ${todo.title}
            </label>
          </div>
          <div class="todo-actions">
            <button class="btn btn-sm btn-danger" id="delete-${todo.id}">
              🗑️ Delete
            </button>
          </div>
        </div>
        ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
        <div class="todo-meta">
          <span>Created ${timeAgo}</span>
          ${todo.completed ? '<span style="color: var(--success-color);">✓ Completed</span>' : ''}
        </div>
      `;
      
      this.todoList.appendChild(todoElement);
      
      // Add event listeners after creating the element
      const checkbox = todoElement.querySelector(`#checkbox-${todo.id}`);
      const deleteBtn = todoElement.querySelector(`#delete-${todo.id}`);
      
      checkbox.addEventListener('change', () => this.toggleTodoComplete(todo.id));
      deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
    });
  }

  getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  async loadTodos() {
    this.todos = await StorageManager.getTodos();
    await StorageManager.clearExpiredTodos();
    this.renderTodos();
  }

  async saveCredentials() {
    const toEmail = this.toEmail.value.trim();
    const ccEmail = this.ccEmail.value.trim();
    const bccEmail = this.bccEmail.value.trim();
    
    if (!toEmail) {
      this.showAlert(this.credentialsAlert, 'To Email is required.');
      return;
    }
    
    await StorageManager.saveEmailSettings({
      toEmail,
      ccEmail,
      bccEmail
    });
    
    this.showAlert(this.credentialsAlert, 'Recipients saved successfully!', 'success');
  }

  async loadCredentials() {
    const settings = await StorageManager.getEmailSettings();
    this.toEmail.value = settings.toEmail;
    this.ccEmail.value = settings.ccEmail;
    this.bccEmail.value = settings.bccEmail;
    this.autoSendToggle.checked = settings.autoSendEnabled;
  }

  async saveContext() {
    const context = this.emailContext.value.trim();
    if (!context) {
      this.showAlert(this.contextAlert, 'Please enter some context before saving.');
      return;
    }
    
    await StorageManager.saveEmailContext(context);
    this.showAlert(this.contextAlert, 'Email context saved successfully!', 'success');
    
    // Clear the timeout to avoid double saving
    clearTimeout(this.contextSaveTimeout);
  }

  async loadContext() {
    const context = await StorageManager.getEmailContext();
    if (context) {
      this.emailContext.value = context;
    }
  }

  async loadAutoSendSetting() {
    const settings = await StorageManager.getEmailSettings();
    this.autoSendToggle.checked = settings.autoSendEnabled;
  }

  async toggleAutoSend() {
    const enabled = this.autoSendToggle.checked;
    await StorageManager.saveEmailSettings({ autoSendEnabled: enabled });
    
    if (enabled) {
      chrome.alarms.create("dailyReminder", {
        when: this.getNext6PM(),
        periodInMinutes: 1440,
      });
    } else {
      chrome.alarms.clear("dailyReminder");
    }
  }

  getNext6PM() {
    const now = new Date();
    const target = new Date();
    target.setHours(18, 0, 0, 0);
    if (now > target) target.setDate(target.getDate() + 1);
    return target.getTime();
  }

  async generatePreview() {
    if (this.todos.length === 0) {
      this.showAlert(this.contextAlert, 'No tasks to generate preview for.');
      return;
    }
    
    const context = this.emailContext.value.trim();
    if (!context) {
      this.showAlert(this.contextAlert, 'Please enter email context first.');
      return;
    }
    
    // Save the current context before generating preview
    await StorageManager.saveEmailContext(context);
    
    this.generatePreviewBtn.disabled = true;
    this.generatePreviewBtn.innerHTML = '<span class="loading"></span> Generating...';
    
    try {
      // Separate incomplete and completed todos
      const incompleteTodos = this.todos.filter(todo => !todo.completed);
      const completedTodos = this.todos.filter(todo => todo.completed);
      
      // Format todos for email
      const incompleteTodoTexts = incompleteTodos.map(todo => `${todo.title}${todo.description ? `: ${todo.description}` : ''}`);
      const completedTodoTexts = completedTodos.map(todo => `✓ ${todo.title}${todo.description ? `: ${todo.description}` : ''}`);
      
      // Combine all todos for email
      const allTodoTexts = [...incompleteTodoTexts, ...completedTodoTexts];
      const context = this.emailContext.value.trim();
      
      // Don't send email if no todos at all
      if (!allTodoTexts.length) {
        this.showAlert(this.contextAlert, 'No tasks to send.');
        return;
      }
      
      const response = await fetch('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          todos: allTodoTexts,
          sendEmail: false,
          context: context
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        this.emailContent.textContent = data.result;
        this.emailPreview.style.display = 'block';
        this.showAlert(this.contextAlert, 'Preview generated successfully!', 'success');
      } else {
        throw new Error('Failed to generate preview');
      }
    } catch (error) {
      this.showAlert(this.contextAlert, 'Failed to generate preview. Please try again.');
    } finally {
      this.generatePreviewBtn.disabled = false;
      this.generatePreviewBtn.textContent = 'Generate Preview';
    }
  }

  async sendEmail() {
    if (this.todos.length === 0) {
      this.showAlert(this.contextAlert, 'No tasks to send.');
      return;
    }
    
    const settings = await StorageManager.getEmailSettings();
    if (!settings.toEmail) {
      this.showAlert(this.contextAlert, 'Please configure recipients first.');
      return;
    }
    
    // Get sender email from storage
    const authData = await new Promise((resolve) => {
      chrome.storage.local.get(['email'], resolve);
    });
    
    if (!authData.email) {
      this.showAlert(this.contextAlert, 'Authentication error. Please login again.');
      return;
    }
    
    const decryptedPassword = await StorageManager.getDecryptedPassword();
    if (!decryptedPassword) {
      this.showAlert(this.contextAlert, 'Authentication error. Please login again.');
      return;
    }
    
    // Store original button content and styles
    const originalContent = this.sendEmailBtn.innerHTML;
    const originalBackground = this.sendEmailBtn.style.background;
    const originalColor = this.sendEmailBtn.style.color;
    
    // Show loading state with animation
    this.sendEmailBtn.disabled = true;
    this.sendEmailBtn.innerHTML = '<span class="loading"></span> Sending...';
    this.sendEmailBtn.style.background = 'var(--accent)';
    this.sendEmailBtn.style.transform = 'scale(0.95)';
    this.sendEmailBtn.style.transition = 'all 0.3s ease';
    
    // Add pulse animation
    this.sendEmailBtn.style.animation = 'pulse 1.5s infinite';
    
    try {
      // Separate incomplete and completed todos
      const incompleteTodos = this.todos.filter(todo => !todo.completed);
      const completedTodos = this.todos.filter(todo => todo.completed);
      
      // Format todos for email
      const incompleteTodoTexts = incompleteTodos.map(todo => `${todo.title}${todo.description ? `: ${todo.description}` : ''}`);
      const completedTodoTexts = completedTodos.map(todo => `✓ ${todo.title}${todo.description ? `: ${todo.description}` : ''}`);
      
      // Combine all todos for email
      const allTodoTexts = [...incompleteTodoTexts, ...completedTodoTexts];
      const context = this.emailContext.value.trim();
      
      // Don't send email if no todos at all
      if (!allTodoTexts.length) {
        this.showAlert(this.contextAlert, 'No tasks to send.');
        return;
      }
      
      const response = await fetch('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          todos: allTodoTexts,
          sendEmail: true,
          senderEmail: authData.email,
          smtpPass: decryptedPassword,
          to: settings.toEmail,
          cc: settings.ccEmail,
          bcc: settings.bccEmail,
          context: context
        }),
      });
      
      if (response.ok) {
        // Stop pulse animation
        this.sendEmailBtn.style.animation = '';
        
        // Show success state with animation
        this.sendEmailBtn.innerHTML = '✓ Sent!';
        this.sendEmailBtn.style.background = 'var(--success-color)';
        this.sendEmailBtn.style.color = 'white';
        this.sendEmailBtn.style.transform = 'scale(1.05)';
        
        // Add success animation
        this.sendEmailBtn.style.animation = 'successBounce 0.6s ease-out';
        
        // Show success message
        this.showAlert(this.contextAlert, 'Email sent successfully!', 'success');
        
        // Clear all todos after successful send (both completed and incomplete)
        this.todos = [];
        await StorageManager.saveTodos(this.todos);
        this.renderTodos();
        
        // Show email sent animation
        this.showEmailSentAnimation();
        
        // Reset button after 3 seconds
        setTimeout(() => {
          this.sendEmailBtn.disabled = false;
          this.sendEmailBtn.innerHTML = originalContent;
          this.sendEmailBtn.style.background = originalBackground;
          this.sendEmailBtn.style.color = originalColor;
          this.sendEmailBtn.style.transform = '';
          this.sendEmailBtn.style.animation = '';
        }, 3000);
        
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error) {
      // Stop pulse animation
      this.sendEmailBtn.style.animation = '';
      
      // Show error state with animation
      this.sendEmailBtn.innerHTML = '✗ Failed';
      this.sendEmailBtn.style.background = 'var(--error-color)';
      this.sendEmailBtn.style.color = 'white';
      this.sendEmailBtn.style.transform = 'scale(0.95)';
      
      // Add error shake animation
      this.sendEmailBtn.style.animation = 'errorShake 0.6s ease-out';
      
      this.showAlert(this.contextAlert, `Failed to send email: ${error.message}`);
      
      // Reset button after 3 seconds
      setTimeout(() => {
        this.sendEmailBtn.disabled = false;
        this.sendEmailBtn.innerHTML = originalContent;
        this.sendEmailBtn.style.background = originalBackground;
        this.sendEmailBtn.style.color = originalColor;
        this.sendEmailBtn.style.transform = '';
        this.sendEmailBtn.style.animation = '';
      }, 3000);
    }
  }

  showEmailSentAnimation() {
    // Create a floating success message with enhanced animation
    const successMessage = document.createElement('div');
    successMessage.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--success-color), #059669);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideInRight 0.5s ease-out, fadeOut 0.5s ease-in 2.5s forwards;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        border: 2px solid rgba(255,255,255,0.2);
      ">
        <span style="font-size: 20px; animation: bounce 1s infinite;">✓</span>
        <span>Email sent successfully!</span>
      </div>
    `;
    
    // Add enhanced animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
      }
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-3px); }
        60% { transform: translateY(-2px); }
      }
      @keyframes pulse {
        0% { transform: scale(0.95); }
        50% { transform: scale(1); }
        100% { transform: scale(0.95); }
      }
      @keyframes successBounce {
        0% { transform: scale(0.95); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1.05); }
      }
      @keyframes errorShake {
        0%, 100% { transform: translateX(0) scale(0.95); }
        25% { transform: translateX(-5px) scale(0.95); }
        75% { transform: translateX(5px) scale(0.95); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(successMessage);
    
    // Remove after animation
    setTimeout(() => {
      if (successMessage.parentNode) {
        successMessage.parentNode.removeChild(successMessage);
      }
    }, 3000);
  }

  async autoSaveContext() {
    // Debounce the auto-save to avoid too many saves
    clearTimeout(this.contextSaveTimeout);
    this.contextSaveTimeout = setTimeout(async () => {
      const context = this.emailContext.value.trim();
      if (context) {
        await StorageManager.saveEmailContext(context);
        console.log('Context auto-saved');
      }
    }, 1000); // Save after 1 second of no typing
  }
}

// Initialize app
const app = new PingUpApp();

// Make app globally available for onclick handlers
window.app = app; 