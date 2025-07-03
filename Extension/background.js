import StorageManager from './utils/storage.js';

chrome.runtime.onInstalled.addListener(async () => {
  // Clear any existing alarms
  await chrome.alarms.clearAll();
  
  // Check if auto-send is enabled
  const settings = await StorageManager.getEmailSettings();
  if (settings.autoSendEnabled) {
    chrome.alarms.create("dailyReminder", {
      when: getNext6PM(),
      periodInMinutes: 1440,
    });
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "dailyReminder") return;

  // Check if auto-send is still enabled
  const settings = await StorageManager.getEmailSettings();
  if (!settings.autoSendEnabled) return;

  // Get todos and credentials
  const todos = await StorageManager.getTodos();
  const decryptedPassword = await StorageManager.getDecryptedPassword();
  const context = await StorageManager.getEmailContext();
  
  // Get sender email from storage
  const authData = await new Promise((resolve) => {
    chrome.storage.local.get(['email'], resolve);
  });

  if (!todos.length || !decryptedPassword || !settings.toEmail || !authData.email) return;

  // Separate incomplete and completed todos
  const incompleteTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);
  
  // Format todos for email
  const incompleteTodoTexts = incompleteTodos.map(todo => `${todo.title}${todo.description ? `: ${todo.description}` : ''}`);
  const completedTodoTexts = completedTodos.map(todo => `✓ ${todo.title}${todo.description ? `: ${todo.description}` : ''}`);
  
  // Combine all todos for email
  const allTodoTexts = [...incompleteTodoTexts, ...completedTodoTexts];

  // Don't send email if no todos at all
  if (!allTodoTexts.length) return;

  // Prepare the JSON body
  const body = {
    todos: allTodoTexts,
    sendEmail: true,
    senderEmail: authData.email,
    smtpPass: decryptedPassword,
    to: settings.toEmail,
    cc: settings.ccEmail || "",
    bcc: settings.bccEmail || "",
    context: context || ""
  };

  try {
    const response = await fetch("http://localhost:3000/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      console.log("Daily email sent successfully");
      // Clear all todos after successful send (both completed and incomplete)
      await StorageManager.saveTodos([]);
    } else {
      console.error("Failed to send daily email:", await response.text());
    }
  } catch (error) {
    console.error("Failed to send daily email:", error);
  }
});

function getNext6PM() {
  const now = new Date();
  const target = new Date();
  target.setHours(18, 0, 0, 0);
  if (now > target) target.setDate(target.getDate() + 1);
  return target.getTime();
}
