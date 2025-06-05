const toEmail = document.getElementById("toEmail");
const ccEmail = document.getElementById("ccEmail");
const bccEmail = document.getElementById("bccEmail");
const saveBtn = document.getElementById("saveRecipients");

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["toEmail", "ccEmail", "bccEmail"], (data) => {
    toEmail.value = data.toEmail || "";
    ccEmail.value = data.ccEmail || "";
    bccEmail.value = data.bccEmail || "";
  });
});

saveBtn.addEventListener("click", () => {
  const to = toEmail.value.trim();
  const cc = ccEmail.value.trim();
  const bcc = bccEmail.value.trim();

  if (!to) return alert("Please enter the To email.");

  chrome.storage.local.set({ toEmail: to, ccEmail: cc, bccEmail: bcc }, () => {
    alert("Recipients saved!");
  });
});
