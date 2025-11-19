import React from 'react';
import ContainerDetail from './ContainerDetail/ContainerDetail';

const RightPanel = ({
  detailInfo,
  childPreview,
  tempStorage,
  houseId,
  houseName,
  pathNames,
  onEdit,
  onDelete,
  onMoveToHere,
  onMoveSingleToHere,
  onRemoveFromTemp,
  onClearAll
}) => {
  return (
    <div className="panel right-panel">
      <div className="panel-header">
        <span>상세 정보</span>
      </div>
      <div className="panel-content">
        {detailInfo ? (
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
            isMobile={false}
          />
        ) : (
          <div className="empty-panel">
            <p>항목을 선택하면 상세 정보가 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
