document.addEventListener('DOMContentLoaded', async () => {
  const tokenInput = document.getElementById('token');
  const status = document.getElementById('status');

  const { token } = await chrome.storage.sync.get(['token']);
  if (token) tokenInput.value = token;

  document.getElementById('save').addEventListener('click', async () => {
    const tk = tokenInput.value.trim();
    if (!tk) return;
    await chrome.storage.sync.set({ token: tk });
    status.textContent = 'Sauvegardé ✓';
    setTimeout(() => (status.textContent = ''), 1500);
  });
}); 