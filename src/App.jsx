import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, MessageSquare, PlusCircle, Shield, User, 
  LogOut, Star, CheckCircle, Clock, AlertCircle, Search, Filter, ArrowRight 
} from 'lucide-react';

// Seed initial users & feedbacks in LocalStorage
const seedStorage = () => {
  if (!localStorage.getItem('sentient_users')) {
    localStorage.setItem('sentient_users', JSON.stringify([
      { id: '1', fname: 'Alice', lname: 'Chen', username: 'admin', password: 'admin123', role: 'admin' },
      { id: '2', fname: 'Bob', lname: 'Smith', username: 'user', password: 'user1234', role: 'user' }
    ]));
  }
  if (!localStorage.getItem('sentient_feedbacks')) {
    localStorage.setItem('sentient_feedbacks', JSON.stringify([
      { id: '101', userId: '2', name: 'Bob Smith', subject: 'Dashboard UI', category: 'UX', rating: 5, sentiment: 'Positive', status: 'Resolved', message: 'Absolutely love the new dashboard interface!', createdAt: new Date().toISOString() },
      { id: '102', userId: '2', name: 'Bob Smith', subject: 'Mobile App', category: 'Product', rating: 3, sentiment: 'Neutral', status: 'In Review', message: 'Mobile app has some lag during login.', createdAt: new Date().toISOString() }
    ]));
  }
};

export default function App() {
  useEffect(() => { seedStorage(); }, []);

  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sentient_session')); } catch { return null; }
  });

  const handleLogin = (user) => {
    localStorage.setItem('sentient_session', JSON.stringify(user));
    setSession(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('sentient_session');
    setSession(null);
  };

  if (!session) return <AuthScreen onLogin={handleLogin} />;
  return session.role === 'admin' ? <AdminDashboard session={session} onLogout={handleLogout} /> : <UserDashboard session={session} onLogout={handleLogout} />;
}

/* =========================================================
   AUTH SCREEN (Login, Signup, Demo logins)
   ========================================================= */
function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('sentient_users') || '[]');
    const found = users.find(u => u.username === username && u.password === password);
    if (found) {
      onLogin(found);
    } else {
      setError('Invalid username or password.');
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!username || !password || !fname || !lname) {
      setError('All fields are required.');
      return;
    }
    const users = JSON.parse(localStorage.getItem('sentient_users') || '[]');
    if (users.some(u => u.username === username)) {
      setError('Username already taken.');
      return;
    }
    const newUser = { id: Date.now().toString(), fname, lname, username, password, role: 'user' };
    users.push(newUser);
    localStorage.setItem('sentient_users', JSON.stringify(users));
    onLogin(newUser);
  };

  const fillDemo = (role) => {
    if (role === 'admin') { setUsername('admin'); setPassword('admin123'); }
    else { setUsername('user'); setPassword('user1234'); }
    setError('');
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <div style={styles.brandHeader}>
          <Shield color="#8b5cf6" size={32} />
          <h1 style={styles.brandTitle}>Sentient</h1>
        </div>
        
        <div style={styles.tabContainer}>
          <button style={tab === 'login' ? styles.activeTab : styles.tab} onClick={() => { setTab('login'); setError(''); }}>Sign In</button>
          <button style={tab === 'signup' ? styles.activeTab : styles.tab} onClick={() => { setTab('signup'); setError(''); }}>Sign Up</button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={styles.form}>
            <input style={styles.input} type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
            <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button style={styles.primaryBtn} type="submit">Sign In</button>
            <div style={styles.demoRow}>
              <button type="button" style={styles.demoBtn} onClick={() => fillDemo('admin')}>🛡️ Admin Demo</button>
              <button type="button" style={styles.demoBtn} onClick={() => fillDemo('user')}>👤 User Demo</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} style={styles.form}>
            <div style={styles.row2}>
              <input style={styles.input} type="text" placeholder="First Name" value={fname} onChange={e => setFname(e.target.value)} required />
              <input style={styles.input} type="text" placeholder="Last Name" value={lname} onChange={e => setLname(e.target.value)} required />
            </div>
            <input style={styles.input} type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
            <input style={styles.input} type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required />
            <button style={styles.primaryBtn} type="submit">Create Account</button>
          </form>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ADMIN DASHBOARD MODULE
   ========================================================= */
function AdminDashboard({ session, onLogout }) {
  const [page, setPage] = useState('overview');
  const [feedbacks, setFeedbacks] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setFeedbacks(JSON.parse(localStorage.getItem('sentient_feedbacks') || '[]'));
  }, [page]);

  const updateStatus = (id, newStatus) => {
    const updated = feedbacks.map(f => f.id === id ? { ...f, status: newStatus } : f);
    localStorage.setItem('sentient_feedbacks', JSON.stringify(updated));
    setFeedbacks(updated);
  };

  const filtered = feedbacks.filter(f => 
    (f.subject.toLowerCase().includes(search.toLowerCase()) || f.name.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === '' || f.status === statusFilter)
  );

  return (
    <div style={styles.dashboardLayout}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}><Shield size={24} color="#a78bfa"/> Sentient Admin</div>
        <nav style={styles.nav}>
          <button style={page === 'overview' ? styles.activeNavBtn : styles.navBtn} onClick={() => setPage('overview')}><BarChart3 size={18}/> Overview</button>
          <button style={page === 'feedbacks' ? styles.activeNavBtn : styles.navBtn} onClick={() => setPage('feedbacks')}><MessageSquare size={18}/> All Feedbacks</button>
        </nav>
        <div style={styles.sidebarFooter}>
          <span>{session.fname} (Admin)</span>
          <button style={styles.iconBtn} onClick={onLogout}><LogOut size={16}/></button>
        </div>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.topbar}>
          <h2>Admin Dashboard</h2>
          <div style={styles.badge}>Administrator</div>
        </header>

        {page === 'overview' && (
          <div>
            <div style={styles.kpiGrid}>
              <div style={styles.kpiCard}><h4>Total Feedbacks</h4><p style={styles.kpiVal}>{feedbacks.length}</p></div>
              <div style={styles.kpiCard}><h4>Resolved</h4><p style={styles.kpiVal}>{feedbacks.filter(f => f.status === 'Resolved').length}</p></div>
              <div style={styles.kpiCard}><h4>Pending Review</h4><p style={styles.kpiVal}>{feedbacks.filter(f => f.status !== 'Resolved').length}</p></div>
            </div>
            <h3 style={{margin: '24px 0 12px'}}>Recent Feedbacks</h3>
            <FeedbackList items={feedbacks.slice(0, 5)} onStatusChange={updateStatus} />
          </div>
        )}

        {page === 'feedbacks' && (
          <div>
            <div style={styles.filterBar}>
              <input style={styles.searchInput} placeholder="Search feedbacks..." value={search} onChange={e => setSearch(e.target.value)} />
              <select style={styles.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <FeedbackList items={filtered} onStatusChange={updateStatus} />
          </div>
        )}
      </main>
    </div>
  );
}

/* =========================================================
   USER DASHBOARD MODULE
   ========================================================= */
function UserDashboard({ session, onLogout }) {
  const [page, setPage] = useState('home');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [myFeedbacks, setMyFeedbacks] = useState([]);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('sentient_feedbacks') || '[]');
    setMyFeedbacks(all.filter(f => f.userId === session.id));
  }, [page]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const all = JSON.parse(localStorage.getItem('sentient_feedbacks') || '[]');
    const newFb = {
      id: Date.now().toString(),
      userId: session.id,
      name: `${session.fname} ${session.lname}`,
      subject,
      category: 'General',
      rating,
      sentiment: rating >= 4 ? 'Positive' : 'Neutral',
      status: 'New',
      message,
      createdAt: new Date().toISOString()
    };
    all.unshift(newFb);
    localStorage.setItem('sentient_feedbacks', JSON.stringify(all));
    alert('Feedback submitted successfully!');
    setSubject('');
    setMessage('');
    setPage('my-feedbacks');
  };

  return (
    <div style={styles.dashboardLayout}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}><User size={24} color="#22d3ee"/> Sentient User</div>
        <nav style={styles.nav}>
          <button style={page === 'home' ? styles.activeNavBtn : styles.navBtn} onClick={() => setPage('home')}><BarChart3 size={18}/> Home</button>
          <button style={page === 'submit' ? styles.activeNavBtn : styles.navBtn} onClick={() => setPage('submit')}><PlusCircle size={18}/> Submit Feedback</button>
          <button style={page === 'my-feedbacks' ? styles.activeNavBtn : styles.navBtn} onClick={() => setPage('my-feedbacks')}><MessageSquare size={18}/> My Feedbacks</button>
        </nav>
        <div style={styles.sidebarFooter}>
          <span>{session.fname} (User)</span>
          <button style={styles.iconBtn} onClick={onLogout}><LogOut size={16}/></button>
        </div>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.topbar}>
          <h2>User Dashboard</h2>
          <div style={{...styles.badge, background: 'rgba(34,211,238,0.1)', color: '#22d3ee'}}>Standard User</div>
        </header>

        {page === 'home' && (
          <div>
            <h3>Welcome back, {session.fname}! 👋</h3>
            <p style={{color: '#94a3b8', marginTop: '8px'}}>You have submitted {myFeedbacks.length} feedbacks so far.</p>
          </div>
        )}

        {page === 'submit' && (
          <form onSubmit={handleSubmit} style={styles.formCard}>
            <h3>Submit New Feedback</h3>
            <input style={styles.input} placeholder="Product / Feature Name" value={subject} onChange={e => setSubject(e.target.value)} required />
            <div style={{margin: '12px 0'}}>
              <label style={{fontSize: '0.85rem', color: '#94a3b8'}}>Rating: {rating} ★</label>
              <input type="range" min="1" max="5" value={rating} onChange={e => setRating(Number(e.target.value))} style={{width: '100%'}} />
            </div>
            <textarea style={{...styles.input, height: '100px'}} placeholder="Describe your experience..." value={message} onChange={e => setMessage(e.target.value)} required />
            <button style={styles.primaryBtn} type="submit">Submit Feedback</button>
          </form>
        )}

        {page === 'my-feedbacks' && (
          <div>
            <h3>My Feedbacks</h3>
            <FeedbackList items={myFeedbacks} readOnly />
          </div>
        )}
      </main>
    </div>
  );
}

function FeedbackList({ items, onStatusChange, readOnly }) {
  if (items.length === 0) return <p style={{color: '#94a3b8', marginTop: '16px'}}>No feedbacks found.</p>;
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px'}}>
      {items.map(f => (
        <div key={f.id} style={styles.feedbackCard}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <strong>{f.subject}</strong>
            <span style={styles.statusBadge(f.status)}>{f.status}</span>
          </div>
          <p style={{fontSize: '0.9rem', color: '#cbd5e1', margin: '8px 0'}}>{f.message}</p>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8'}}>
            <span>By {f.name} • Rating: {f.rating}★</span>
            {!readOnly && onStatusChange && (
              <div style={{display: 'flex', gap: '8px'}}>
                <button style={styles.actionBtn} onClick={() => onStatusChange(f.id, 'In Review')}>In Review</button>
                <button style={{...styles.actionBtn, background: '#34d399', color: '#000'}} onClick={() => onStatusChange(f.id, 'Resolved')}>Resolve</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   CSS STYLES OBJECT
   ========================================================= */
const styles = {
  authContainer: { minHeight: '100vh', background: '#0b0d14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
  authCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px' },
  brandHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
  brandTitle: { color: '#fff', fontSize: '1.5rem', fontWeight: '800' },
  tabContainer: { display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '4px', marginBottom: '20px' },
  tab: { flex: 1, background: 'none', border: 'none', color: '#94a3b8', padding: '8px', cursor: 'pointer', fontWeight: '600' },
  activeTab: { flex: '1', background: '#8b5cf6', border: 'none', color: '#fff', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', maxWidth: '600px' },
  input: { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' },
  primaryBtn: { width: '100%', padding: '12px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' },
  demoRow: { display: 'flex', gap: '8px', marginTop: '8px' },
  demoBtn: { flex: 1, padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  errorBox: { background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' },
  dashboardLayout: { display: 'flex', minHeight: '100vh', background: '#0b0d14', color: '#f8fafc' },
  sidebar: { width: '240px', background: '#121520', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', padding: '20px' },
  sidebarBrand: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '30px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  navBtn: { display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', color: '#94a3b8', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: '600' },
  activeNavBtn: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(139,92,246,0.15)', border: 'none', color: '#a78bfa', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: '600' },
  sidebarFooter: { display: 'flex', alignItems: 'center', justifyContent: 'between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', fontSize: '0.85rem' },
  iconBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' },
  mainContent: { flex: 1, padding: '32px', overflowY: 'auto' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' },
  badge: { background: 'rgba(139,92,246,0.1)', color: '#a78bfa', padding: '6px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  kpiCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' },
  kpiVal: { fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '8px' },
  feedbackCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px' },
  statusBadge: (status) => ({
    background: status === 'Resolved' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
    color: status === 'Resolved' ? '#34d399' : '#fbbf24',
    padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '700'
  }),
  actionBtn: { background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' },
  filterBar: { display: 'flex', gap: '12px', marginBottom: '16px' },
  searchInput: { flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', outline: 'none' },
  select: { padding: '8px 12px', background: '#121520', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', outline: 'none' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }
};