// ============================================================
// JongJongDi Admin – Shared Library (_lib.js)
// All globals attached to window; no ES modules.
// ============================================================

const _IS_LOCAL = ['localhost', '127.0.0.1', ''].includes(location.hostname);
const API       = 'https://api.jongjongdi.com';

// ── Auth ─────────────────────────────────────────────────────

function getAdminSession() {
  var token = localStorage.getItem('jjd_token');
  var raw = localStorage.getItem('jjd_operator');
  if (!token || !raw) return null;
  try { return { token: token, operator: JSON.parse(raw) }; }
  catch (e) { return null; }
}

function saveAdminSession(token, operator) {
  localStorage.setItem('jjd_token', token);
  localStorage.setItem('jjd_operator', JSON.stringify(operator));
}

function clearAdminSession() {
  localStorage.removeItem('jjd_token');
  localStorage.removeItem('jjd_operator');
}

function adminToken() {
  return localStorage.getItem('jjd_token') || '';
}

function adminBearerHeader() {
  return { 'Authorization': 'Bearer ' + adminToken() };
}

// ── API helpers ───────────────────────────────────────────────

async function adminFetch(path, opts) {
  opts = opts || {};
  opts.headers = Object.assign({}, adminBearerHeader(), opts.headers || {});
  var res = await fetch(API + path, opts);
  if (!res.ok) {
    var err;
    try { err = await res.json(); } catch (e) { err = {}; }
    throw new Error(err.message || err.error || ('HTTP ' + res.status));
  }
  return res;
}

async function adminGet(path) {
  var res = await adminFetch(path);
  return res.json();
}

async function adminPost(path, body) {
  var res = await adminFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function adminPatch(path, body) {
  var res = await adminFetch(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function adminDelete(path) {
  var res = await adminFetch(path, { method: 'DELETE' });
  return res.json();
}

// ── UI helpers ────────────────────────────────────────────────

function showToast(msg, type) {
  type = type || 'success';
  var existing = document.getElementById('__jjd_toast');
  if (existing) existing.remove();

  var el = document.createElement('div');
  el.id = '__jjd_toast';
  el.textContent = msg;
  el.style.cssText = [
    'position:fixed',
    'top:20px',
    'right:20px',
    'z-index:9999',
    'padding:12px 20px',
    'border-radius:10px',
    'font-family:Prompt,sans-serif',
    'font-size:14px',
    'font-weight:500',
    'box-shadow:0 4px 16px rgba(0,0,0,0.18)',
    'transition:opacity .3s',
    'opacity:1',
    type === 'error'
      ? 'background:#fee2e2;color:#dc2626;border:1px solid #fca5a5'
      : 'background:#dcfce7;color:#15803d;border:1px solid #86efac'
  ].join(';');

  document.body.appendChild(el);
  setTimeout(function () {
    el.style.opacity = '0';
    setTimeout(function () { el.remove(); }, 300);
  }, 3000);
}

function fmt(n) {
  return Number(n).toLocaleString();
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('th-TH', { dateStyle: 'medium' });
}

// ── Status constants ──────────────────────────────────────────

var BOOKING_STATUS_LABEL = {
  PENDING_PAYMENT: 'รอชำระเงิน',
  PENDING_CONFIRM: 'รอยืนยัน',
  CONFIRMED: 'ยืนยันแล้ว',
  CHECKED_IN: 'เช็คอินแล้ว',
  COMPLETED: 'เสร็จสิ้น',
  CANCELLED: 'ยกเลิก',
  REFUNDED: 'คืนเงิน',
  NO_SHOW: 'ไม่มา'
};

var BOOKING_STATUS_STYLE = {
  PENDING_PAYMENT: 'background:#fef9c3;color:#a16207',
  PENDING_CONFIRM: 'background:#dbeafe;color:#1d4ed8',
  CONFIRMED:       'background:#dcfce7;color:#15803d',
  CHECKED_IN:      'background:#ccfbf1;color:#0f766e',
  COMPLETED:       'background:#f1f5f9;color:#475569',
  CANCELLED:       'background:#fee2e2;color:#dc2626',
  REFUNDED:        'background:#ffedd5;color:#c2410c',
  NO_SHOW:         'background:#f3f4f6;color:#6b7280'
};

function bookingStatusBadge(status) {
  var label = BOOKING_STATUS_LABEL[status] || status;
  var style = BOOKING_STATUS_STYLE[status] || 'background:#f3f4f6;color:#374151';
  return '<span style="' + style + ';padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;display:inline-block">' + label + '</span>';
}

// ── Navigation items ──────────────────────────────────────────

var NAV_ITEMS = [
  { href: 'dashboard.html',     icon: 'fa-gauge',               label: 'Dashboard' },
  { href: 'operators.html',     icon: 'fa-users',               label: 'ผู้ประกอบการ',       superAdminOnly: true },
  { href: 'rooms.html',         icon: 'fa-bed',                 label: 'ที่พัก',              requiresActive: true },
  { href: 'tours.html',         icon: 'fa-water-ladder',        label: 'ทัวร์',               requiresActive: true },
  { href: 'products.html',      icon: 'fa-bag-shopping',        label: 'สินค้า',              superAdminOnly: true },
  { href: 'trending.html',      icon: 'fa-fire',                label: 'ฮิตติดกระแส',         superAdminOnly: true },
  { href: 'coupons.html',       icon: 'fa-ticket',              label: 'คูปอง',               superAdminOnly: true },
  { href: 'bookings.html',      icon: 'fa-calendar-check',      label: 'การจอง',              requiresActive: true },
  { href: 'revenue.html',       icon: 'fa-coins',               label: 'รายได้',              requiresActive: true },
  { href: 'availability.html',  icon: 'fa-ban',                 label: 'วันว่าง/ปิด',          requiresActive: true },
  { href: 'seasons.html',       icon: 'fa-tag',                 label: 'ราคา High Season',    requiresActive: true },
  { href: 'bank-accounts.html', icon: 'fa-building-columns',    label: 'บัญชีธนาคาร',          superAdminOnly: true },
  { href: 'payouts.html',       icon: 'fa-file-invoice-dollar', label: 'ยอดโอน/ใบสรุป',       superAdminOnly: true },
  { href: 'settings.html',      icon: 'fa-gear',                label: 'ตั้งค่า' }
];

// ── Shell renderer ────────────────────────────────────────────

function renderAdminShell(opts) {
  opts = opts || {};
  var activePage = opts.activePage || '';
  var requireSuperAdmin = opts.requireSuperAdmin || false;

  var session = getAdminSession();
  if (!session) {
    location.href = 'login.html';
    return null;
  }

  var operator = session.operator;
  var token = session.token;
  var isSuperAdmin = operator.role === 'SUPER_ADMIN';
  var isPending = operator.status === 'PENDING';
  var isSuspended = operator.status === 'SUSPENDED';

  if (requireSuperAdmin && !isSuperAdmin) {
    location.href = 'dashboard.html';
    return null;
  }

  // Build nav HTML
  var navHtml = '';
  NAV_ITEMS.forEach(function (item) {
    if (item.superAdminOnly && !isSuperAdmin) return;
    if (item.requiresActive && !isSuperAdmin && (isPending || isSuspended)) return;

    var isActive = activePage === item.href;
    var activeStyle = isActive
      ? 'background:#1e3a8a;color:#fff;border-left:3px solid #2563eb;'
      : 'color:rgba(255,255,255,0.75);border-left:3px solid transparent;';

    navHtml += '<a href="' + item.href + '" style="' +
      'display:flex;align-items:center;gap:12px;' +
      'padding:10px 20px;text-decoration:none;font-size:14px;font-weight:500;' +
      'transition:background .15s;' + activeStyle + '" ' +
      'onmouseover="if(this.dataset.active!==\'1\'){this.style.background=\'rgba(255,255,255,0.08)\';}" ' +
      'onmouseout="if(this.dataset.active!==\'1\'){this.style.background=\'transparent\';}" ' +
      (isActive ? 'data-active="1"' : '') + '>' +
      '<i class="fa-solid ' + item.icon + '" style="width:16px;text-align:center"></i>' +
      '<span>' + item.label + '</span>' +
      '</a>';
  });

  // Status badge for operator
  var statusColor = operator.status === 'ACTIVE' ? '#15803d' : operator.status === 'PENDING' ? '#a16207' : '#dc2626';
  var statusBg = operator.status === 'ACTIVE' ? '#dcfce7' : operator.status === 'PENDING' ? '#fef9c3' : '#fee2e2';
  var statusLabel = operator.status === 'ACTIVE' ? 'ใช้งานได้' : operator.status === 'PENDING' ? 'รออนุมัติ' : 'ถูกระงับ';

  // Pending / suspended banner
  var bannerHtml = '';
  if (isPending) {
    bannerHtml = '<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:10px;padding:12px 18px;margin-bottom:20px;display:flex;align-items:center;gap:10px;">' +
      '<i class="fa-solid fa-triangle-exclamation" style="color:#f59e0b;font-size:18px"></i>' +
      '<div><strong style="color:#92400e">บัญชีของคุณรออนุมัติ</strong>' +
      '<p style="margin:0;font-size:13px;color:#78350f">แอดมินจะตรวจสอบและอนุมัติบัญชีของคุณโดยเร็ว เมื่ออนุมัติแล้วคุณจะสามารถใช้งานได้เต็มรูปแบบ</p>' +
      '</div></div>';
  } else if (isSuspended) {
    bannerHtml = '<div style="background:#fee2e2;border:1px solid #dc2626;border-radius:10px;padding:12px 18px;margin-bottom:20px;display:flex;align-items:center;gap:10px;">' +
      '<i class="fa-solid fa-circle-xmark" style="color:#dc2626;font-size:18px"></i>' +
      '<div><strong style="color:#7f1d1d">บัญชีถูกระงับการใช้งาน</strong>' +
      '<p style="margin:0;font-size:13px;color:#991b1b">กรุณาติดต่อแอดมินเพื่อขอข้อมูลเพิ่มเติม</p>' +
      '</div></div>';
  }

  var sidebarId = '__jjd_sidebar';
  var overlayId = '__jjd_overlay';

  document.body.style.cssText = 'margin:0;padding:0;font-family:Prompt,sans-serif;background:#f8fafc;';

  document.body.innerHTML =
    // ── Sidebar ──
    '<nav id="' + sidebarId + '" style="' +
      'position:fixed;top:0;left:0;height:100vh;width:240px;' +
      'background:#0f172a;display:flex;flex-direction:column;' +
      'z-index:200;transition:transform .25s;overflow-y:auto;">' +

      // Logo
      '<div style="padding:22px 20px 14px;border-bottom:1px solid rgba(255,255,255,0.08)">' +
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<div style="width:36px;height:36px;background:#2563eb;border-radius:9px;' +
            'display:flex;align-items:center;justify-content:center">' +
            '<i class="fa-solid fa-calendar-check" style="color:#fff;font-size:18px"></i>' +
          '</div>' +
          '<div>' +
            '<div style="color:#fff;font-size:15px;font-weight:700;line-height:1.1">JongJongDi</div>' +
            '<div style="color:rgba(255,255,255,0.45);font-size:11px">Admin Panel</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // Nav links
      '<div style="flex:1;padding:10px 0">' + navHtml + '</div>' +

      // User info + logout
      '<div style="padding:16px 20px;border-top:1px solid rgba(255,255,255,0.08)">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
          '<div style="width:34px;height:34px;background:#1e40af;border-radius:50%;' +
            'display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
            '<i class="fa-solid fa-user" style="color:#fff;font-size:14px"></i>' +
          '</div>' +
          '<div style="min-width:0">' +
            '<div style="color:#fff;font-size:13px;font-weight:600;' +
              'white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (operator.name || operator.email) + '</div>' +
            '<div style="font-size:11px">' +
              '<span style="background:' + statusBg + ';color:' + statusColor + ';' +
                'padding:1px 7px;border-radius:999px;font-weight:600">' + statusLabel + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<button onclick="clearAdminSession();location.href=\'login.html\'" style="' +
          'width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);' +
          'background:transparent;color:rgba(255,255,255,0.65);font-family:Prompt,sans-serif;' +
          'font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;' +
          'transition:background .15s" ' +
          'onmouseover="this.style.background=\'rgba(255,255,255,0.08)\'" ' +
          'onmouseout="this.style.background=\'transparent\'">' +
          '<i class="fa-solid fa-right-from-bracket"></i> ออกจากระบบ' +
        '</button>' +
      '</div>' +
    '</nav>' +

    // ── Mobile overlay ──
    '<div id="' + overlayId + '" style="' +
      'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:199"' +
      ' onclick="document.getElementById(\'' + sidebarId + '\').style.transform=\'translateX(-100%)\';' +
        'document.getElementById(\'' + overlayId + '\').style.display=\'none\'"></div>' +

    // ── Main area ──
    '<div id="__jjd_main" style="margin-left:240px;min-height:100vh;display:flex;flex-direction:column;">' +

      // Mobile top bar (hidden on desktop via JS-injected media style)
      '<div id="__jjd_topbar" style="display:none;align-items:center;gap:12px;' +
        'padding:14px 16px;background:#0f172a;position:sticky;top:0;z-index:100">' +
        '<button id="__jjd_hamburger" style="background:none;border:none;cursor:pointer;color:#fff;font-size:22px;padding:0">' +
          '<i class="fa-solid fa-bars"></i>' +
        '</button>' +
        '<span style="color:#fff;font-size:16px;font-weight:700">JongJongDi Admin</span>' +
      '</div>' +

      // Page content
      '<div id="page-content" style="flex:1;padding:20px;background:#f8fafc;overflow-y:auto">' +
        bannerHtml +
      '</div>' +
    '</div>' +

    // ── Responsive styles ──
    '<style>' +
      '@media(max-width:768px){' +
        '#' + sidebarId + '{transform:translateX(-100%);}' +
        '#__jjd_main{margin-left:0 !important;}' +
        '#__jjd_topbar{display:flex !important;}' +
      '}' +
    '</style>';

  // Hamburger toggle
  var hamburger = document.getElementById('__jjd_hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', function () {
      var sb = document.getElementById(sidebarId);
      var ov = document.getElementById(overlayId);
      var isOpen = sb.style.transform !== 'translateX(-100%)';
      if (isOpen) {
        sb.style.transform = 'translateX(-100%)';
        ov.style.display = 'none';
      } else {
        sb.style.transform = 'translateX(0)';
        ov.style.display = 'block';
      }
    });
  }

  return { operator: operator, token: token };
}
