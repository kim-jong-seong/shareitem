import React from 'react';
import ContainerCard from '../common/ContainerCard';
import boxTempIcon from '../../assets/icons/box_temp.svg';
import { getContainerIcon } from '../../utils/iconUtils';

/************************************************************
 * DESCRIPTION: CenterPanel 컴포넌트
 *              중앙 패널로 선택된 항목의 하위 항목들을 표시
 *              임시보관함 영역도 함께 표시
 *
 * PROPS:
 * - currentPath: 현재 경로 배열 (컨테이너 ID)
 * - pathNames: 경로 이름 배열 (컨테이너 이름)
 * - selectedHouseName: 선택된 집 이름
 * - children: 하위 항목 배열
 * - selectedItem: 선택된 항목
 * - tempStorage: 임시보관함 배열
 * - loading: 로딩 상태
 * - onItemClick: 항목 클릭 함수
 * - onDrillDown: 더블클릭(드릴다운) 함수
 * - onEdit: 수정 함수
 * - onDelete: 삭제 함수
 * - onAddToTemp: 임시보관함 추가 함수
 * - onAddClick: 항목 추가 클릭 함수
 * - onRemoveFromTemp: 임시보관함에서 제거 함수
 * - onClearAll: 전체 취소 함수
 * - onMoveToHere: 여기로 이동 함수
 ************************************************************/
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
    /************************************************************
     * DESCRIPTION: 패널 헤더 텍스트 생성
     *              현재 위치에 따라 집 이름 또는 마지막 경로 표시
     ************************************************************/
    const headerText = currentPath.length === 0
        ? `› ${selectedHouseName}`
        : `› ${pathNames[pathNames.length - 1]}`;

    return (
        <div className="panel center-panel">
            {/* 패널 헤더 */}
            <div className="panel-header">
                <span>{headerText}</span>
            </div>

            <div className="panel-content">
                {/* 임시보관함 영역 (항목이 있을 때만 표시) */}
                {tempStorage.length > 0 && (
                    <div className="pc-temp-storage-section">
                        {/* 임시보관함 헤더 */}
                        <div className="pc-temp-storage-header">
                            <span>
                                <img src={boxTempIcon} alt="임시보관함" style={{ width: '16px', height: '16px', marginRight: '6px', verticalAlign: 'middle' }} />
                                임시보관함 ({tempStorage.length})
                            </span>

                            {/* 임시보관함 액션 버튼들 */}
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

                        {/* 임시보관함 항목 목록 */}
                        <div className="pc-temp-storage-items">
                            {tempStorage.map((item, index) => (
                                <div key={index} className="pc-temp-item">
                                    {/* 항목 아이콘 */}
                                    <div className="pc-temp-item-icon">
                                        <img src={getContainerIcon(item.type_cd)} alt="icon" style={{ width: '28px', height: '28px' }} />
                                    </div>

                                    {/* 항목 정보 */}
                                    <div className="pc-temp-item-info">
                                        <div className="pc-temp-item-name">{item.name}</div>
                                        <div className="pc-temp-item-location">
                                            {/* 원래 위치 표시 */}
                                            {item.from_house_name}
                                            {item.path && ` › ${item.path}`}
                                        </div>
                                    </div>

                                    {/* 제거 버튼 */}
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
                                    onDoubleClick={() => onDrillDown(child)} // 더블클릭 시 하위로 이동
                                    onEdit={() => onEdit(child)}
                                    onDelete={() => onDelete(child)}
                                    onAddToTemp={() => onAddToTemp(child)}
                                    animationDelay={`${index * 0.05}s`}
                                />
                            ))}

                            {/* 항목 추가 푸터 */}
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
