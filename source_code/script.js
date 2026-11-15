'use strict';
/* TaskFlow – sections: helpers · storage · validation · filtering · rendering · events */

/* ============ helpers ============ */
const KEY = 'taskflow.tasks.v1';
const PR = { high: 3, medium: 2, low: 1 };
const $ = s => document.querySelector(s);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => ymd(new Date());
const isDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + 'T00:00:00'));
const isOverdue = t => !t.completed && t.due < today();
const fmt = d => new Date(d.length === 10 ? d + 'T00:00:00' : d)
  .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let toastTimer;
function toast(msg, ms = 2400) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

/* ============ storage (hardened) ============ */
function seed() {
  const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d); };
  const mk = (title, description, priority, due, completed = false) =>
    ({ id: uid(), title, description, priority, created: new Date().toISOString(), due, completed });
  return [
    mk('Finish project report', 'Add screenshots and the Local Storage section.', 'high', day(2)),
    mk('Push code to GitHub', 'Write the README with setup steps.', 'medium', day(-1)),
    mk('Test on mobile', 'Check layout at 375px width.', 'low', day(5), true)
  ];
}

/* Repairs a stored record. Only a missing title makes it unrecoverable. */
function sanitize(t) {
  if (!t || typeof t !== 'object') return null;
  const title = typeof t.title === 'string' ? t.title.trim().slice(0, 80) : '';
  if (!title) return null;
  const created = typeof t.created === 'string' && !isNaN(Date.parse(t.created)) ? t.created : new Date().toISOString();
  return {
    id: typeof t.id === 'string' && t.id ? t.id : uid(),
    title,
    description: typeof t.description === 'string' ? t.description.slice(0, 300) : '',
    priority: PR[t.priority] ? t.priority : 'medium',
    created,
    due: isDate(t.due) ? t.due : ymd(new Date(created)),
    completed: t.completed === true
  };
}

const Store = {
  memoryOnly: false,
  init() {
    try { localStorage.setItem('__tf', '1'); localStorage.removeItem('__tf'); }
    catch { this.memoryOnly = true; }
  },
  backup(raw) { try { localStorage.setItem(KEY + '.backup', raw); return true; } catch { return false; } },
  read() {
    const memory = { tasks: seed(), notice: 'Browser storage is unavailable. Tasks will be lost when you close this tab.' };
    if (this.memoryOnly) return memory;
    let raw;
    try { raw = localStorage.getItem(KEY); } catch { this.memoryOnly = true; return memory; }
    if (raw === null) return { tasks: seed(), notice: '' };
    let data;
    try { data = JSON.parse(raw); } catch { data = null; }
    if (!Array.isArray(data)) {
      if (this.backup(raw)) this.write([]);   /* clean slate only after the original is safely backed up */
      return { tasks: [], notice: 'Saved tasks were unreadable. A backup copy was kept in your browser.' };
    }
    let skipped = 0, repaired = false;
    const tasks = [];
    for (const rec of data) {
      const fixed = sanitize(rec);
      if (!fixed) { skipped++; repaired = true; continue; }
      if (Object.keys(rec).length !== Object.keys(fixed).length || Object.keys(fixed).some(k => fixed[k] !== rec[k])) repaired = true;
      tasks.push(fixed);
    }
    /* Persist the repaired list so the next load reads clean data. Back up first; if the
       backup can't be saved, leave the original untouched rather than risk losing it. */
    if (repaired && this.backup(raw)) this.write(tasks);
    const notice = skipped ? `${skipped} unreadable task${skipped > 1 ? 's were' : ' was'} skipped. A backup copy was kept.`
      : repaired ? 'Some saved tasks had invalid details and were repaired.' : '';
    return { tasks, notice };
  },
  write(list) {
    if (this.memoryOnly) return true;
    try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch { return false; }
  }
};
Store.init();
const loaded = Store.read();
let tasks = loaded.tasks, editId = null, delId = null;
function save() { if (!Store.write(tasks)) toast('Could not save. Browser storage may be full or blocked.', 4000); }

/* ============ validation ============ */
function fail(inputId, errId, msg) { $('#' + inputId).classList.add('invalid'); $('#' + errId).textContent = msg; return false; }
function clearErrors() {
  document.querySelectorAll('.err').forEach(e => e.textContent = '');
  document.querySelectorAll('.invalid').forEach(e => e.classList.remove('invalid'));
}
function validate() {
  clearErrors();
  const title = $('#title').value.trim(), desc = $('#desc').value.trim(), due = $('#due').value;
  let ok = true;
  if (!title) ok = fail('title', 'eTitle', 'Enter a title for the task.');
  else if (title.length < 3) ok = fail('title', 'eTitle', 'Title needs at least 3 characters.');
  if (desc.length > 300) ok = fail('desc', 'eDesc', 'Description must be 300 characters or fewer.');
  if (!isDate(due)) ok = fail('due', 'eDue', 'Choose a valid due date.');
  /* Intentional: new tasks can't be dated in the past, but editing keeps any date
     so an overdue task can still be renamed or reprioritised. */
  else if (!editId && due < today()) ok = fail('due', 'eDue', 'Due date cannot be in the past.');
  return ok;
}

/* ============ view state · search · filter · sort ============ */
const view = { status: 'all', prio: 'all' };
const dayDiff = d => Math.round((new Date(d + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 864e5);
function rel(t) {
  if (t.completed) return 'Done';
  const n = dayDiff(t.due);
  if (n === 0) return 'Due today';
  if (n === 1) return 'Due tomorrow';
  return n > 1 ? `In ${n} days` : `${-n} day${n === -1 ? '' : 's'} late`;
}
function visibleTasks() {
  const q = $('#q').value.trim().toLowerCase(), st = view.status, pr = view.prio;
  const by = {
    'created-desc': (a, b) => b.created.localeCompare(a.created),
    'created-asc': (a, b) => a.created.localeCompare(b.created),
    'due-asc': (a, b) => a.due.localeCompare(b.due),
    'due-desc': (a, b) => b.due.localeCompare(a.due),
    'prio': (a, b) => PR[b.priority] - PR[a.priority] || a.due.localeCompare(b.due) || a.title.localeCompare(b.title),
    'title': (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  };
  return tasks.filter(t =>
    (!q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) &&
    (pr === 'all' || t.priority === pr) &&
    (st === 'all' || (st === 'pending' && !t.completed) || (st === 'completed' && t.completed) || (st === 'overdue' && isOverdue(t)))
  ).sort(by[$('#sort').value]);
}

/* ============ rendering ============ */
function render() {
  const done = tasks.filter(t => t.completed).length, pending = tasks.length - done, over = tasks.filter(isOverdue).length;
  $('#nAll').textContent = tasks.length; $('#nPending').textContent = pending;
  $('#nDone').textContent = done; $('#nOver').textContent = over;
  $('#headline').textContent = !tasks.length ? 'A clean slate.' : !pending ? 'All done. Nice work.'
    : over ? `${pending} to do, ${over} overdue.` : `${pending} to do, none overdue.`;
  const pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  $('#bar').style.width = pct + '%';
  $('.bar').setAttribute('aria-valuenow', pct);
  $('#pct').textContent = pct + '% completed';
  document.querySelectorAll('[data-status]').forEach(b => b.setAttribute('aria-pressed', b.dataset.status === view.status));
  document.querySelectorAll('[data-prio]').forEach(b => b.setAttribute('aria-pressed', b.dataset.prio === view.prio));

  const list = visibleTasks(), empty = $('#empty');
  $('#list').innerHTML = list.map(t => `
    <li class="item ${t.priority} ${t.completed ? 'done' : ''}" data-id="${esc(t.id)}">
      <button class="check" data-act="toggle" aria-label="${t.completed ? 'Mark as pending' : 'Mark as completed'}: ${esc(t.title)}">
        <svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3.2L13 5"/></svg></button>
      <div>
        <h3>${esc(t.title)}</h3>
        ${t.description ? `<p>${esc(t.description)}</p>` : ''}
        <div class="row-meta">
          <span class="pl">${t.priority[0].toUpperCase() + t.priority.slice(1)} priority</span>
          <span>Added ${fmt(t.created)}</span>
          <button class="link" data-act="edit">Edit</button>
          <button class="link del" data-act="del">Delete</button>
        </div>
      </div>
      <div class="when"><b>${fmt(t.due)}</b>${isOverdue(t) ? `<span class="pill">${rel(t)}</span>` : `<span>${rel(t)}</span>`}</div>
    </li>`).join('');
  empty.hidden = list.length > 0;
  $('#list').hidden = !list.length;
  if (!list.length) empty.innerHTML = tasks.length
    ? '<h3>No matching tasks</h3><p>Try a different search or clear the filters.</p><button class="btn" data-act="clear">Clear filters</button>'
    : '<h3>Nothing here yet</h3><p>Add your first task to get started.</p><button class="btn btn-ink" data-act="new">Add a task</button>';
}

/* ============ composer (inline on desktop, bottom sheet on mobile) ============ */
const desktop = () => matchMedia('(min-width: 821px)').matches;
function resetComposer() {
  editId = null;
  $('#formTitle').textContent = 'Add a task';
  $('#saveBtn').textContent = 'Add task';
  $('#cancelEdit').hidden = true;
  $('#title').value = ''; $('#desc').value = ''; $('#prio').value = 'medium';
  $('#due').min = today(); $('#due').value = today();
  clearErrors();
}
function openCompose() { document.body.classList.add('compose'); setTimeout(() => $('#title').focus(), 50); }
function endCompose() { resetComposer(); document.body.classList.remove('compose'); }
function startEdit(task) {
  editId = task.id;
  $('#formTitle').textContent = 'Edit task';
  $('#saveBtn').textContent = 'Save changes';
  $('#cancelEdit').hidden = false;
  $('#title').value = task.title; $('#desc').value = task.description;
  $('#prio').value = task.priority; $('#due').min = ''; $('#due').value = task.due;
  clearErrors(); openCompose();
}

/* ============ events ============ */
$('#form').addEventListener('submit', e => {
  e.preventDefault();
  if (!validate()) return;
  const data = { title: $('#title').value.trim(), description: $('#desc').value.trim(), priority: $('#prio').value, due: $('#due').value };
  if (editId) { Object.assign(tasks.find(t => t.id === editId), data); toast('Changes saved'); }
  else { tasks.push({ id: uid(), ...data, created: new Date().toISOString(), completed: false }); toast('Task added'); }
  save(); endCompose(); render();
  if (desktop()) $('#title').focus();
});
document.addEventListener('click', e => {
  const t = e.target;
  const nav = t.closest('[data-status]'); if (nav) { view.status = nav.dataset.status; return render(); }
  const chip = t.closest('[data-prio]'); if (chip) { view.prio = chip.dataset.prio; return render(); }
  const close = t.closest('[data-close]'); if (close) return $('#' + close.dataset.close).close();
  if (t.closest('[data-sheet-close]') || t.closest('#cancelEdit') || t.classList.contains('scrim')) return endCompose();
  if (t.closest('#fab')) return openCompose();
  const btn = t.closest('[data-act]'); if (!btn) return;
  if (btn.dataset.act === 'new') return desktop() ? $('#title').focus() : openCompose();
  if (btn.dataset.act === 'clear') { view.status = view.prio = 'all'; $('#q').value = ''; return render(); }
  const task = tasks.find(x => x.id === btn.closest('.item')?.dataset.id);
  if (!task) return;
  if (btn.dataset.act === 'toggle') {
    task.completed = !task.completed; save(); render();
    toast(task.completed ? 'Marked as completed' : 'Marked as pending');
  } else if (btn.dataset.act === 'edit') startEdit(task);
  else if (btn.dataset.act === 'del') {
    delId = task.id;
    $('#delText').textContent = `“${task.title}” will be removed permanently.`;
    $('#delDlg').showModal();
  }
});
$('#confirmDel').addEventListener('click', () => {
  tasks = tasks.filter(t => t.id !== delId);
  if (editId === delId) endCompose();
  save(); render(); $('#delDlg').close(); toast('Task deleted');
});
['q', 'sort'].forEach(id => $('#' + id).addEventListener('input', render));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !document.querySelector('dialog[open]') && (editId || document.body.classList.contains('compose'))) endCompose();
});
$('#delDlg').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.close(); });

resetComposer();
render();
if (loaded.notice) toast(loaded.notice, 5000);
