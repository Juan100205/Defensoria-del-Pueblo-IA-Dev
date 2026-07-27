interface ModalProps {
  open: boolean;
  title: string;
  body: string;
  footer?: string;
  onClose: () => void;
}

export function Modal({ open, title, body, footer, onClose }: ModalProps) {
  return (
    <div
      className={`ov ${open ? 'on' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="hd">
          <h3 style={{ fontSize: '16px' }}>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <span style={{ fontSize: '18px' }}>×</span>
          </button>
        </div>
        <div className="bd" dangerouslySetInnerHTML={{ __html: body }} />
        {footer && (
          <div className="ft" dangerouslySetInnerHTML={{ __html: footer }} />
        )}
      </div>
    </div>
  );
}
