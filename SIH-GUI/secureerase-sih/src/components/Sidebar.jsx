import React, { useState } from 'react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [sanitizationOpen, setSanitizationOpen] = useState(true); // Open by default since it has the active tab

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-shield">◆</div>
        <div>
          <h2>FORENSIC <span>CORE</span></h2>
        </div>
      </div>

      <nav className="side-nav">
        <button 
          className={activeTab === 'Dashboard' ? 'active' : ''} 
          onClick={() => setActiveTab('Dashboard')}
        >
          <span>⌂</span>Dashboard
        </button>

        <button 
          className={activeTab === 'Evidence' ? 'active' : ''} 
          onClick={() => setActiveTab('Evidence')}
        >
          <span>▰</span>Evidence / Disk Image
        </button>

        <div className="nav-group">
          <button 
            className={`group-header ${recoveryOpen ? 'open' : ''}`}
            onClick={() => setRecoveryOpen(!recoveryOpen)}
          >
            <span>⟳</span>File Recovery
            <span className="group-arrow">{recoveryOpen ? '▴' : '▾'}</span>
          </button>
          {recoveryOpen && (
            <div className="nav-subgroup">
              <button onClick={() => setActiveTab('Filesystem Analysis')} className={activeTab === 'Filesystem Analysis' ? 'active' : ''}>Filesystem Analysis</button>
              <button onClick={() => setActiveTab('Deleted Files')} className={activeTab === 'Deleted Files' ? 'active' : ''}>Deleted Files</button>
              <button onClick={() => setActiveTab('Raw File Carving')} className={activeTab === 'Raw File Carving' ? 'active' : ''}>Raw File Carving</button>
              <button onClick={() => setActiveTab('Reconstruction')} className={activeTab === 'Reconstruction' ? 'active' : ''}>Reconstruction</button>
              <button onClick={() => setActiveTab('Validation')} className={activeTab === 'Validation' ? 'active' : ''}>Validation</button>
            </div>
          )}
        </div>

        <div className="nav-group">
          <button 
            className={`group-header ${sanitizationOpen ? 'open' : ''}`}
            onClick={() => setSanitizationOpen(!sanitizationOpen)}
          >
            <span>▣</span>Sanitization
            <span className="group-arrow">{sanitizationOpen ? '▴' : '▾'}</span>
          </button>
          {sanitizationOpen && (
            <div className="nav-subgroup">
              <button onClick={() => setActiveTab('File Sanitization')} className={activeTab === 'File Sanitization' ? 'active' : ''}>File Sanitization</button>
              <button onClick={() => setActiveTab('Folder Sanitization')} className={activeTab === 'Folder Sanitization' ? 'active' : ''}>Folder Sanitization</button>
              <button onClick={() => setActiveTab('Disk Image Sanitization')} className={activeTab === 'Disk Image Sanitization' ? 'active' : ''}>Disk Image Sanitization</button>
              <button onClick={() => setActiveTab('Media Classification')} className={activeTab === 'Media Classification' ? 'active' : ''}>Media Classification</button>
              <button onClick={() => setActiveTab('Data Sanitization')} className={activeTab === 'Data Sanitization' ? 'active' : ''}>Data Sanitization (Legacy)</button>
            </div>
          )}
        </div>

        <button 
          className={activeTab === 'Analysis & Verification' ? 'active' : ''} 
          onClick={() => setActiveTab('Analysis & Verification')}
        >
          <span>◆</span>Analysis & Verification
        </button>

        <button 
          className={activeTab === 'Audit Trail' ? 'active' : ''} 
          onClick={() => setActiveTab('Audit Trail')}
        >
          <span>▤</span>Audit Trail
        </button>

        <button 
          className={activeTab === 'Reports & Certificates' ? 'active' : ''} 
          onClick={() => setActiveTab('Reports & Certificates')}
        >
          <span>◉</span>Reports & Certificates
        </button>

      </nav>

      <div className="sidebar-bottom">
        <button>
          <span>⚙</span>Settings
        </button>
        <button>
          <span>?</span>Help
        </button>
        <div className="sih-label">
          SIH 2026
          <small>Digital Forensics &<br />Data Sanitization</small>
        </div>
      </div>
    </aside>
  );
}
