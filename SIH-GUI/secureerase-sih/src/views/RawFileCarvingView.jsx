import React, { useState, useEffect } from 'react';

export default function RawFileCarvingView() {
  const [isCarving, setIsCarving] = useState(false);
  const [stats, setStats] = useState({ recovered: 0, valid: 0, partial: 0, invalid: 0 });
  const [logs, setLogs] = useState([{ type: 'READY', text: 'System initialized and ready' }]);
  const [drives, setDrives] = useState({ physical: [], logical: [] });
  const [targetType, setTargetType] = useState('logical'); // 'physical', 'logical', 'image'
  const [selectedTarget, setSelectedTarget] = useState('evidence.img'); // default
  const [isUploading, setIsUploading] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8002/api/drives")
      .then(res => res.json())
      .then(data => {
        setDrives(data);
      })
      .catch(err => console.error("Failed to load drives:", err));
  }, []);


  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setLogs(prev => [...prev, { type: 'INFO', text: `Uploading ${file.name}...` }]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8002/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setSelectedTarget(data.target);
        setLogs(prev => [...prev, { type: 'SUCCESS', text: `Upload complete: ${data.target}` }]);
      } else {
        setLogs(prev => [...prev, { type: 'ERROR', text: `Upload failed: ${data.error}` }]);
      }
    } catch (error) {
      console.error(error);
      setLogs(prev => [...prev, { type: 'ERROR', text: 'Upload failed.' }]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartCarving = async () => {
    setModalData(null);
    setIsCarving(true);
    setLogs(prev => [...prev, { type: 'INFO', text: 'Starting raw file carving...' }]);
    
    try {
      const response = await fetch("http://127.0.0.1:8002/api/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "carving", target: selectedTarget })
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        let valid = 0, partial = 0, invalid = 0;
        data.files.forEach(f => {
          if (f.status === 'VALID') valid++;
          else if (f.status === 'PARTIAL') partial++;
          else invalid++;
        });

        setStats({ 
          recovered: data.total_recovered, 
          valid, 
          partial, 
          invalid,
          files: data.files 
        });

        setLogs(prev => [
          ...prev, 
          { type: 'SUCCESS', text: `Carving complete. ${data.total_recovered} files recovered.` },
          { type: 'VALIDATE', text: 'Validation finished.' }
        ]);
        setModalData({ title: 'RECOVERY SUCCESSFUL', message: `Successfully recovered ${data.total_recovered} files.`, success: true, result: data });
      } else {
        setLogs(prev => [...prev, { type: 'ERROR', text: data.detail || 'Recovery failed.' }]);
        setModalData({ title: 'Recovery Failed', message: 'Failed to recover files. Check logs.', success: false });
      }
    } catch (error) {
      console.error(error);
      setLogs(prev => [...prev, { type: 'ERROR', text: 'Failed to connect to backend engine.' }]);
        setModalData({ title: 'Recovery Failed', message: 'Failed to recover files. Check logs.', success: false });
    } finally {
      setIsCarving(false);
    }
  };

  return (
    <div className="content">
      <div className="page-header">
        <div className="page-title">
          <div>
            <h1>Raw File Carving</h1>
            <p>Recover files directly from disk images without filesystem metadata.</p>
          </div>
        </div>
      </div>

      <div className="main-grid" style={{ marginBottom: '20px' }}>
        
        {/* LEFT COLUMN */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Target Selection Card */}
          <div className="panel configuration">
            <div className="panel-title">
              <span style={{ color: '#00f0ff' }}>▰</span>
              <h2 className="raw-carving-section-title">Target Selection</h2>
            </div>

            <div className="target-grid carving-target-grid">
              <button
                className={`target-card carving-target-card ${targetType === 'physical' ? 'selected' : ''}`}
                onClick={() => { setTargetType('physical'); if (drives.physical.length) setSelectedTarget(drives.physical[0].id); else setSelectedTarget('evidence.img'); }}
              >
                Physical Drive
              </button>
              <button
                className={`target-card carving-target-card ${targetType === 'logical' ? 'selected' : ''}`}
                onClick={() => { setTargetType('logical'); if (drives.logical.length) setSelectedTarget(drives.logical[0].id); else setSelectedTarget('evidence.img'); }}
              >
                Logical Volume
              </button>
              <button
                className={`target-card carving-target-card ${targetType === 'image' ? 'selected' : ''}`}
                onClick={() => { setTargetType('image'); setSelectedTarget(''); }}
              >
                Disk Image
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#879bb5', marginBottom: '5px', textTransform: 'uppercase' }}>
                {targetType === 'image' ? 'Upload Image (.img, .dd)' : 'Select Drive / Volume'}
              </label>
              {targetType === 'image' ? (
                <div>
                  <input type="file" id="disk-image-upload" style={{ display: 'none' }} accept=".img,.dd,.iso,.bin" onChange={handleFileUpload} />
                  <button onClick={() => document.getElementById('disk-image-upload').click()} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid #1a334e', borderRadius: '4px', cursor: 'pointer' }}>
                    {isUploading ? 'Uploading...' : 'Browse for Image File...'}
                  </button>
                </div>
              ) : (
                <select
                  value={selectedTarget}
                  onChange={e => setSelectedTarget(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid #1a334e', borderRadius: '4px' }}
                >
                  <option value="evidence.img">Simulated evidence.img</option>
                  {drives[targetType]?.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.size_gb} GB)</option>
                  ))}
                </select>
              )}
            </div>

            <div className="drive-details">
              <div>
                <span>Target Path</span>
                <strong style={{ fontFamily: 'monospace', color: '#a855f7', wordBreak: 'break-all' }}>{selectedTarget || 'No file selected'}</strong>
              </div>
              <div>
                <span>Access Level</span>
                <strong style={{ color: '#f59e0b' }}>
                  {targetType === 'physical' ? 'Raw Block Access (Admin)' : targetType === 'logical' ? 'Filesystem Level' : 'Image File Parsing'}
                </strong>
              </div>
            </div>
          </div>

          {/* Control Card */}
          <div className="panel configuration">
            <div className="panel-title">
              <span style={{ color: '#00f0ff' }}>◷</span>
              <h2 className="raw-carving-section-title">Recovery Operations</h2>
            </div>
            
            <button 
              className="start-button" 
              onClick={handleStartCarving}
              disabled={isCarving}
              style={{ width: '100%', padding: '15px', background: isCarving ? '#1d3854' : 'linear-gradient(90deg, #00bd8d, #08caa0)', opacity: isCarving ? 0.7 : 1 }}
            >
              <span style={{ fontSize: '15px' }}>{isCarving ? 'Carving in progress...' : '▶ Start Raw Carving'}</span>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '20px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #1a334e', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', color: '#00f0ff' }}>{stats.recovered}</div>
                <div style={{ fontSize: '11px', color: '#879bb5', textTransform: 'uppercase' }}>Recovered</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #1a334e', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', color: '#10b981' }}>{stats.valid}</div>
                <div style={{ fontSize: '11px', color: '#879bb5', textTransform: 'uppercase' }}>Valid</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #1a334e', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', color: '#f59e0b' }}>{stats.partial}</div>
                <div style={{ fontSize: '11px', color: '#879bb5', textTransform: 'uppercase' }}>Partial</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #1a334e', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', color: '#f43f5e' }}>{stats.invalid}</div>
                <div style={{ fontSize: '11px', color: '#879bb5', textTransform: 'uppercase' }}>Invalid</div>
              </div>
            </div>

          </div>

        </section>

        {/* RIGHT COLUMN */}
        <aside className="right-column">
          {/* Operation Logs */}
          <div className="panel side-panel">
            <h2 className="raw-carving-section-title"><span style={{ color: '#f59e0b' }}>▤</span> &nbsp; Operation Logs</h2>
            <div style={{ 
              background: 'rgba(0,0,0,0.5)', 
              border: '1px solid #1a334e', 
              borderRadius: '6px', 
              padding: '15px', 
              height: '250px', 
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: '1.6'
            }}>
              {logs.map((log, i) => (
                <div key={i} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#00f0ff' }}>[{log.type}]</span> {log.text}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #1a334e' }}>
              <div className="drive-details">
                <div>
                  <span>Signatures Detected</span>
                  <strong style={{ color: '#a855f7' }}>{stats.recovered}</strong>
                </div>
                <div>
                  <span>Output Directory</span>
                  <strong>/recovered</strong>
                </div>
              </div>
            </div>
          </div>

        </aside>

      </div>

      {/* Recovered Files Table */}
      <div className="panel recent">
        <div className="recent-header">
          <div className="panel-title">
            <span style={{ color: '#a855f7' }}>▣</span>
            <h2 className="raw-carving-section-title">Recovered Files</h2>
          </div>
        </div>
        <table style={{ width: '100%', marginTop: '10px' }}>
          <thead>
            <tr>
              <th>Filename</th>
              <th>Type</th>
              <th>Size</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stats.recovered > 0 ? (
              stats.files && stats.files.map((file, idx) => (
                <tr key={idx}>
                  <td style={{ fontFamily: 'monospace' }}>{file.filename}</td>
                  <td>{file.filename.split('.').pop().toUpperCase()}</td>
                  <td>{file.size_mb} MB</td>
                  <td>
                    <span style={{ color: file.status === 'VALID' ? '#10b981' : file.status === 'PARTIAL' ? '#f59e0b' : '#f43f5e' }}>
                      {file.status}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => window.open("http://127.0.0.1:8002/recovered/" + file.filename, "_blank")} style={{background: '#238636', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>
                      Open
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#879bb5' }}>
                  Ready for raw carving. Click "Start Raw Carving" to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

            {modalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '24px', width: '550px', maxWidth: '90%', color: '#e6edf3', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h2 style={{ marginTop: 0, color: modalData.success ? '#3fb950' : '#f85149', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {modalData.success ? 'o.' : 'o-'} {modalData.title}
            </h2>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '14px', background: '#0d1117', padding: '15px', borderRadius: '6px', border: '1px solid #30363d' }}>
              {modalData.message}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
              {modalData.result && (
                <button onClick={() => { const blob = new Blob([JSON.stringify(modalData.result, null, 2)], { type: 'application/json' }); window.open(URL.createObjectURL(blob), '_blank'); }} style={{ background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  View JSON Report
                </button>
              )}
              <button onClick={() => setModalData(null)} style={{ background: modalData.success ? '#238636' : '#da3633', border: '1px solid', borderColor: modalData.success ? '#2ea043' : '#f85149', color: '#ffffff', padding: '8px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
