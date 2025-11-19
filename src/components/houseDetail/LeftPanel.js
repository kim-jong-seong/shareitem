import React from 'react';
import ContainerCard from '../common/ContainerCard';
import { houseIcon } from '../../utils/iconUtils';

const LeftPanel = ({
  currentPath,
  pathNames,
  selectedHouseName,
  houses,
  siblings,
  selectedItem,
  tempStorage,
  onHouseClick,
  onHouseDoubleClick,
  onSiblingClick,
  onSiblingDoubleClick,
  onEdit,
  onDelete,
  onAddToTemp
}) => {
  // 헤더 텍스트
  const headerText = currentPath.length === 0
    ? ' 내 집 목록'
    : currentPath.length === 1
      ? selectedHouseName
      : `${selectedHouseName} › ${pathNames.slice(0, -1).join(' › ')}`;

  return (
    <div className="panel left-panel">
      <div className="panel-header">
        <span>{headerText}</span>
      </div>
      <div className="panel-content">
        {currentPath.length === 0 ? (
          // 집 목록
          <>
            {houses.map((house, index) => (
              <div
                key={house.id}
                className={`item-card ${selectedItem?.id === house.id ? 'active' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => onHouseClick(house)}
                onDoubleClick={() => onHouseDoubleClick(house)}
              >
                <div className="item-icon">
                  <img src={houseIcon} alt="house" style={{ width: '32px', height: '32px' }} />
                </div>
                <div className="item-info">
                  <div className="item-name">{house.name}</div>
                  <div className="item-meta">
                    <span>집 {house.container_count || 0}개 항목</span>
                  </div>
                </div>
              </div>
            ))}

            {houses.length === 0 && (
              <div className="empty-panel">
                <p>등록된 집이 없습니다</p>
              </div>
            )}
          </>
        ) : (
          // 형제 목록
          (() => {
            const filteredSiblings = siblings.filter(
              sibling => !tempStorage.some(temp => temp.id === sibling.id)
            );

            if (filteredSiblings.length === 0) {
              return (
                <div className="empty-panel">
                  <p>비어있습니다</p>
                </div>
              );
            }

            return (
              <>
                {filteredSiblings.map((sibling, index) => (
                  <ContainerCard
                    key={sibling.id}
                    container={sibling}
                    isActive={selectedItem?.id === sibling.id}
                    onClick={() => onSiblingClick(sibling)}
                    onDoubleClick={() => onSiblingDoubleClick(sibling)}
                    onEdit={() => onEdit(sibling)}
                    onDelete={() => onDelete(sibling)}
                    onAddToTemp={() => onAddToTemp(sibling)}
                    animationDelay={`${index * 0.05}s`}
                  />
                ))}
              </>
            );
          })()
        )}
      </div>
    </div>
  );
};

export default LeftPanel;
