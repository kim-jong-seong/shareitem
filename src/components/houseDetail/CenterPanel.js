import React from 'react';
import ContainerCard from '../common/ContainerCard';
import boxTempIcon from '../../assets/icons/box_temp.svg';
import { getContainerIcon } from '../../utils/iconUtils';

const CenterPanel = ({
  currentPath,
  pathNames,
  selectedHouseName,
  children,
  selectedItem,
  tempStorage,
  loading,
  onItemClick,
  onDrillDown,
  onEdit,
  onDelete,
  onAddToTemp,
  onAddClick,
  onRemoveFromTemp,
  onClearAll,
  onMoveToHere
}) => {
  // 헤더 텍스트
  const headerText = currentPath.length === 0
    ? `› ${selectedHouseName}`
    : `› ${pathNames[pathNames.length - 1]}`;

  return (
    <div className="panel center-panel">
      <div className="panel-header">
        <span>{headerText}</span>
      </div>
      <div className="panel-content">
        {/* 임시보관함 영역 (항목이 있을 때만 표시) */}
        {tempStorage.length > 0 && (
          <div className="pc-temp-storage-section">
            <div className="pc-temp-storage-header">
              <span>
                <img src={boxTempIcon} alt="임시보관함" style={{ width: '16px', height: '16px', marginRight: '6px', verticalAlign: 'middle' }} />
                임시보관함 ({tempStorage.length})
              </span>
              <div className="pc-temp-header-actions">
                <button
                  className="pc-clear-all-button"
                  onClick={onClearAll}
                >
                  전체 취소
                </button>
                <button
                  className="pc-move-here-button"
                  onClick={onMoveToHere}
                >
                  여기로 이동
                </button>
              </div>
            </div>
            <div className="pc-temp-storage-items">
              {tempStorage.map((item, index) => (
                <div key={index} className="pc-temp-item">
                  <div className="pc-temp-item-icon">
                    <img src={getContainerIcon(item.type_cd)} alt="icon" style={{ width: '28px', height: '28px' }} />
                  </div>
                  <div className="pc-temp-item-info">
                    <div className="pc-temp-item-name">{item.name}</div>
                    <div className="pc-temp-item-location">
                      {item.from_house_name}
                      {item.path && ` › ${item.path}`}
                    </div>
                  </div>
                  <button
                    className="pc-temp-remove"
                    onClick={() => onRemoveFromTemp(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-box">로딩 중...</div>
        ) : (() => {
          const filteredChildren = children.filter(
            child => !tempStorage.some(temp => temp.id === child.id)
          );

          if (filteredChildren.length === 0) {
            return (
              <div className="empty-panel">
                <p>비어있습니다</p>
              </div>
            );
          }

          return (
            <>
              {filteredChildren.map((child, index) => (
                <ContainerCard
                  key={child.id}
                  container={child}
                  isActive={selectedItem?.id === child.id}
                  onClick={() => onItemClick(child)}
                  onDoubleClick={() => onDrillDown(child)}
                  onEdit={() => onEdit(child)}
                  onDelete={() => onDelete(child)}
                  onAddToTemp={() => onAddToTemp(child)}
                  animationDelay={`${index * 0.05}s`}
                />
              ))}
              <div
                className="add-item-footer"
                onClick={() => onAddClick(currentPath[currentPath.length - 1] || null)}
              >
                + 항목 추가
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default CenterPanel;
