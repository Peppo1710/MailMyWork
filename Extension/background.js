chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("dailyReminder", {
    when: getNext5_59PM(),
    periodInMinutes: 1440,
  });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "dailyReminder") return;

  const {
    tasks = [],
    emailOn,
    senderEmail,
    appPassword,
    toEmail,
    ccEmail,
    bccEmail,
  } = await chromeStorageGet([
    "tasks",
    "emailOn",
    "senderEmail",
    "appPassword",
    "toEmail",
    "ccEmail",
    "bccEmail",
  ]);

  if (!emailOn || !tasks.length || !senderEmail || !appPassword || !toEmail) return;

  // Extract only the text from each task into an array of strings
  const todos = tasks.map((t) => t.text);

  // Prepare the JSON body as per your required format
  const body = {
    todos,
    sendEmail: true,
    senderEmail,
    smtpPass: appPassword,
    to: toEmail,
    cc: ccEmail || "",
    bcc: bccEmail || "",
  };

  try {
    await fetch("http://localhost:3000/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("Failed to send daily email:", error);
  }
});

function chromeStorageGet(keys) {
  return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
}

function getNext5_59PM() {
  const now = new Date();
  const target = new Date();
  target.setHours(17, 59, 0, 0);
  if (now > target) target.setDate(target.getDate() + 1);
  return target.getTime();
}
