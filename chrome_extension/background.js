// Service Worker Francis Autofill Extension
chrome.runtime.onMessage.addListener(async (msg, _sender, sendResponse) => {
  if (msg.type !== 'FILL_FORM_REQUEST') return;

  try {
    const { endpoint, payload } = msg;
    const { token } = await chrome.storage.sync.get(['token']);
    if (!token) throw new Error('Token manquant : configurez-le dans le popup.');

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) throw new Error(`Erreur API (${resp.status})`);
    const data = await resp.json();
    sendResponse({ success: true, data });
  } catch (e) {
    sendResponse({ success: false, error: e.message });
  }

  return true; // keep channel open
}); 