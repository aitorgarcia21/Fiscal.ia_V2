const FRANCIS_BUTTON_CLASS = 'francis-autofill-btn';
const FRANCIS_ENDPOINT = 'https://api.francis.ai/autofill';

function createButton(form) {
  if (form.querySelector(`.${FRANCIS_BUTTON_CLASS}`)) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Remplir avec Francis';
  btn.className = FRANCIS_BUTTON_CLASS;
  Object.assign(btn.style, {
    position: 'absolute', top: '-12px', right: '-12px', zIndex: 2147483647,
    background: '#c5a572', color: '#162238', fontSize: '12px', borderRadius: '8px',
    padding: '6px 8px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,.3)'
  });
  btn.addEventListener('click', () => handleClick(form));
  form.style.position ||= 'relative';
  form.appendChild(btn);
}

function btnState(form, state) {
  const btn = form.querySelector(`.${FRANCIS_BUTTON_CLASS}`);
  if (!btn) return;
  if (state === 'loading') { btn.disabled = true; btn.textContent = '…'; }
  else if (state === 'done') { btn.textContent = '✓'; setTimeout(() => { btn.textContent = 'Remplir avec Francis'; btn.disabled = false; }, 1500); }
  else { btn.textContent = 'Remplir avec Francis'; btn.disabled = false; }
}

function labelMap(form) {
  const map = {};
  form.querySelectorAll('label').forEach(label => {
    const text = label.textContent.trim().toLowerCase();
    const forId = label.htmlFor;
    if (forId) map[text] = form.querySelector(`#${CSS.escape(forId)}`);
  });
  return map;
}

function autofill(form, data) {
  const lMap = labelMap(form);
  Object.entries(data).forEach(([key, value]) => {
    key = key.toLowerCase();
    let field = form.querySelector(`[name="${CSS.escape(key)}"]`);
    if (!field) field = form.querySelector(`#${CSS.escape(key)}`);
    if (!field && lMap[key]) field = lMap[key];
    if (!field) { console.warn('Champ non trouvé', key); return; }
    if (['INPUT', 'TEXTAREA'].includes(field.tagName)) { field.value = value; field.dispatchEvent(new Event('input', { bubbles: true })); }
    else if (field.tagName === 'SELECT') {
      Array.from(field.options).forEach(opt => { if (opt.value == value || opt.textContent.trim() == value) field.value = opt.value; });
      field.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

async function handleClick(form) {
  btnState(form, 'loading');
  chrome.runtime.sendMessage({ type: 'FILL_FORM_REQUEST', endpoint: FRANCIS_ENDPOINT, payload: { url: location.href } }, (resp) => {
    if (!resp?.success) { alert(`Francis : ${resp?.error || 'Erreur'}`); btnState(form, 'idle'); return; }
    autofill(form, resp.data);
    btnState(form, 'done');
  });
}

function scanForms() { document.querySelectorAll('form').forEach(createButton); }
scanForms();
const obs = new MutationObserver(scanForms);
obs.observe(document.documentElement, { childList: true, subtree: true }); 