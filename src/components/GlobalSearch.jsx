import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, BookOpen, Users, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://appbackend.vwings247.me';

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/search/?q=${query}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setResults(data.data);
          }
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (type, item) => {
    setIsOpen(false);
    setQuery('');
    setResults(null);
    if (type === 'courses') {
      navigate(`/courses/${item.id}`);
    }
  };

  const hasResults = results && (
    results.students.length > 0 ||
    results.teachers.length > 0 ||
    results.counsellors.length > 0 ||
    results.courses.length > 0
  );

  return (
    <div className="global-search-container" ref={searchRef} style={{ position: 'relative' }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-main)'
          }}
          title="Search"
        >
          <Search size={18} />
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', borderRadius: '20px', padding: '0 12px', width: 'clamp(140px, 30vw, 250px)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '40px', transition: 'width 0.3s ease' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            autoFocus
            type="text"
            placeholder="Search courses, teachers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              padding: '8px',
              width: '100%',
              fontSize: '0.9rem'
            }}
          />
          <X
            size={16}
            color="var(--text-muted)"
            style={{ cursor: 'pointer' }}
            onClick={() => { setIsOpen(false); setQuery(''); setResults(null); }}
          />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && query && (
        <div className="search-dropdown">
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={24} className="spin" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : !hasResults ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No results found for "{query}"
            </div>
          ) : (
            <div style={{ padding: '12px 0' }}>
              {/* Courses */}
              {results.courses.length > 0 && (
                <div style={{ padding: '0 12px', marginBottom: results.teachers.length > 0 ? '12px' : '0' }}>
                  <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 8px 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Courses</h4>
                  {results.courses.map(c => (
                    <div
                      key={c.id}
                      onClick={() => handleResultClick('courses', c)}
                      style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={16} color="var(--primary)" />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-main)' }}>{c.name}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Teachers */}
              {results.teachers.length > 0 && (
                <div style={{ padding: '0 12px' }}>
                  <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 8px 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Teachers</h4>
                  {results.teachers.map(t => (
                    <div
                      key={t.id}
                      onClick={() => handleResultClick('teachers', t)}
                      style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {t.photo ? (
                        <img src={`${API_BASE}/${t.photo}`} alt={t.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Users size={16} color="var(--magenta)" />
                        </div>
                      )}
                      <div>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-main)' }}>{t.name}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instructor</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

