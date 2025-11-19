import React from 'react';
import ContainerCard from '../common/ContainerCard';
import boxTempIcon from '../../assets/icons/box_temp.svg';
import { getContainerIcon } from '../../utils/iconUtils';
import MobileBottomSheet from '../common/MobileBottomSheet';
import ContainerDetail from './ContainerDetail/ContainerDetail';

/************************************************************
 * DESCRIPTION: MobileLayout 컴포넌트
 *              모바일 화면 레이아웃
 *              하위 항목 목록과 바텀시트로 상세 정보 표시
 *
 * PROPS:
 * - children: 하위 항목 배열
 * - tempStorage: 임시보관함 배열
 * - loading: 로딩 상태
 * - selectedItem: 선택된 항목
 * - detailInfo: 상세 정보 객체
 * - childPreview: 하위 항목 미리보기 배열
 * - showBottomSheet: 바텀시트 표시 여부
 * - houseId: 집 ID
 * - houseName: 집 이름
 * - pathNames: 경로 이름 배열
 * - onItemClick: 항목 클릭 함수
 * - onEdit: 수정 함수
 * - onDelete: 삭제 함수
 * - onAddToTemp: 임시보관함 추가 함수
 * - onRemoveFromTemp: 임시보관함에서 제거 함수
 * - onClearAll: 전체 취소 함수
 * - onMoveToHere: 여기로 이동 함수
 * - onMoveSingleToHere: 단일 항목 이동 함수
 * - onDrillDownFromSheet: 바텀시트에서 드릴다운 함수
 * - onCloseBottomSheet: 바텀시트 닫기 함수
 ************************************************************/
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
                            {/* 임시보관함 헤더 */}
                            <div className="mobile-temp-storage-header">
                                <span>
                                    <img src={boxTempIcon} alt="임시보관함" style={{ width: '16px', height: '16px', marginRight: '6px', verticalAlign: 'middle' }} />
                                    임시보관함 ({tempStorage.length})
                                </span>

                                {/* 임시보관함 액션 버튼들 */}
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

                            {/* 임시보관함 항목 목록 */}
                            <div className="mobile-temp-storage-items">
                                {tempStorage.map((item, index) => (
                                    <div key={index} className="mobile-temp-item">
                                        {/* 항목 아이콘 */}
                                        <div className="mobile-temp-item-icon">
                                            <img src={getContainerIcon(item.type_cd)} alt="icon" style={{ width: '28px', height: '28px' }} />
                                        </div>

                                        {/* 항목 정보 */}
                                        <div className="mobile-temp-item-info">
                                            <div className="mobile-temp-item-name">{item.name}</div>
                                            <div className="mobile-temp-item-location">
                                                {/* 원래 위치 표시 */}
                                                {item.from_house_name}
                                                {item.path && ` › ${item.path}`}
                                            </div>
                                        </div>

                                        {/* 제거 버튼 */}
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

                    {/* 하위 항목 목록 */}
                    {loading ? (
                        /* 로딩 중 */
                        <div className="loading-box">로딩 중...</div>
                    ) : (() => {
                        /* 임시보관함에 담긴 항목은 제외하고 표시 */
                        const filteredChildren = children.filter(
                            child => !tempStorage.some(temp => temp.id === child.id)
                        );

                        /* 하위 항목이 없을 때 */
                        if (filteredChildren.length === 0) {
                            return (
                                <div className="empty-panel">
                                    <p>비어있습니다</p>
                                </div>
                            );
                        }

                        /* 하위 항목 카드 렌더링 */
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

            {/* 모바일 바텀시트 (상세 정보 표시) */}
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
                        isMobile={true} // 모바일 모드
                    />
                )}
            </MobileBottomSheet>
        </div>
    );
};

export default MobileLayout;
