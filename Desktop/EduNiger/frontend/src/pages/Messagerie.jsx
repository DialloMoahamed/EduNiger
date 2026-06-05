import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function api(path, options = {}) {
  const token = localStorage.getItem('token') || localStorage.getItem('parent_token');
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
  }).then(r => r.json());
}

const ROLE_LABELS = { admin: 'Admin', enseignant: 'Enseignant', parent: 'Parent' };
const ROLE_COLORS = { admin: '#7c3aed', enseignant: '#0A5C36', parent: '#1565c0' };

function Avatar({ nom, prenom, role, size = 38 }) {
  const initials = `${(prenom||'?')[0]}${(nom||'?')[0]}`.toUpperCase();
  const color    = ROLE_COLORS[role] || '#64748b';
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color + '22',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, color, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000)    return 'À l\'instant';
  if (diff < 3600000)  return `${Math.floor(diff/60000)} min`;
  if (diff < 86400000) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function formatFull(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
}

export default function Messagerie() {
  const { user }              = useAuth();
  const [contacts, setContacts]       = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv]   = useState(null);   // { conversation, messages }
  const [activeUser, setActiveUser]   = useState(null);
  const [texte, setTexte]             = useState('');
  const [sending, setSending]         = useState(false);
  const [search, setSearch]           = useState('');
  const [panel, setPanel]             = useState('convs'); // 'convs' | 'contacts'
  const [loading, setLoading]         = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    loadContacts();
    loadConversations();
    // Rafraîchir les messages toutes les 10s
    const interval = setInterval(() => {
      loadConversations();
      if (activeUser) loadConversation(activeUser.id, false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const loadContacts = async () => {
    const d = await api('/messages/contacts');
    if (d.success) setContacts(d.contacts);
  };

  const loadConversations = async () => {
    const d = await api('/messages/conversations');
    if (d.success) setConversations(d.conversations);
  };

  const loadConversation = async (userId, scroll = true) => {
    setLoading(true);
    const d = await api(`/messages/conversation/${userId}`);
    if (d.success) {
      setActiveConv(d);
      setActiveUser(d.conversation.autre);
      loadConversations(); // MAJ badge non lus
      if (scroll) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
    setLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!texte.trim() || !activeConv) return;
    setSending(true);
    const d = await api('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ conversation_id: activeConv.conversation.id, contenu: texte.trim() }),
    });
    if (d.success) {
      setActiveConv(prev => ({ ...prev, messages: [...prev.messages, d.message] }));
      setTexte('');
      loadConversations();
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const filteredContacts = contacts.filter(c =>
    `${c.prenom} ${c.nom}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredConvs = conversations.filter(c =>
    `${c.autre_prenom} ${c.autre_nom}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalNonLus = conversations.reduce((s, c) => s + (c.non_lus || 0), 0);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden',
      background: 'var(--bg)' }}>

      {/* ══ PANNEAU GAUCHE ══ */}
      <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)' }}>

        {/* Header */}
        <div style={{ padding: '18px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>💬</span>
              Messages
              {totalNonLus > 0 && (
                <span style={{ background: '#0A5C36', color: '#fff', fontSize: 11, fontWeight: 600,
                  padding: '1px 7px', borderRadius: 10 }}>{totalNonLus}</span>
              )}
            </div>
          </div>
          {/* Barre de recherche */}
          <div style={{ position: 'relative' }}>
            <span>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..." style={{ width: '100%', boxSizing: 'border-box',
                paddingLeft: 32, fontSize: 13, height: 34 }} />
          </div>
          {/* Tabs convs / contacts */}
          <div style={{ display: 'flex', marginTop: 10, gap: 4 }}>
            {[['convs','Conversations'],['contacts','Nouveau']].map(([id, label]) => (
              <button key={id} onClick={() => setPanel(id)}
                style={{ flex: 1, padding: '5px 0', fontSize: 12, border: '1px solid var(--border)',
                  borderRadius: 6, background: panel === id ? '#0A5C36' : 'var(--bg)',
                  color: panel === id ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: panel === id ? 500 : 400 }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {panel === 'convs' ? (
            filteredConvs.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Aucune conversation.<br/>Cliquez sur "Nouveau" pour commencer.
              </div>
            ) : filteredConvs.map(c => (
              <div key={c.id} onClick={() => loadConversation(c.autre_id)}
                style={{ display: 'flex', gap: 10, padding: '12px 14px', cursor: 'pointer',
                  background: activeUser?.id === c.autre_id ? '#0A5C3610' : 'transparent',
                  borderLeft: activeUser?.id === c.autre_id ? '3px solid #0A5C36' : '3px solid transparent',
                  borderBottom: '1px solid var(--border)' }}>
                <Avatar nom={c.autre_nom} prenom={c.autre_prenom} role={c.autre_role} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: c.non_lus > 0 ? 600 : 500,
                      color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.autre_prenom} {c.autre_nom}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 4 }}>
                      {formatTime(c.dernier_msg_at)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <div style={{ fontSize: 12, color: c.non_lus > 0 ? 'var(--text-secondary)' : 'var(--text-muted)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {c.dernier_msg?.substring(0, 45)}{c.dernier_msg?.length > 45 ? '...' : ''}
                    </div>
                    {c.non_lus > 0 && (
                      <span style={{ background: '#0A5C36', color: '#fff', fontSize: 10, fontWeight: 600,
                        padding: '1px 6px', borderRadius: 10, flexShrink: 0, marginLeft: 6 }}>
                        {c.non_lus}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: ROLE_COLORS[c.autre_role], marginTop: 2 }}>
                    {ROLE_LABELS[c.autre_role]}
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Liste des contacts pour nouvelle conversation */
            filteredContacts.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Aucun contact disponible
              </div>
            ) : filteredContacts.map(c => (
              <div key={c.id} onClick={() => { loadConversation(c.id); setPanel('convs'); }}
                style={{ display: 'flex', gap: 10, padding: '11px 14px', cursor: 'pointer',
                  background: 'transparent', borderBottom: '1px solid var(--border)',
                  transition: 'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Avatar nom={c.nom} prenom={c.prenom} role={c.role} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {c.prenom} {c.nom}
                  </div>
                  <div style={{ fontSize: 11, color: ROLE_COLORS[c.role] }}>{ROLE_LABELS[c.role]}</div>
                </div>
                {c.non_lus > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#0A5C36', color: '#fff',
                    fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, alignSelf: 'center' }}>
                    {c.non_lus}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ══ ZONE DE CHAT ══ */}
      {activeConv ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header chat */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)',
            background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar nom={activeUser?.nom} prenom={activeUser?.prenom} role={activeUser?.role} size={40} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
                {activeUser?.prenom} {activeUser?.nom}
              </div>
              <div style={{ fontSize: 12, color: ROLE_COLORS[activeUser?.role] }}>
                {ROLE_LABELS[activeUser?.role]}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>Chargement...</div>
            )}
            {activeConv.messages.length === 0 && !loading && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '40px 0' }}>
                Aucun message. Commencez la conversation !
              </div>
            )}
            {activeConv.messages.map((m, i) => {
              const isMoi = m.sender_id === user?.id;
              const showDate = i === 0 || formatFull(activeConv.messages[i-1]?.created_at).split(' ')[0] !== formatFull(m.created_at).split(' ')[0];
              return (
                <div key={m.id}>
                  {showDate && (
                    <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)',
                      margin: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                      {new Date(m.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
                      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: isMoi ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                    {!isMoi && <Avatar nom={m.nom} prenom={m.prenom} role={m.role} size={28} />}
                    <div style={{ maxWidth: '65%' }}>
                      <div style={{
                        padding: '10px 14px', borderRadius: isMoi ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                        background: isMoi ? '#0A5C36' : 'var(--bg-card)',
                        color: isMoi ? '#fff' : 'var(--text-primary)',
                        fontSize: 14, lineHeight: 1.5,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                        border: isMoi ? 'none' : '1px solid var(--border)',
                        wordBreak: 'break-word',
                      }}>
                        {m.contenu}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3,
                        textAlign: isMoi ? 'right' : 'left' }}>
                        {formatFull(m.created_at)}
                        {isMoi && <span style={{ marginLeft: 4 }}>{m.lu ? ' ✓✓' : ' ✓'}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Zone de saisie */}
          <form onSubmit={handleSend} style={{ padding: '12px 20px', borderTop: '1px solid var(--border)',
            background: 'var(--bg-card)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={texte}
              onChange={e => setTexte(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
              placeholder="Écrire un message... (Entrée pour envoyer, Shift+Entrée pour saut de ligne)"
              rows={1}
              style={{ flex: 1, resize: 'none', fontSize: 14, padding: '10px 14px',
                border: '1px solid var(--border)', borderRadius: 12,
                background: 'var(--bg)', maxHeight: 120, overflowY: 'auto',
                lineHeight: 1.5 }}
            />
            <button type="submit" disabled={!texte.trim() || sending}
              style={{ width: 42, height: 42, borderRadius: '50%', border: 'none',
                background: texte.trim() ? '#0A5C36' : 'var(--bg)',
                color: texte.trim() ? '#fff' : 'var(--text-muted)',
                cursor: texte.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background .15s' }}>
              <span>➤</span>
            </button>
          </form>
        </div>
      ) : (
        /* État vide */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', color: 'var(--text-muted)' }}>
          <span>💬</span>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Vos messages</div>
          <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 280 }}>
            Sélectionnez une conversation ou cliquez sur "Nouveau" pour écrire à quelqu'un.
          </div>
        </div>
      )}
    </div>
  );
}
