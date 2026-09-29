with open('SIH-GUI/secureerase-sih/src/views/RawFileCarvingView.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

import re
# find {modalData && (
idx = text.find('{modalData && (')
if idx != -1:
    before = text[:idx]
    after = '''      {modalData && (
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
'''
    with open('SIH-GUI/secureerase-sih/src/views/RawFileCarvingView.jsx', 'w', encoding='utf-8') as f:
        f.write(before + after)
