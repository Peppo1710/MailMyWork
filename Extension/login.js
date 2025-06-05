const emailInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const proceedBtn = document.getElementById('proceedBtn');

proceedBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  console.log('User-entered email:', email);
  console.log('User-entered password:', password);

  if (!email || password.length !== 16) {
    alert('Enter a valid email and 16-character app password.');
    return;
  }

 chrome.storage.local.set({ senderEmail: email, appPassword: password, isLoggedIn: true }, () => {
  console.log('✅ Credentials saved:', { senderEmail: email, appPassword: password, isLoggedIn: true });

  window.location.href = 'popup.html';
});

});
