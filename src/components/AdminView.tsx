import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Users, FileText, BarChart3, Trash2, Edit3, Save, X,
  RefreshCw, Key, Shield, ShieldOff, Ban, CheckCircle, AlertTriangle,
  Mail, Clock, UserCheck, Activity, Gamepad2, ChevronLeft, ChevronRight
} from 'lucide-react';

const API_BASE = "/api";
const ADMIN_TOKEN = 'admin'; // Matches backend ADMIN_SECRET default

// =================== Interfaces ===================
interface User {
  id: number;
  username: string;
  email: string;
  nickname: string;
  level: string;
  role: string;
  is_banned: number;
  created_at: string;
  last_login: string;
}

interface LogEntry {
  id: number;
  user_id: number;
  username: string;
  action: string;
  details: string;
  ip: string;
  created_at: string;
}

type Tab = 'users' | 'logs' | 'stats';

// =================== Toast Component ===================
interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const Toast: React.FC<{ toast: ToastData; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const colors = {
    success: 'bg-green-600/90 text-white',
    error: 'bg-red-600/90 text-white',
    info: 'bg-blue-600/90 text-white',
  };

  return (
    <div className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-[slideIn_0.3s_ease-out] ${colors[toast.type]}`}>
      {toast.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
      {toast.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0" />}
      <span>{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="mr-auto opacity-60 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// =================== Confirm Modal ===================
interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title, message, confirmLabel = 'تأكيد', variant = 'danger', onConfirm, onCancel
}) => {
  const btnColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-on-surface-variant mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium border border-outline-variant/30 hover:bg-surface-variant/50 transition-colors">
            إلغاء
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors ${btnColors[variant]}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// =================== Password Modal ===================
interface PasswordModalProps {
  user: User;
  onClose: () => void;
  onSubmit: (userId: number, newPassword: string) => Promise<void>;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ user, onClose, onSubmit }) => {
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (newPass.length < 4) { setError('كلمة المرور يجب أن تكون 4 أحرف على الأقل'); return; }
    if (newPass !== confirmPass) { setError('كلمتا المرور غير متطابقتين'); return; }
    setSubmitting(true);
    try {
      await onSubmit(user.id, newPass);
      onClose();
    } catch {
      setError('فشل في تغيير كلمة المرور');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-1">🔑 تغيير كلمة المرور</h3>
        <p className="text-sm text-on-surface-variant mb-4">المستخدم: <strong>{user.username}</strong></p>
        {error && <div className="bg-red-600/10 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}
        <input
          type="password" placeholder="كلمة المرور الجديدة" value={newPass}
          onChange={e => { setNewPass(e.target.value); setError(''); }}
          className="w-full bg-background border border-outline-variant/30 px-4 py-3 rounded-xl text-sm mb-3 focus:outline-none focus:border-primary"
          dir="ltr" autoFocus
        />
        <input
          type="password" placeholder="تأكيد كلمة المرور" value={confirmPass}
          onChange={e => { setConfirmPass(e.target.value); setError(''); }}
          className="w-full bg-background border border-outline-variant/30 px-4 py-3 rounded-xl text-sm mb-4 focus:outline-none focus:border-primary"
          dir="ltr"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium border border-outline-variant/30 hover:bg-surface-variant/50 transition-colors">
            إلغاء
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/80 transition-colors disabled:opacity-50">
            {submitting ? '...' : 'تغيير'}
          </button>
        </div>
      </div>
    </div>
  );
};

// =================== Edit User Modal ===================
interface EditModalProps {
  user: User;
  onClose: () => void;
  onSubmit: (userId: number, data: { nickname?: string; email?: string; level?: string; role?: string }) => Promise<void>;
}

const EditModal: React.FC<EditModalProps> = ({ user, onClose, onSubmit }) => {
  const [nickname, setNickname] = useState(user.nickname || '');
  const [email, setEmail] = useState(user.email || '');
  const [level, setLevel] = useState(user.level || 'recruit');
  const [role, setRole] = useState(user.role || 'user');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(user.id, { nickname, email, level, role });
      onClose();
    } catch { /* handled by parent */ } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">✏️ تعديل بيانات: <span className="text-primary">{user.username}</span></h3>

        <div className="space-y-3 mb-5">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">الكنية</label>
            <input value={nickname} onChange={e => setNickname(e.target.value)}
              className="w-full bg-background border border-outline-variant/30 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">البريد الإلكتروني</label>
            <input value={email} onChange={e => setEmail(e.target.value)} dir="ltr"
              className="w-full bg-background border border-outline-variant/30 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">المستوى</label>
              <select value={level} onChange={e => setLevel(e.target.value)}
                className="w-full bg-background border border-outline-variant/30 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary">
                <option value="recruit">متدرب</option>
                <option value="operative">عميل</option>
                <option value="expert">خبير</option>
                <option value="commander">قائد</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">الدور</label>
              <select value={role} onChange={e => setRole(e.target.value)}
                className="w-full bg-background border border-outline-variant/30 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary">
                <option value="user">مستخدم عادي</option>
                <option value="admin">مدير</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium border border-outline-variant/30 hover:bg-surface-variant/50 transition-colors">
            إلغاء
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/80 transition-colors disabled:opacity-50">
            {submitting ? '...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>
    </div>
  );
};

// =================== Main AdminView ===================
export const AdminView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tab, setTab] = useState<Tab>('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const addToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
    setToasts(prev => [...prev, { id: Date.now(), message, type }]);
  }, []);
  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Modals
  const [confirmModal, setConfirmModal] = useState<ConfirmModalProps | null>(null);
  const [passwordModal, setPasswordModal] = useState<User | null>(null);
  const [editModal, setEditModal] = useState<User | null>(null);

  // Log filters
  const [logAction, setLogAction] = useState('');
  const [logPage, setLogPage] = useState(0);
  const [logTotal, setLogTotal] = useState(0);
  const LOG_PAGE_SIZE = 25;

  // Helpers
  const fetchAdmin = async (endpoint: string, options?: RequestInit) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': ADMIN_TOKEN,
        ...(options?.headers || {}),
      },
    });
    return res.json();
  };

  const loadStats = async () => {
    try {
      const data = await fetchAdmin('/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdmin('/users');
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLogs = async (page = 0, action = '') => {
    setIsLoading(true);
    try {
      let endpoint = `/logs?limit=${LOG_PAGE_SIZE}&offset=${page * LOG_PAGE_SIZE}`;
      if (action) endpoint += `&action=${action}`;
      const data = await fetchAdmin(endpoint);
      setLogs(data.logs || []);
      setLogTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAll = async () => {
    setIsLoading(true);
    await Promise.all([loadStats(), loadUsers(), loadLogs(logPage, logAction)]);
    setIsLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    if (tab === 'logs') loadLogs(logPage, logAction);
    if (tab === 'stats') loadStats();
  }, [tab]);

  useEffect(() => {
    if (tab === 'logs') loadLogs(logPage, logAction);
  }, [logPage, logAction]);

  // ===== Actions =====
  const handleDeleteUser = (user: User) => {
    setConfirmModal({
      title: '⚠️ حذف مستخدم',
      message: `هل أنت متأكد من حذف "${user.username}"؟ سيتم حذف جميع بياناته نهائياً.`,
      confirmLabel: 'حذف',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await fetchAdmin(`/admin/users/${user.id}`, { method: 'DELETE' });
          addToast(`تم حذف "${user.username}" بنجاح`);
          loadUsers();
          loadStats();
        } catch {
          addToast('فشل في حذف المستخدم', 'error');
        }
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  const handleChangePassword = async (userId: number, newPassword: string) => {
    const data = await fetchAdmin(`/admin/users/${userId}/password`, {
      method: 'POST',
      body: JSON.stringify({ new_password: newPassword }),
    });
    if (data.success) {
      addToast('تم تغيير كلمة المرور بنجاح');
    } else {
      addToast(data.error || 'فشل في تغيير كلمة المرور', 'error');
      throw new Error(data.error);
    }
  };

  const handleEditUser = async (userId: number, updates: any) => {
    const data = await fetchAdmin(`/admin/users/${userId}/update`, {
      method: 'POST',
      body: JSON.stringify(updates),
    });
    if (data.success) {
      addToast('تم تحديث البيانات بنجاح');
      loadUsers();
    } else {
      addToast(data.error || 'فشل في التحديث', 'error');
      throw new Error(data.error);
    }
  };

  const handleToggleBan = (user: User) => {
    const isBanned = !!user.is_banned;
    setConfirmModal({
      title: isBanned ? '✅ إلغاء حظر' : '🚫 حظر مستخدم',
      message: isBanned
        ? `هل تريد إلغاء حظر "${user.username}"؟`
        : `هل تريد حظر "${user.username}"؟ لن يتمكن من تسجيل الدخول.`,
      confirmLabel: isBanned ? 'إلغاء الحظر' : 'حظر',
      variant: isBanned ? 'info' : 'warning',
      onConfirm: async () => {
        try {
          await fetchAdmin(`/admin/users/${user.id}/ban`, {
            method: 'POST',
            body: JSON.stringify({ is_banned: !isBanned }),
          });
          addToast(isBanned ? `تم إلغاء حظر "${user.username}"` : `تم حظر "${user.username}"`);
          loadUsers();
        } catch {
          addToast('فشلت العملية', 'error');
        }
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  const handleChangeRole = (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    setConfirmModal({
      title: newRole === 'admin' ? '👑 ترقية لمدير' : '👤 تخفيض لمستخدم',
      message: newRole === 'admin'
        ? `هل تريد ترقية "${user.username}" إلى مدير؟`
        : `هل تريد تخفيض "${user.username}" إلى مستخدم عادي؟`,
      confirmLabel: newRole === 'admin' ? 'ترقية' : 'تخفيض',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await fetchAdmin(`/admin/users/${user.id}/role`, {
            method: 'POST',
            body: JSON.stringify({ role: newRole }),
          });
          addToast(`تم تغيير دور "${user.username}" إلى ${newRole === 'admin' ? 'مدير' : 'مستخدم عادي'}`);
          loadUsers();
        } catch {
          addToast('فشل في تغيير الدور', 'error');
        }
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  // Date formatting
  const formatDate = (d: string) => {
    if (!d) return '-';
    try {
      return new Date(d + 'Z').toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return d; }
  };

  const roleBadge = (role: string) => (
    <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
      role === 'admin' ? 'bg-green-600/15 text-green-600' : 'bg-on-surface/10 text-on-surface-variant'
    }`}>
      {role === 'admin' ? 'مدير' : 'مستخدم'}
    </span>
  );

  const levelBadge = (level: string) => {
    const map: Record<string, string> = { recruit: 'متدرب', operative: 'عميل', expert: 'خبير', commander: 'قائد' };
    return (
      <span className="text-[9px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
        {map[level] || level}
      </span>
    );
  };

  const bannedBadge = <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-600/15 text-red-600">محظور</span>;

  const actionLabels: Record<string, string> = {
    register: 'تسجيل', login: 'دخول', save_progress: 'حفظ تقدم', level_up: 'ترقية مستوى',
    admin_delete_user: 'حذف مستخدم', admin_password_reset: 'إعادة كلمة مرور',
    admin_role_change: 'تغيير دور', admin_user_edit: 'تعديل بيانات',
    admin_ban_user: 'حظر', admin_unban_user: 'إلغاء حظر',
  };

  // =================== TABS ===================
  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: 'stats', label: 'الإحصائيات', icon: BarChart3 },
    { key: 'users', label: 'المستخدمون', icon: Users, count: stats.totalUsers },
    { key: 'logs', label: 'السجلات', icon: FileText, count: stats.totalLogs },
  ];

  // =================== RENDER ===================
  return (
    <div className="w-full h-full bg-background text-on-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-on-background/10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-50 hover:opacity-100 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> العودة
          </button>
          <h1 className="text-xl sm:text-2xl font-serif italic">🛡️ لوحة الإدارة</h1>
        </div>
        <button onClick={loadAll} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-primary hover:opacity-70">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> تحديث
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-on-background/10 shrink-0">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-colors ${
              tab === t.key ? 'text-primary border-b-2 border-primary' : 'text-on-background/40 hover:text-on-background/70'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
            {t.count !== undefined && (
              <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded-full font-mono">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">

        {/* =================== STATS TAB =================== */}
        {tab === 'stats' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            <div className="bg-surface p-5 rounded-xl border border-outline-variant/20 text-center">
              <Users className="w-7 h-7 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold text-primary">{stats.totalUsers || 0}</div>
              <div className="text-[9px] uppercase tracking-widest mt-1 opacity-60">إجمالي المستخدمين</div>
            </div>
            <div className="bg-surface p-5 rounded-xl border border-outline-variant/20 text-center">
              <FileText className="w-7 h-7 mx-auto text-secondary mb-2" />
              <div className="text-2xl font-bold text-secondary">{stats.totalLogs || 0}</div>
              <div className="text-[9px] uppercase tracking-widest mt-1 opacity-60">إجمالي العمليات</div>
            </div>
            <div className="bg-surface p-5 rounded-xl border border-outline-variant/20 text-center">
              <BarChart3 className="w-7 h-7 mx-auto text-error mb-2" />
              <div className="text-2xl font-bold text-error">{stats.todayUsers || 0}</div>
              <div className="text-[9px] uppercase tracking-widest mt-1 opacity-60">مسجلين اليوم</div>
            </div>
            <div className="bg-surface p-5 rounded-xl border border-outline-variant/20 text-center">
              <Activity className="w-7 h-7 mx-auto text-emerald-500 mb-2" />
              <div className="text-2xl font-bold text-emerald-500">{stats.activeUsers7d || 0}</div>
              <div className="text-[9px] uppercase tracking-widest mt-1 opacity-60">نشطين (7 أيام)</div>
            </div>
            <div className="bg-surface p-5 rounded-xl border border-outline-variant/20 text-center">
              <Shield className="w-7 h-7 mx-auto text-amber-500 mb-2" />
              <div className="text-2xl font-bold text-amber-500">{stats.totalAdmins || 0}</div>
              <div className="text-[9px] uppercase tracking-widest mt-1 opacity-60">مدراء</div>
            </div>
            <div className="bg-surface p-5 rounded-xl border border-outline-variant/20 text-center">
              <Gamepad2 className="w-7 h-7 mx-auto text-violet-500 mb-2" />
              <div className="text-lg font-bold text-violet-500">{stats.topGame?.game_type || '-'}</div>
              <div className="text-[9px] uppercase tracking-widest mt-1 opacity-60">أكثر لعبة نشاطاً</div>
              {stats.topGame && <div className="text-[10px] text-on-surface-variant mt-0.5">{stats.topGame.count} مشاركة</div>}
            </div>
          </div>
        )}

        {/* =================== USERS TAB =================== */}
        {tab === 'users' && (
          <div className="max-w-6xl mx-auto">
            {/* Desktop Table */}
            <div className="hidden lg:block bg-surface rounded-xl border border-outline-variant/20 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container text-[10px] uppercase tracking-widest">
                    <th className="p-3 text-right">ID</th>
                    <th className="p-3 text-right">المستخدم</th>
                    <th className="p-3 text-right">البريد</th>
                    <th className="p-3 text-right">الكنية</th>
                    <th className="p-3 text-right">المستوى</th>
                    <th className="p-3 text-right">الدور</th>
                    <th className="p-3 text-right">التسجيل</th>
                    <th className="p-3 text-right">آخر دخول</th>
                    <th className="p-3 text-right">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className={`border-t border-outline-variant/10 hover:bg-surface-container/50 ${user.is_banned ? 'opacity-60' : ''}`}>
                      <td className="p-3 font-mono text-xs">{user.id}</td>
                      <td className="p-3 font-medium">{user.username}</td>
                      <td className="p-3 text-xs font-mono" dir="ltr">{user.email || '-'}</td>
                      <td className="p-3">{user.nickname || '-'}</td>
                      <td className="p-3">{levelBadge(user.level || 'recruit')}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {roleBadge(user.role || 'user')}
                          {!!user.is_banned && bannedBadge}
                        </div>
                      </td>
                      <td className="p-3 text-[11px] text-on-surface-variant">{formatDate(user.created_at)}</td>
                      <td className="p-3 text-[11px] text-on-surface-variant">{formatDate(user.last_login)}</td>
                      <td className="p-3">
                        <div className="flex gap-1.5 flex-wrap">
                          <button onClick={() => setEditModal(user)} title="تعديل" className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setPasswordModal(user)} title="كلمة المرور" className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-500 transition-colors"><Key className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleChangeRole(user)} title={user.role === 'admin' ? 'تخفيض' : 'ترقية'} className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-500 transition-colors">
                            {user.role === 'admin' ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => handleToggleBan(user)} title={user.is_banned ? 'إلغاء حظر' : 'حظر'} className="p-1.5 rounded-lg hover:bg-orange-500/10 text-orange-500 transition-colors"><Ban className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteUser(user)} title="حذف" className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="p-8 text-center opacity-50 text-sm">لا يوجد مستخدمين مسجلين</div>}
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {users.map((user) => (
                <div key={user.id} className={`bg-surface rounded-xl border border-outline-variant/20 p-4 ${user.is_banned ? 'opacity-60' : ''}`}>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-sm">{user.username}</div>
                      <div className="text-xs text-on-surface-variant font-mono" dir="ltr">{user.email || 'لا يوجد بريد'}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {roleBadge(user.role || 'user')}
                      {!!user.is_banned && bannedBadge}
                    </div>
                  </div>
                  {/* Card Body */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                    <div>
                      <span className="text-on-surface-variant">الكنية: </span>
                      <span className="font-medium">{user.nickname || '-'}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant">المستوى: </span>
                      {levelBadge(user.level || 'recruit')}
                    </div>
                    <div>
                      <span className="text-on-surface-variant">التسجيل: </span>
                      <span className="font-mono">{formatDate(user.created_at)}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant">آخر دخول: </span>
                      <span className="font-mono">{formatDate(user.last_login)}</span>
                    </div>
                  </div>
                  {/* Card Actions */}
                  <div className="flex gap-2 flex-wrap border-t border-outline-variant/10 pt-3">
                    <button onClick={() => setEditModal(user)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition-colors"><Edit3 className="w-3 h-3" /> تعديل</button>
                    <button onClick={() => setPasswordModal(user)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 text-[10px] font-bold hover:bg-amber-500/20 transition-colors"><Key className="w-3 h-3" /> كلمة مرور</button>
                    <button onClick={() => handleChangeRole(user)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-600 text-[10px] font-bold hover:bg-green-500/20 transition-colors">
                      {user.role === 'admin' ? <><ShieldOff className="w-3 h-3" /> تخفيض</> : <><Shield className="w-3 h-3" /> ترقية</>}
                    </button>
                    <button onClick={() => handleToggleBan(user)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 text-[10px] font-bold hover:bg-orange-500/20 transition-colors"><Ban className="w-3 h-3" /> {user.is_banned ? 'إلغاء حظر' : 'حظر'}</button>
                    <button onClick={() => handleDeleteUser(user)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-600 text-[10px] font-bold hover:bg-red-500/20 transition-colors"><Trash2 className="w-3 h-3" /> حذف</button>
                  </div>
                </div>
              ))}
              {users.length === 0 && <div className="p-8 text-center opacity-50 text-sm">لا يوجد مستخدمين مسجلين</div>}
            </div>
          </div>
        )}

        {/* =================== LOGS TAB =================== */}
        {tab === 'logs' && (
          <div className="max-w-6xl mx-auto">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">فلتر:</label>
              <select value={logAction} onChange={e => { setLogAction(e.target.value); setLogPage(0); }}
                className="bg-surface border border-outline-variant/20 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-primary">
                <option value="">جميع الإجراءات</option>
                <option value="register">تسجيل</option>
                <option value="login">دخول</option>
                <option value="save_progress">حفظ تقدم</option>
                <option value="level_up">ترقية مستوى</option>
                <option value="admin_delete_user">حذف مستخدم</option>
                <option value="admin_password_reset">إعادة كلمة مرور</option>
                <option value="admin_role_change">تغيير دور</option>
                <option value="admin_ban_user">حظر</option>
              </select>
              <span className="text-xs text-on-surface-variant mr-auto">
                {logTotal} سجل
              </span>
            </div>

            <div className="bg-surface rounded-xl border border-outline-variant/20 overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container text-[10px] uppercase tracking-widest">
                      <th className="p-3 text-right">الوقت</th>
                      <th className="p-3 text-right">المستخدم</th>
                      <th className="p-3 text-right">الإجراء</th>
                      <th className="p-3 text-right">التفاصيل</th>
                      <th className="p-3 text-right">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-t border-outline-variant/10 hover:bg-surface-container/50">
                        <td className="p-3 font-mono text-[11px]" dir="ltr">{formatDate(log.created_at)}</td>
                        <td className="p-3">{log.username || `#${log.user_id}`}</td>
                        <td className="p-3">
                          <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-full ${
                            log.action === 'register' ? 'bg-primary/10 text-primary' :
                            log.action === 'login' ? 'bg-secondary/10 text-secondary' :
                            log.action === 'save_progress' ? 'bg-blue-500/10 text-blue-600' :
                            log.action.startsWith('admin_') ? 'bg-amber-500/10 text-amber-600' :
                            'bg-surface-variant text-on-surface-variant'
                          }`}>{actionLabels[log.action] || log.action}</span>
                        </td>
                        <td className="p-3 font-mono text-[11px] max-w-[200px] truncate" dir="ltr">{log.details !== '{}' ? log.details : '-'}</td>
                        <td className="p-3 font-mono text-[11px]" dir="ltr">{log.ip || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-outline-variant/10">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                        log.action === 'register' ? 'bg-primary/10 text-primary' :
                        log.action === 'login' ? 'bg-secondary/10 text-secondary' :
                        log.action.startsWith('admin_') ? 'bg-amber-500/10 text-amber-600' :
                        'bg-surface-variant text-on-surface-variant'
                      }`}>{actionLabels[log.action] || log.action}</span>
                      <span className="text-[10px] text-on-surface-variant font-mono" dir="ltr">{formatDate(log.created_at)}</span>
                    </div>
                    <div className="text-xs">{log.username || `#${log.user_id}`}</div>
                  </div>
                ))}
              </div>

              {logs.length === 0 && <div className="p-8 text-center opacity-50 text-sm">لا توجد سجلات</div>}
            </div>

            {/* Pagination */}
            {logTotal > LOG_PAGE_SIZE && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <button onClick={() => setLogPage(p => Math.max(0, p - 1))} disabled={logPage === 0}
                  className="p-2 rounded-lg border border-outline-variant/20 hover:bg-surface-variant/50 disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-sm font-mono">
                  {logPage + 1} / {Math.ceil(logTotal / LOG_PAGE_SIZE)}
                </span>
                <button onClick={() => setLogPage(p => p + 1)} disabled={(logPage + 1) * LOG_PAGE_SIZE >= logTotal}
                  className="p-2 rounded-lg border border-outline-variant/20 hover:bg-surface-variant/50 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* =================== MODALS & TOASTS =================== */}
      {confirmModal && <ConfirmModal {...confirmModal} />}
      {passwordModal && <PasswordModal user={passwordModal} onClose={() => setPasswordModal(null)} onSubmit={handleChangePassword} />}
      {editModal && <EditModal user={editModal} onClose={() => setEditModal(null)} onSubmit={handleEditUser} />}

      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 left-6 z-[200] flex flex-col gap-2 max-w-sm">
          {toasts.map(t => <Toast key={t.id} toast={t} onDismiss={removeToast} />)}
        </div>
      )}
    </div>
  );
};
