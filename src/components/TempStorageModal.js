import React from 'react';
import '../styles/Modal.css';
import '../styles/TempStorageModal.css';

function TempStorageModal(props) {
  const [mouseDownTarget, setMouseDownTarget] = React.useState(null);
  const [mouseUpTarget, setMouseUpTarget] = React.useState(null);

  return (
    <div 
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setMouseDownTarget(e.currentTarget);
        } else {
          setMouseDownTarget(null);
        }
      }}
      onMouseUp={(e) => {
        if (e.target === e.currentTarget) {
          setMouseUpTarget(e.currentTarget);
        } else {
          setMouseUpTarget(null);
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && 
            mouseDownTarget === e.currentTarget && 
            mouseUpTarget === e.currentTarget) {
          props.onClose();
        }
      }}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📦 임시보관함</h3>
          <button className="modal-close" onClick={props.onClose}>✕</button>
        </div>

        <div className="modal-body">
          {props.tempStorage.length === 0 ? (
            <div className="search-status">임시보관함이 비어있습니다</div>
          ) : (
            <>
              {props.tempStorage.map((item, index) => (
                <div key={index} className="temp-item-modal">
                  <div className="item-icon" style={{ fontSize: '32px' }}>
                    {item.type_cd === 'COM1200001' ? '📁' :
                     item.type_cd === 'COM1200002' ? '📦' : '🏷️'}
                  </div>
                  <div className="temp-item-info">
                    <div className="temp-item-name">{item.name}</div>
                    <div className="temp-item-detail">
                      {item.type_cd === 'COM1200003' && item.quantity > 1 && `수량: ${item.quantity}개`}
                      {item.type_cd === 'COM1200003' && item.quantity > 1 && item.path && ' | '}
                      {item.path && `위치: ${item.path}`}
                    </div>
                  </div>
                  <button 
                    className="remove-button"
                    onClick={() => props.onRemove(index)}
                    title="제거"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TempStorageModal;