/* Skibidi IPA Builder — frontend */

const API = '/api';
let editor = null;
let currentProject = null;
let currentFile = null;
let dirty = false;
let selectedDevice = null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function log(msg, level = 'info') {
  const out = $('#logOutput');
  const ts = new Date().toLocaleTimeString();
  const prefix = level === 'error' ? '❌' : level === 'ok' ? '✅' : '▸';
  out.textContent += `[${ts}] ${prefix} ${msg}\n`;
  out.scrollTop = out.scrollHeight;
}

function showBuildStatus(msg, type = 'info') {
  const el = $('#buildStatus');
  if (!el) return;
  el.textContent = msg;
  el.className = `status-banner ${type}`;
}

function hideBuildStatus() {
  const el = $('#buildStatus');
  if (el) el.className = 'status-banner hidden';
}

function setButtonLoading(btn, loading, label) {
  if (!btn) return;
  btn.classList.toggle('is-loading', loading);
  btn.disabled = loading;
  if (label) btn.textContent = label;
}

function switchToTab(name) {
  $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  $$('.tab-content').forEach((c) => c.classList.remove('active'));
  $(`#tab-${name}`)?.classList.add('active');
}

async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

// ── Monaco Editor ──

function initEditor() {
  require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' } });
  require(['vs/editor/editor.main'], () => {
    editor = monaco.editor.create($('#editor'), {
      value: '// Open a file from the tree',
      language: 'swift',
      theme: 'vs-dark',
      fontSize: 13,
      minimap: { enabled: false },
      automaticLayout: true,
      scrollBeyondLastLine: false,
    });
    editor.onDidChangeModelContent(() => {
      dirty = true;
      $('#btnSave').disabled = false;
    });
  });
}

function langForFile(name) {
  if (name.endsWith('.swift')) return 'swift';
  if (name.endsWith('.yml') || name.endsWith('.yaml')) return 'yaml';
  if (name.endsWith('.json')) return 'json';
  if (name.endsWith('.plist')) return 'xml';
  if (name.endsWith('.md')) return 'markdown';
  return 'plaintext';
}

// ── File tree ──

function renderTree(nodes, container) {
  container.innerHTML = '';
  for (const node of nodes) {
    const el = document.createElement('div');
    if (node.type === 'directory') {
      el.innerHTML = `<div class="tree-item" data-path="${node.path}" data-type="dir">
        <span class="icon">📁</span> ${node.name}
      </div>`;
      if (node.children?.length) {
        const child = document.createElement('div');
        child.className = 'tree-children';
        renderTree(node.children, child);
        el.appendChild(child);
      }
    } else {
      el.innerHTML = `<div class="tree-item" data-path="${node.path}" data-type="file">
        <span class="icon">📄</span> ${node.name}
      </div>`;
    }
    container.appendChild(el);
  }

  container.querySelectorAll('.tree-item[data-type="file"]').forEach((item) => {
    item.addEventListener('click', () => openFile(item.dataset.path));
  });
}

async function loadProjects() {
  try {
    const { projects } = await api('/files/projects');
    const sel = $('#projectSelect');
    sel.innerHTML = projects.length
      ? projects.map((p) => `<option value="${p}">${p}</option>`).join('')
      : '<option value="">No projects</option>';

    if (projects.length) {
      currentProject = projects[0];
      sel.value = currentProject;
      await loadTree();
      $('#buildBundleId').value = `com.skibidi.${currentProject.toLowerCase()}`;
    } else {
      currentProject = null;
      showBuildStatus('No projects yet — click "+ New" on the left or use CashClone in projects/.', 'info');
    }
  } catch (e) {
    showBuildStatus(`Cannot reach server. Run "npm start" in the skibidi folder. (${e.message})`, 'error');
    log(`Server unreachable: ${e.message}`, 'error');
  }
}

async function loadTree() {
  if (!currentProject) return;
  const { tree } = await api(`/files/tree/${currentProject}`);
  renderTree(tree, $('#fileTree'));
}

async function openFile(path) {
  const { content } = await api(`/files/read/${currentProject}/${path}`);
  currentFile = path;
  dirty = false;
  $('#openFileLabel').textContent = path;
  $('#btnSave').disabled = true;

  $$('.tree-item').forEach((el) => el.classList.remove('active'));
  $(`.tree-item[data-path="${path}"]`)?.classList.add('active');

  if (editor) {
    const model = monaco.editor.createModel(content, langForFile(path));
    editor.setModel(model);
  }
}

async function saveFile() {
  if (!currentFile || !editor) return;
  await api(`/files/write/${currentProject}/${currentFile}`, {
    method: 'PUT',
    body: JSON.stringify({ content: editor.getValue() }),
  });
  dirty = false;
  $('#btnSave').disabled = true;
  log(`Saved ${currentFile}`, 'ok');
}

// ── Devices ──

async function refreshDevices() {
  try {
    const data = await api('/device/list');
    const badge = $('#deviceStatus');
    const sel = $('#deviceSelect');

    sel.innerHTML = '<option value="">Auto-detect</option>';

    if (data.devices?.length) {
      const d = data.devices[0];
      selectedDevice = d.udid;
      badge.className = 'device-badge online';
      badge.querySelector('.label').textContent = `${d.name} · iOS ${d.ios}`;

      for (const dev of data.devices) {
        const opt = document.createElement('option');
        opt.value = dev.udid;
        opt.textContent = `${dev.name} (${dev.ios})`;
        sel.appendChild(opt);
      }
      log(`Device connected: ${d.name}`, 'ok');
    } else {
      badge.className = 'device-badge offline';
      badge.querySelector('.label').textContent = data.message || 'No device';
      selectedDevice = null;
    }
  } catch (e) {
    log(`Device check failed: ${e.message}`, 'error');
  }
}

// ── Tools status ──

async function loadToolsStatus() {
  const data = await api('/sign/tools');
  const grid = $('#toolsStatus');

  const items = [
    { name: 'Sideloader (Apple ID sign)', ok: data.sideloader?.available, path: data.sideloader?.path },
    { name: 'zsign (cert re-sign)', ok: data.zsign?.available, path: data.zsign?.path },
    ...(data.device || []).map((t) => ({ name: t.name, ok: t.exists, path: t.path })),
  ];

  grid.innerHTML = items.map((t) => `
    <div class="tool-item">
      <span>${t.name}</span>
      <span class="status ${t.ok ? 'ok' : 'missing'}">${t.ok ? '✓ Ready' : '✗ Missing'}</span>
    </div>
  `).join('');
}

// ── Build ──

async function generateWorkflow() {
  const btn = $('#btnGenWorkflow');
  const resultEl = $('#workflowResult');

  if (!currentProject) {
    showBuildStatus('Pick a project from the dropdown on the left first (e.g. CashClone).', 'error');
    log('Select a project first', 'error');
    return;
  }

  hideBuildStatus();
  if (resultEl) resultEl.className = 'hint workflow-result hidden';
  setButtonLoading(btn, true, 'Generating…');

  try {
    const bundleId = $('#buildBundleId').value || `com.skibidi.${currentProject.toLowerCase()}`;
    const result = await api(`/build/generate-workflow/${currentProject}`, {
      method: 'POST',
      body: JSON.stringify({ bundleId }),
    });

    showBuildStatus('Workflow file created on your PC. Follow the steps below to actually build the IPA.', 'ok');
    if (resultEl) {
      resultEl.className = 'hint workflow-result';
      resultEl.innerHTML =
        `Created: <code>${result.workflowPath}</code>\n\n` +
        'Next steps:\n' +
        '1. Push this whole skibidi folder to a GitHub repo\n' +
        '2. On GitHub go to Actions → "Build iOS IPA" → Run workflow\n' +
        '3. When it finishes, download the IPA artifact\n' +
        '4. Come back here → Sign & Install tab → install to your iPhone';
    }

    log(`Workflow written: ${result.workflowPath}`, 'ok');
    log('Push to GitHub and run the "Build iOS IPA" workflow. Download the artifact when done.', 'info');
  } catch (e) {
    showBuildStatus(`Failed: ${e.message}. Is the server running? (npm start)`, 'error');
    log(`Generate workflow failed: ${e.message}`, 'error');
  } finally {
    setButtonLoading(btn, false, 'Generate GitHub Workflow');
  }
}

async function packageIpa() {
  const appPath = $('#appPath').value.trim();
  const outputName = $('#ipaOutputName').value.trim() || 'output.ipa';
  if (!appPath) {
    showBuildStatus('Enter the full path to a .app folder first.', 'error');
    return log('Enter .app path', 'error');
  }

  const btn = $('#btnPackageIpa');
  setButtonLoading(btn, true, 'Packaging…');
  hideBuildStatus();

  try {
    log('Packaging IPA...');
    const result = await api('/build/package-ipa', {
      method: 'POST',
      body: JSON.stringify({ appPath, outputName }),
    });
    log(result.logs || '');
    log(`IPA ready: ${result.path} (${result.size} bytes)`, 'ok');
    $('#signIpaPath').value = result.path;
    showBuildStatus(`IPA saved: ${result.path}`, 'ok');
  } catch (e) {
    showBuildStatus(`Package failed: ${e.message}`, 'error');
    log(`Package failed: ${e.message}`, 'error');
  } finally {
    setButtonLoading(btn, false, 'Package IPA');
  }
}

// ── Sign & Install ──

function getSignMode() {
  return document.querySelector('input[name="signMode"]:checked')?.value || 'appleid';
}

function updateSignModeUI() {
  const mode = getSignMode();
  $('#appleIdFields').hidden = mode !== 'appleid';
  $('#certFields').hidden = mode !== 'cert';
}

async function uploadIpa(file) {
  const fd = new FormData();
  fd.append('ipa', file);
  const res = await fetch('/api/sign/upload-ipa', { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  $('#signIpaPath').value = data.path;
  log(`Uploaded: ${data.path}`, 'ok');
}

async function signAndInstall(installOnly = false) {
  const ipaPath = $('#signIpaPath').value.trim();
  const udid = $('#deviceSelect').value || undefined;
  const mode = getSignMode();

  if (!ipaPath) return log('Set an IPA path', 'error');

  if (mode === 'appleid') {
    const appleId = $('#appleId').value.trim();
    const password = $('#applePassword').value;
    if (!appleId || !password) return log('Apple ID and app-specific password required', 'error');

    log('Signing with Apple ID via Sideloader...');
    const result = await api('/sign/apple-id-install', {
      method: 'POST',
      body: JSON.stringify({
        ipaPath,
        appleId,
        password,
        bundleId: $('#signBundleId').value.trim() || undefined,
        appName: $('#signAppName').value.trim() || undefined,
        udid,
      }),
    });
    log(result.logs || result.stdout || result.stderr || '');
    if (result.ok) log('Installed on device!', 'ok');
    else log(`Failed (code ${result.code})`, 'error');
    return;
  }

  if (mode === 'cert') {
    const p12File = $('#p12Upload').files[0];
    const provFile = $('#provisionUpload').files[0];
    if (!p12File) return log('Upload a p12 certificate', 'error');

    const fd = new FormData();
    fd.append('p12', p12File);
    if (provFile) fd.append('provision', provFile);
    const up = await fetch('/api/sign/upload-cert', { method: 'POST', body: fd });
    const certPaths = await up.json();

    const outputPath = ipaPath.replace(/\.ipa$/i, '-signed.ipa');
    log('Signing with zsign...');
    const result = await api('/sign/zsign', {
      method: 'POST',
      body: JSON.stringify({
        inputPath: ipaPath,
        outputPath,
        p12Path: certPaths.p12Path,
        p12Password: $('#p12Password').value,
        provisionPath: certPaths.provisionPath,
        bundleId: $('#signBundleId').value.trim() || undefined,
        bundleName: $('#signAppName').value.trim() || undefined,
      }),
    });
    log(result.logs || result.stdout || '');
    if (result.ok) {
      log(`Signed IPA: ${outputPath}`, 'ok');
      if (!installOnly) {
        log('Installing...');
        const inst = await api('/device/install', {
          method: 'POST',
          body: JSON.stringify({ ipaPath: outputPath, udid }),
        });
        if (inst.ok) log('Installed!', 'ok');
        else log(inst.stderr || 'Install failed', 'error');
      }
    } else log('Sign failed', 'error');
    return;
  }

  if (mode === 'adhoc') {
    const outputPath = ipaPath.replace(/\.ipa$/i, '-adhoc.ipa');
    log('Ad-hoc signing with zsign...');
    const result = await api('/sign/zsign', {
      method: 'POST',
      body: JSON.stringify({ inputPath: ipaPath, outputPath, adhoc: true }),
    });
    log(result.logs || result.stdout || '');
    if (result.ok) log(`Ad-hoc IPA: ${outputPath}`, 'ok');
    else log('Sign failed', 'error');
  }
}

// ── Tabs ──

function initTabs() {
  $$('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('.tab').forEach((t) => t.classList.remove('active'));
      $$('.tab-content').forEach((c) => c.classList.remove('active'));
      tab.classList.add('active');
      $(`#tab-${tab.dataset.tab}`).classList.add('active');
      if (tab.dataset.tab === 'tools') loadToolsStatus();
    });
  });
}

// ── New project ──

async function createProject(e) {
  e.preventDefault();
  const name = $('#newProjectName').value.trim();
  const bundleId = $('#newProjectBundleId').value.trim();
  await api('/build/new-project', {
    method: 'POST',
    body: JSON.stringify({ name, bundleId: bundleId || undefined }),
  });
  $('#newProjectModal').close();
  log(`Created project: ${name}`, 'ok');
  await loadProjects();
}

// ── Init ──

document.addEventListener('DOMContentLoaded', () => {
  initEditor();
  initTabs();
  updateSignModeUI();

  $('#projectSelect').addEventListener('change', async (e) => {
    currentProject = e.target.value;
    currentFile = null;
    await loadTree();
    if (currentProject) {
      $('#buildBundleId').value = `com.skibidi.${currentProject.toLowerCase()}`;
    }
  });

  $('#btnSave').addEventListener('click', saveFile);
  $('#btnNewProject').addEventListener('click', () => $('#newProjectModal').showModal());
  $('#btnCancelNew').addEventListener('click', () => $('#newProjectModal').close());
  $('#newProjectModal').querySelector('form').addEventListener('submit', createProject);

  $('#btnRefreshDevice').addEventListener('click', refreshDevices);
  $('#btnGenWorkflow').addEventListener('click', generateWorkflow);
  $('#btnPackageIpa').addEventListener('click', packageIpa);
  $('#btnSignInstall').addEventListener('click', () => signAndInstall(false));
  $('#btnSignOnly').addEventListener('click', () => signAndInstall(true));
  $('#btnClearLog').addEventListener('click', () => { $('#logOutput').textContent = ''; });

  $('#btnUploadIpa').addEventListener('click', () => $('#ipaUpload').click());
  $('#ipaUpload').addEventListener('change', (e) => {
    if (e.target.files[0]) uploadIpa(e.target.files[0]);
  });

  $$('input[name="signMode"]').forEach((r) => r.addEventListener('change', updateSignModeUI));

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveFile();
    }
  });

  loadProjects();
  refreshDevices();
  loadToolsStatus();

  setInterval(refreshDevices, 15000);
});
