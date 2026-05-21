import React, { useState, useEffect } from 'react';
import { GlobalHeader } from './GlobalHeader';
import { ArrowLeft, Users, FileText, BarChart3, Trash2, Edit3, Save, X, RefreshCw } from 'lucide-react';

const API_BASE = "/api";

interface User {
  id: number;
  username: string;
  nickname: string;
  level: string;
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

interface ProgressEntry {
  id: number;
  user_id: number;
  game_type: string;
  data: string;
  updated_at: string;
}

type Tab = 'users' | 'logs' | 'progress' | 'stats';

export const AdminView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tab, setTab] = useState<Tab>('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [stats, setStats] = useState<any>({});
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editNickname, setEditNickname] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Admin password gate
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPass, setAdminPass] = useState('');

  const fetchData = async (endpoint: string) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'X-Admin-Token': adminPass
      }
    });
    return res.json();
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, logsData] = await Promise.all([
        fetchData('/stats'),
        fetchData('/logs?limit=100'),
      ]);
      setStats(statsData);
      setLogs(logsData.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchData('/users');
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProgress = async () => {
    setIsLoading(true);
    try {
      const data = await fetchData('/logs?limit=100');
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminAuth) loadData();
  }, [adminAuth]);

  useEffect(() => {
    if (tab === 'users' && adminAuth) loadUsers();
    if (tab === 'progress' && adminAuth) loadProgress();
  }, [tab]);

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Token': adminPass
        }
      });
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  if (!adminAuth) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background text-on-background">
        <div className="w-full max-w-sm p-8 bg-white border border-on-background/20 shadow-[8px_8px_0px_#1A1A1A]">
          <h2 className="text-2xl font-serif italic mb-6 text-center">🔒 لوحة الإدارة</h2>
          <p className="text-sm text-on-surface-variant mb-4 text-center">أدخل كلمة مرور المدير</p>
          <input
            type="password"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && adminPass === 'admin' && setAdminAuth(true)}
            className="w-full bg-background border border-on-background/20 py-3 px-4 mb-4 focus:outline-none focus:border-primary"
            placeholder="كلمة المرور..."
            dir="ltr"
          />
          <button
            onClick={() => adminPass === 'admin' ? setAdminAuth(true) : alert('كلمة المرور خاطئة')}
            className="w-full bg-on-background text-background py-3 text-[11px] tracking-widest font-bold hover:bg-primary transition-colors"
          >
            دخول
          </button>
          <button onClick={onBack} className="w-full mt-3 py-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
            العودة
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'stats', label: 'الإحصائيات', icon: BarChart3 },
    { key: 'users', label: 'المستخدمون', icon: Users },
    { key: 'logs', label: 'السجلات', icon: FileText },
  ];

  return (
    <div className="w-full h-full bg-background text-on-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-on-background/10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-50 hover:opacity-100 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> العودة
          </button>
          <h1 className="text-2xl font-serif italic">لوحة الإدارة</h1>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-primary hover:opacity-70">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> تحديث
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-on-background/10 shrink-0">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-colors ${tab === t.key ? 'text-primary border-b-2 border-primary' : 'text-on-background/40 hover:text-on-background/70'}`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Stats Tab */}
        {tab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-surface p-6 rounded-xl border border-outline-variant/20 text-center">
              <Users className="w-8 h-8 mx-auto text-primary mb-3" />
              <div className="text-3xl font-bold text-primary">{stats.totalUsers || 0}</div>
              <div className="text-[10px] uppercase tracking-widest mt-1 opacity-60">إجمالي المستخدمين</div>
            </div>
            <div className="bg-surface p-6 rounded-xl border border-outline-variant/20 text-center">
              <FileText className="w-8 h-8 mx-auto text-secondary mb-3" />
              <div className="text-3xl font-bold text-secondary">{stats.totalLogs || 0}</div>
              <div className="text-[10px] uppercase tracking-widest mt-1 opacity-60">إجمالي العمليات</div>
            </div>
            <div className="bg-surface p-6 rounded-xl border border-outline-variant/20 text-center">
              <BarChart3 className="w-8 h-8 mx-auto text-error mb-3" />
              <div className="text-3xl font-bold text-error">{stats.todayUsers || 0}</div>
              <div className="text-[10px] uppercase tracking-widest mt-1 opacity-60">مسجلين اليوم</div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-surface rounded-xl border border-outline-variant/20 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container text-[10px] uppercase tracking-widest">
                    <th className="p-3 text-right">ID</th>
                    <th className="p-3 text-right">اسم المستخدم</th>
                    <th className="p-3 text-right">المستوى</th>
                    <th className="p-3 text-right">الكنية</th>
                    <th className="p-3 text-right">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-outline-variant/10 hover:bg-surface-container/50">
                      <td className="p-3 font-mono">{user.id}</td>
                      <td className="p-3">{user.username}</td>
                      <td className="p-3">
                        {editingUser === user.id ? (
                          <select value={editLevel} onChange={e => setEditLevel(e.target.value)} className="bg-background border border-on-background/20 px-2 py-1 text-sm">
                            <option value="recruit">متدرب</option>
                            <option value="operative">عميل</option>
                            <option value="expert">خبير</option>
                            <option value="commander">قائد</option>
                          </select>
                        ) : (
                          <span className="text-primary text-[10px] uppercase font-bold tracking-widest">{user.level || 'recruit'}</span>
                        )}
                      </td>
                      <td className="p-3">
                        {editingUser === user.id ? (
                          <input value={editNickname} onChange={e => setEditNickname(e.target.value)} className="bg-background border border-on-background/20 px-2 py-1 text-sm w-full" />
                        ) : (
                          user.nickname || '-'
                        )}
                      </td>
                      <td className="p-3">
                        {editingUser === user.id ? (
                          <div className="flex gap-2">
                            <button onClick={async () => {
                              await fetch(`${API_BASE}/user/level`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ user_id: user.id, level: editLevel }),
                              });
                              setEditingUser(null);
                              loadUsers();
                            }} className="text-primary hover:opacity-70"><Save className="w-4 h-4" /></button>
                            <button onClick={() => setEditingUser(null)} className="text-error hover:opacity-70"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingUser(user.id); setEditNickname(user.nickname || ''); setEditLevel(user.level || 'recruit'); }} className="text-primary hover:opacity-70"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteUser(user.id)} className="text-error hover:opacity-70"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="p-8 text-center opacity-50 text-sm">لا يوجد مستخدمين مسجلين</div>}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {tab === 'logs' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-surface rounded-xl border border-outline-variant/20 overflow-hidden">
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
                      <td className="p-3 font-mono text-[11px]" dir="ltr">{log.created_at}</td>
                      <td className="p-3">{log.username || `#${log.user_id}`}</td>
                      <td className="p-3">
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 ${
                          log.action === 'register' ? 'bg-primary/10 text-primary' :
                          log.action === 'login' ? 'bg-secondary/10 text-secondary' :
                          log.action === 'save_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-surface-variant text-on-surface-variant'
                        }`}>{log.action}</span>
                      </td>
                      <td className="p-3 font-mono text-[11px]" dir="ltr">{log.details}</td>
                      <td className="p-3 font-mono text-[11px]" dir="ltr">{log.ip || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && <div className="p-8 text-center opacity-50 text-sm">لا توجد سجلات</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
