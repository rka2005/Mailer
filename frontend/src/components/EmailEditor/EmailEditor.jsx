import { useMemo, useState } from 'react'
import Button from '../Button/Button'

const defaultTemplates = {
  Welcome: {
    subject: 'Welcome to our product',
    body: 'Hi {{name}},\n\nThanks for joining. We are excited to have you on board.\n\nBest,\nTeam',
  },
  FollowUp: {
    subject: 'Quick follow-up',
    body: 'Hi {{name}},\n\nJust checking in to see if you had any questions.\n\nRegards,\nTeam',
  },
  Promotion: {
    subject: 'A limited time offer',
    body: 'Hi {{name}},\n\nWe wanted to share a special offer with you today.\n\nCheers,\nTeam',
  },
}

function EmailEditor({ initialValue, onChange }) {
  const initialTemplate = useMemo(() => initialValue || defaultTemplates.Welcome, [initialValue])
  const [templateName, setTemplateName] = useState('Welcome')
  const [subject, setSubject] = useState(initialTemplate.subject)
  const [body, setBody] = useState(initialTemplate.body)

  const handleTemplateChange = (event) => {
    const nextName = event.target.value
    setTemplateName(nextName)

    if (defaultTemplates[nextName]) {
      setSubject(defaultTemplates[nextName].subject)
      setBody(defaultTemplates[nextName].body)
      onChange?.({ templateName: nextName, ...defaultTemplates[nextName] })
    }
  }

  const handleBodyChange = (event) => {
    const nextBody = event.target.value
    setBody(nextBody)
    onChange?.({ templateName, subject, body: nextBody })
  }

  const handleSubjectChange = (event) => {
    const nextSubject = event.target.value
    setSubject(nextSubject)
    onChange?.({ templateName, subject: nextSubject, body })
  }

  return (
    <div className="editor-shell">
      <div className="section-header">
        <div>
          <h3 className="section-title">Email composer</h3>
          <p className="muted">Choose a base template, then customize the subject and message.</p>
        </div>
        <select className="select" value={templateName} onChange={handleTemplateChange}>
          <option value="Welcome">Welcome</option>
          <option value="FollowUp">Follow-up</option>
          <option value="Promotion">Promotion</option>
        </select>
      </div>

      <div className="form">
        <div className="field">
          <label htmlFor="email-subject">Subject</label>
          <input id="email-subject" className="input" value={subject} onChange={handleSubjectChange} />
        </div>

        <div className="field">
          <label htmlFor="email-body">Body</label>
          <textarea id="email-body" className="textarea" value={body} onChange={handleBodyChange} />
        </div>
      </div>

      <div className="editor-preview">
        <p className="badge" style={{ marginBottom: 12 }}>
          Live preview
        </p>
        <h4 className="card-title">{subject}</h4>
        <p className="muted" style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>
          {body}
        </p>
        <div style={{ marginTop: 18 }}>
          <Button onClick={() => onChange?.({ templateName, subject, body })}>
            Save Template
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EmailEditor