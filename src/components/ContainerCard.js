import React from 'react';
import '../styles/ContainerCard.css';

function ContainerCard(props) {
  // 타입별 아이콘
  const getIcon = () => {
    if (props.container.type_cd === 'COM1200001') return '📁'; // 영역
    if (props.container.type_cd === 'COM1200002') return '📦'; // 박스
    return '🏷️'; // 물품 (기본)
  };

  // 메타 정보
  const getMeta = () => {
    if (props.container.type_cd === 'COM1200003') {
      // 물품
      const parts = [];
      if (props.container.quantity && props.container.quantity > 1) {
        parts.push(`수량: ${props.container.quantity}개`);
      }
      if (props.container.owner_name) {
        parts.push(props.container.owner_name);
      }
      return parts;
    } else {
      // 영역/박스
      return [
        props.container.type_nm,
        `${props.container.child_count || 0}개 항목`
      ];
    }
  };

  const meta = getMeta();

  return (
    <div 
      className={`item-card ${props.isActive ? 'active' : ''}`}
      style={props.animationDelay ? { animationDelay: props.animationDelay } : {}}
      onClick={props.onClick}
      onDoubleClick={props.onDoubleClick}
    >
      <div className="item-icon">{getIcon()}</div>
      <div className="item-info">
        <div className="item-name">{props.container.name}</div>
        <div className="item-meta">
          {meta.map((text, index) => (
            <span 
              key={index}
              className={props.container.owner_name && text === props.container.owner_name ? 'item-badge owner' : ''}
            >
              {text}
            </span>
          ))}
        </div>
      </div>
      
      {/* 호버 시 액션 버튼 */}
      <div className="item-card-actions">
        <button 
          className="item-action-btn temp-btn" 
          onClick={(e) => {
            e.stopPropagation();
            props.onAddToTemp();
          }}
          title="임시보관함으로"
        >
          📦
        </button>
        <button 
          className="item-action-btn edit-btn"
          onClick={(e) => {
            e.stopPropagation();
            props.onEdit();
          }}
          title="수정"
        >
          ✏️
        </button>
        <button 
          className="item-action-btn delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            props.onDelete();
          }}
          title="삭제"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default ContainerCard;