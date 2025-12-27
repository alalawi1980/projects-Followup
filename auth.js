const SESSION_KEY = 'icv_session_v1';
const USERS_DB_KEY = 'icv_users_db_v1';

// --- تهيئة قاعدة المستخدمين ---
function initUsersDB() {
    let db = [];
    try {
        const stored = localStorage.getItem(USERS_DB_KEY);
        db = stored ? JSON.parse(stored) : [];
    } catch(e) { db = []; }

    if (!Array.isArray(db) || db.length === 0) {
        db = [{ username: 'icv', password: 'icv@oman', role: 'admin', entity: 'ALL' }];
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    }
    return db;
}

function saveUserCredentials(username, password, entityName) {
    let db = initUsersDB();
    const cleanEntity = entityName.trim();
    // البحث عن مستخدم بنفس الجهة لتحديثه
    const idx = db.findIndex(u => u.entity === cleanEntity);
    
    const newUser = { username, password, role: 'user', entity: cleanEntity };
    
    if (idx > -1 && db[idx].role !== 'admin') {
        db[idx] = newUser;
    } else {
        db.push(newUser);
    }
    
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
}

function getAllUsers() { return initUsersDB(); }

function deleteUser(username) {
    let db = initUsersDB();
    db = db.filter(u => u.username !== username && u.role !== 'admin');
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
}

// --- إدارة الجلسة ---
function attemptLogin(username, password) {
    const db = initUsersDB();
    const user = db.find(u => u.username === username && u.password === password);
    if (user) {
        const session = { username: user.username, role: user.role, entity: user.entity };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return { success: true, role: user.role };
    }
    return { success: false };
}

function getCurrentUser() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } 
    catch (e) { return null; }
}
function logout() {
    document.getElementById('logoutModal').classList.add('active');
}

function closeLogoutModal() {
    document.getElementById('logoutModal').classList.remove('active');
}

function confirmLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
}

function checkAuth(requiredRole = null) {
    const user = getCurrentUser();
    if (!user) {
        if (!window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
        }
        return null;
    }
    if (requiredRole === 'admin' && user.role !== 'admin') {
        alert("عذراً، هذه الصفحة للمسؤولين فقط.");
        window.location.href = 'projects.html';
        return null;
    }
    return user;
}

// --- شريط المستخدم ---
function renderUserBar() {
    const user = getCurrentUser();
    if (!user) return;
    if (document.getElementById('unique-user-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'unique-user-bar';
    bar.className = 'header-bar'; 
    
    let adminBtn = '';
    if (user.role === 'admin' && !window.location.href.includes('admin_users.html')) {
        adminBtn = `<a href="admin_users.html" class="btn btn-sm btn-secondary" style="margin-left:10px; color:white;">⚙️ إدارة المستخدمين</a>`;
    }

    const label = user.role === 'admin' ? 'مدير النظام' : `جهة: ${user.entity}`;

    bar.innerHTML = `
        <div style="font-weight:bold; color:#0b3c5d;">
            <i class="fa-solid fa-user-circle"></i> مرحبا، ${user.username} <span style="color:#777; font-size:0.9em;">(${label})</span>
        </div>
        <div style="display:flex; align-items:center;">
            ${adminBtn}
            <button onclick="logout()" class="btn btn-sm btn-danger">تسجيل خروج</button>
        </div>
    `;
    
    document.body.prepend(bar);
}

// تشغيل تلقائي
if (!window.location.href.includes('login.html')) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { checkAuth(); renderUserBar(); });
    } else {
        checkAuth(); renderUserBar();
    }
}
