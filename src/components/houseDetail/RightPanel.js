import React from 'react';
import ContainerDetail from './ContainerDetail/ContainerDetail';

/************************************************************
 * DESCRIPTION: RightPanel 컴포넌트
 *              오른쪽 패널로 선택된 항목의 상세 정보를 표시
 *              항목이 선택되지 않았을 때는 안내 메시지 표시
 *
 * PROPS:
 * - detailInfo: 상세 정보를 표시할 컨테이너 객체
 * - childPreview: 하위 항목 미리보기 배열
 * - tempStorage: 임시보관함 배열
 * - houseId: 집 ID
 * - houseName: 집 이름
 * - pathNames: 경로 이름 배열
 * - onEdit: 수정 함수
 * - onDelete: 삭제 함수
 * - onMoveToHere: 여기로 이동 함수
 * - onMoveSingleToHere: 단일 항목 이동 함수
 * - onRemoveFromTemp: 임시보관함에서 제거 함수
 * - onClearAll: 전체 취소 함수
 ************************************************************/
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
            {/* 패널 헤더 */}
            <div className="panel-header">
                <span>상세 정보</span>
            </div>

            <div className="panel-content">
                {detailInfo ? (
                    /* 항목이 선택되었을 때: 상세 정보 컴포넌트 표시 */
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
                        isMobile={false} // PC 모드
                    />
                ) : (
                    /* 항목이 선택되지 않았을 때: 안내 메시지 표시 */
                    <div className="empty-panel">
                        <p>항목을 선택하면 상세 정보가 표시됩니다</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RightPanel;
