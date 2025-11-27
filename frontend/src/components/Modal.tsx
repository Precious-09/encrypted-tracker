export default function Modal({ show, message, onClose, children }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <p className="modal-message">{message}</p>
        {children && <div className="modal-extra">{children}</div>}
        <button className="modal-btn" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}
