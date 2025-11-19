import React from 'react';
import ContainerCard from '../common/ContainerCard';
import boxTempIcon from '../../assets/icons/box_temp.svg';
import { getContainerIcon } from '../../utils/iconUtils';
import MobileBottomSheet from '../common/MobileBottomSheet';
import ContainerDetail from './ContainerDetail/ContainerDetail';

const MobileLayout = ({
  children,
  tempStorage,
  loading,
  selectedItem,
  detailInfo,
  childPreview,
  showBottomSheet,
  houseId,
  houseName,
  pathNames,
  onItemClick,
  onEdit,
  onDelete,
  onAddToTemp,
  onRemoveFromTemp,
  onClearAll,
  onMoveToHere,
  onMoveSingleToHere,
  onDrillDownFromSheet,
  onCloseBottomSheet
}) => {
  return (
    <div className="mobile-layout">
      <div className="mobile-panel-content">
        <div className="mobile-panel-list">
          {/* 임시보관함 영역 (항목이 있을 때만 표시) */}
          {tempStorage.length > 0 && (
            <div className="mobile-temp-storage-section">
              <div className="mobile-temp-storage-header">
                <span>
                  <img src={boxTempIcon} alt="임시보관함" style={{ width: '16px', height: '16px', marginRight: '6px', verticalAlign: 'middle' }} />
                  임시보관함 ({tempStorage.length})
                </span>
                <div className="mobile-temp-header-actions">
                  <button
                    className="mobile-clear-all-button"
                    onClick={onClearAll}
                  >
                    전체 취소
                  </button>
                  <button
                    className="mobile-move-here-button"
                    onClick={onMoveToHere}
                  >
                    여기로 이동
                  </button>
                </div>
              </div>
              <div className="mobile-temp-storage-items">
                {tempStorage.map((item, index) => (
                  <div key={index} className="mobile-temp-item">
                    <div className="mobile-temp-item-icon">
                      <img src={getContainerIcon(item.type_cd)} alt="icon" style={{ width: '28px', height: '28px' }} />
                    </div>
                    <div className="mobile-temp-item-info">
                      <div className="mobile-temp-item-name">{item.name}</div>
                      <div className="mobile-temp-item-location">
                        {item.from_house_name}
                        {item.path && ` › ${item.path}`}
                      </div>
                    </div>
                    <button
                      className="mobile-temp-remove"
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
                    onEdit={() => onEdit(child)}
                    onDelete={() => onDelete(child)}
                    onAddToTemp={() => onAddToTemp(child)}
                    animationDelay={`${index * 0.05}s`}
                  />
                ))}
              </>
            );
          })()}
        </div>
      </div>

      {/* 모바일 바텀시트 */}
      <MobileBottomSheet isOpen={showBottomSheet} onClose={onCloseBottomSheet}>
        {detailInfo && (
          <ContainerDetail
            houseId={houseId}
            houseName={houseName}
            pathNames={pathNames}
            container={detailInfo}
            childPreview={childPreview}
            tempStorage={tempStorage}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveToHere={onMoveToHere}
            onMoveSingleToHere={onMoveSingleToHere}
            onRemoveFromTemp={onRemoveFromTemp}
            onClearAll={onClearAll}
            onDrillDown={onDrillDownFromSheet}
            isMobile={true}
          />
        )}
      </MobileBottomSheet>
    </div>
  );
};

export default MobileLayout;
