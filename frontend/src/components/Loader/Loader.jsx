function Loader({ label = 'Loading...' }) {
  return (
    <div className="empty-state">
      <div className="upload-icon spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}

export default Loader