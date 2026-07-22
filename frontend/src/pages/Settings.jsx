import { useState } from 'react'
import { Bell, Shield, Palette } from 'lucide-react'
import Button from '../components/Button/Button'

function Settings() {
  // Track the color selected in the UI (but don't apply it yet)
  const [selectedColor, setSelectedColor] = useState(() => {
    return localStorage.getItem('app-theme-color') || '#4f8cff'
  })

  const colorOptions = [
    { name: 'Blue', hex: '#4f8cff' },
    { name: 'Purple', hex: '#8b5cf6' },
    { name: 'Green', hex: '#10b981' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Slate', hex: '#64748b' }
  ]

  // This function only runs when "Save settings" is clicked
  const handleSaveSettings = () => {
    // 1. Inject the color into the CSS
    document.documentElement.style.setProperty('--primary-color', selectedColor)
    
    // 2. Save it to local storage
    localStorage.setItem('app-theme-color', selectedColor)
    
    // Optional: You could add a toast notification here like "Settings saved!"
    alert("Settings saved successfully!") 
  }

  return (
    <section className="dashboard-card">
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Tune notification, security, and appearance defaults.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="panel" style={{ padding: 20 }}>
          <h3 className="section-title"><Bell size={16} /> Notifications</h3>
          <p className="muted">Email alerts for campaign completion and delivery issues.</p>
          <div className="stack" style={{ marginTop: 16 }}>
            <label className="badge"><input type="checkbox" defaultChecked /> Campaign complete</label>
            <label className="badge"><input type="checkbox" defaultChecked /> Failure alerts</label>
          </div>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <h3 className="section-title"><Shield size={16} /> Security</h3>
          <p className="muted">Control session timeout and protected access.</p>
          <div className="field" style={{ marginTop: 16 }}>
            <label>Session timeout</label>
            <select className="select">
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>1 hour</option>
            </select>
          </div>
        </div>

        <div className="panel" style={{ padding: 20, gridColumn: '1 / -1' }}>
          <h3 className="section-title"><Palette size={16} /> Appearance</h3>
          <p className="muted">Customize the primary color palette of your dashboard.</p>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            {colorOptions.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color.hex)}
                title={color.name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: color.hex,
                  border: selectedColor === color.hex ? '2px solid white' : '2px solid transparent',
                  outline: selectedColor === color.hex ? `2px solid ${color.hex}` : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                }}
                aria-label={`Select ${color.name} theme`}
              />
            ))}
          </div>

          <div style={{ marginTop: 18 }}>
            {/* Added onClick handler to the Save button */}
            <Button onClick={handleSaveSettings}>Save settings</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Settings