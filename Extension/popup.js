// DOM Elements
const loginView = document.getElementById('loginView');
const todosView = document.getElementById('todosView');
const recipientsView = document.getElementById('recipientsView');

// const logoutBtn = document.getElementById('logoutBtn');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const loginAlert = document.getElementById('loginAlert');

const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const changeRecipientsBtn = document.getElementById('changeRecipientsBtn');
const logoutBtn = document.getElementById('logoutBtn');
const todosAlert = document.getElementById('todosAlert');

const toEmailInput = document.getElementById('toEmail');
const ccEmailInput = document.getElementById('ccEmail');
const bccEmailInput = document.getElementById('bccEmail');
const saveRecipientsBtn = document.getElementById('saveRecipientsBtn');
const backToTodosBtn = document.getElementById('backToTodosBtn');
const recipientsAlert = document.getElementById('recipientsAlert');

let tasks = [];

// Utility: Switch active view
function showView(view) {
  [loginView, todosView, recipientsView].forEach(v => v.classList.remove('active'));
  view.classList.add('active');
  clearAlerts();
}

// Clear all alerts
function clearAlerts() {
  loginAlert.hidden = true;
  loginAlert.textContent = '';
  todosAlert.hidden = true;
  todosAlert.textContent = '';
  recipientsAlert.hidden = true;
  recipientsAlert.textContent = '';
}

// Show alert on specific container
function showAlert(container, message) {
  container.textContent = message;
  container.hidden = false;
}

// Load user session state (simplified)
function loadSession() {
  chrome.storage.local.get(['isLoggedIn'], data => {
    if (data.isLoggedIn) {
      loadTasks();
      loadRecipients();
      showView(todosView);
    } else {
      showView(loginView);
    }
  });
}

// Login button handler
loginBtn.addEventListener('click', () => {
  clearAlerts();
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email) {
    showAlert(loginAlert, 'Email is required.');
    return;
  }
  if (!password) {
    showAlert(loginAlert, 'Password is required.');
    return;
  }

  // For demo: store login state, no real auth
  chrome.storage.local.set({ isLoggedIn: true, email }, () => {
    loadTasks();
    loadRecipients();
    showView(todosView);
  });
});

// Logout button handler
logoutBtn.addEventListener('click', () => {
  chrome.storage.local.set({ isLoggedIn: false }, () => {
    tasks = [];
    taskList.innerHTML = '';
    showView(loginView);
  });
});

// Task input handler
taskInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    addTask();
  }
});

// Add task
function addTask() {
  clearAlerts();
  const task = taskInput.value.trim();
  if (!task) {
    showAlert(todosAlert, 'Please enter a task.');
    return;
  }
  tasks.push(task);
  taskInput.value = '';
  saveTasks();
  renderTasks();
}

// Render task list
function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, idx) => {
    const li = document.createElement('li');
    li.textContent = task;

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.className = 'deleteBtn';
    delBtn.title = 'Delete task';
    delBtn.addEventListener('click', () => {
      tasks.splice(idx, 1);
      saveTasks();
      renderTasks();
    });

    li.appendChild(delBtn);
    taskList.appendChild(li);
  });
}

// Save tasks to chrome storage
function saveTasks() {
  chrome.storage.local.set({ tasks });
}

// Load tasks from chrome storage
function loadTasks() {
  chrome.storage.local.get(['tasks'], data => {
    tasks = data.tasks || [];
    renderTasks();
  });
}

// Recipients view handlers
changeRecipientsBtn.addEventListener('click', () => {
  loadRecipients();
  showView(recipientsView);
});

backToTodosBtn.addEventListener('click', () => {
  showView(todosView);
});

saveRecipientsBtn.addEventListener('click', () => {
  clearAlerts();
  const toEmail = toEmailInput.value.trim();
  if (!toEmail) {
    showAlert(recipientsAlert, 'To Email is required.');
    return;
  }
  chrome.storage.local.set({
    toEmail,
    ccEmail: ccEmailInput.value.trim(),
    bccEmail: bccEmailInput.value.trim(),
  }, () => {
    showAlert(recipientsAlert, 'Recipients saved successfully.');
  });
});

// Load recipients from chrome storage
function loadRecipients() {
  chrome.storage.local.get(['toEmail', 'ccEmail', 'bccEmail'], data => {
    toEmailInput.value = data.toEmail || '';
    ccEmailInput.value = data.ccEmail || '';
    bccEmailInput.value = data.bccEmail || '';
  });
}

// Initialize on popup open
document.addEventListener('DOMContentLoaded', loadSession);
const sendEmailBtn = document.getElementById('sendEmailBtn');

sendEmailBtn.addEventListener('click', async () => {
  console.log("Button is clicked");
  
  clearAlerts();

  if (tasks.length === 0) {
    showAlert(todosAlert, 'No tasks to send.');
    return;
  }

  // Get recipient and sender info from storage
  chrome.storage.local.get(['senderEmail', 'appPassword', 'toEmail', 'ccEmail', 'bccEmail'], async (data) => {
    const {
      senderEmail,
      appPassword,
      toEmail,
      ccEmail = '',
      bccEmail = ''
    } = data;

     // Log values fetched from chrome.storage
    console.log("Fetched from storage:");
    console.log("senderEmail:", senderEmail);
    console.log("appPassword:", appPassword);
    console.log("toEmail:", toEmail);
    console.log("ccEmail:", ccEmail);
    console.log("bccEmail:", bccEmail);


    if (!senderEmail || !appPassword || !toEmail) {
      showAlert(todosAlert, 'Sender email, app password, and To email must be set.');
      return;
    }

    // Prepare payload
    const payload = {
      todos: tasks,
      sendEmail: true,
      senderEmail,
      smtpPass: appPassword,
      to: toEmail,
      cc: ccEmail,
      bcc: bccEmail
    };

    try {
      todosAlert.textContent = 'Sending email...';
      todosAlert.hidden = false;
      console.log(payload.smtpPass);
      

      const response = await fetch('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showAlert(todosAlert, 'Email sent successfully!');
      } else {
        const errText = await response.text();
        showAlert(todosAlert, `Failed to send email: ${errText}`);
      }
    } catch (error) {
      showAlert(todosAlert, `Error sending email: ${error.message}`);
    }
  });
});

logoutBtn.addEventListener('click', () => {
  console.log("🔘 Logout button clicked");

   chrome.storage.local.remove(['senderEmail', 'appPassword', 'isLoggedIn'], () => {
    console.log("✅ Credentials and login status removed from local storage");


    // Redirect to login
    window.location.href = 'login.html';
  });
});
