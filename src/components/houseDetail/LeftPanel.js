import React from 'react';
import ContainerCard from '../common/ContainerCard';
import { houseIcon } from '../../utils/iconUtils';

/************************************************************
 * DESCRIPTION: LeftPanel 컴포넌트
 *              왼쪽 패널로 집 목록 또는 형제 컨테이너 목록을 표시
 *              현재 경로에 따라 다른 내용을 보여줌
 *
 * PROPS:
 * - currentPath: 현재 경로 배열 (컨테이너 ID)
 * - pathNames: 경로 이름 배열 (컨테이너 이름)
 * - selectedHouseName: 선택된 집 이름
 * - houses: 집 목록 배열
 * - siblings: 형제 컨테이너 목록 배열
 * - selectedItem: 선택된 항목
 * - tempStorage: 임시보관함 배열
 * - onHouseClick: 집 클릭 함수
 * - onHouseDoubleClick: 집 더블클릭 함수
 * - onSiblingClick: 형제 항목 클릭 함수
 * - onSiblingDoubleClick: 형제 항목 더블클릭 함수
 * - onEdit: 수정 함수
 * - onDelete: 삭제 함수
 * - onAddToTemp: 임시보관함 추가 함수
 ************************************************************/
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
    /************************************************************
     * DESCRIPTION: 패널 헤더 텍스트 생성
     *              현재 경로에 따라 다른 텍스트 표시
     *              - 루트: "내 집 목록"
     *              - 1단계: "집 이름"
     *              - 2단계 이상: "집 이름 › 부모 경로"
     ************************************************************/
    const headerText = currentPath.length === 0
        ? '내 집 목록'
        : currentPath.length === 1
            ? selectedHouseName
            : `${selectedHouseName} › ${pathNames.slice(0, -1).join(' › ')}`;

    return (
        <div className="panel left-panel">
            {/* 패널 헤더 */}
            <div className="panel-header">
                <span>{headerText}</span>
            </div>

            <div className="panel-content">
                {currentPath.length === 0 ? (
                    /* 루트 레벨: 집 목록 표시 */
                    <>
                        {houses.map((house, index) => (
                            <div
                                key={house.id}
                                className={`item-card ${selectedItem?.id === house.id ? 'active' : ''}`}
                                style={{ animationDelay: `${index * 0.05}s` }} // 순차 애니메이션
                                onClick={() => onHouseClick(house)}
                                onDoubleClick={() => onHouseDoubleClick(house)}
                            >
                                {/* 집 아이콘 */}
                                <div className="item-icon">
                                    <img src={houseIcon} alt="house" style={{ width: '32px', height: '32px' }} />
                                </div>

                                {/* 집 정보 */}
                                <div className="item-info">
                                    <div className="item-name">{house.name}</div>
                                    <div className="item-meta">
                                        <span>집 {house.container_count || 0}개 항목</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* 집이 없을 때 */}
                        {houses.length === 0 && (
                            <div className="empty-panel">
                                <p>등록된 집이 없습니다</p>
                            </div>
                        )}
                    </>
                ) : (
                    /* 집 내부: 형제 컨테이너 목록 표시 */
                    (() => {
                        /* 임시보관함에 담긴 항목은 제외하고 표시 */
                        const filteredSiblings = siblings.filter(
                            sibling => !tempStorage.some(temp => temp.id === sibling.id)
                        );

                        /* 형제 항목이 없을 때 */
                        if (filteredSiblings.length === 0) {
                            return (
                                <div className="empty-panel">
                                    <p>비어있습니다</p>
                                </div>
                            );
                        }

                        /* 형제 항목 카드 렌더링 */
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
