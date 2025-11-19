import React from 'react';
import { getContainerIcon } from '../../utils/iconUtils';
import boxTempIcon from '../../assets/icons/box_temp.svg';
import '../../styles/ContainerCard.css';

function ContainerCard(props) {
  // 타입별 아이콘
  const getIcon = () => {
    return getContainerIcon(props.container.type_cd);
  };

  // 메타 정보
  const getMeta = () => {
    if (props.container.type_cd === 'COM1200003') {
      // 물품
      const parts = [];
      if (props.container.owner_name) {
        parts.push(props.container.owner_name);
      }
      if (props.container.quantity && props.container.quantity > 1) {
        parts.push(`수량: ${props.container.quantity}개`);
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
      data-container-id={props.container.id}
    >
      <div className="item-icon">
        <img src={getIcon()} alt="icon" style={{ width: '32px', height: '32px' }} />
      </div>
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

      {/* 호버 시 액션 버튼 (임시보관함만) */}
      <div className="item-card-actions">
        <button
          className="item-action-btn temp-btn"
          onClick={(e) => {
            e.stopPropagation();
            props.onAddToTemp();
          }}
          title="임시보관함으로"
        >
          <img src={boxTempIcon} alt="임시보관함" style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
    </div>
  );
}

export default ContainerCard;