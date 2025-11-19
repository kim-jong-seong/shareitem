import React, { useState } from 'react';
import BasicInfoTab from './BasicInfoTab';
import HistoryTab from './HistoryTab';
import { getContainerIcon } from '../../../utils/iconUtils';
import editIcon from '../../../assets/icons/edit.svg';
import deleteIcon from '../../../assets/icons/delete.svg';
import boxTempIcon from '../../../assets/icons/box_temp.svg';
import '../../../styles/ContainerDetail.css';

/************************************************************
 * DESCRIPTION: ContainerDetail 컴포넌트
 *              컨테이너의 상세 정보를 표시하는 컴포넌트
 *              기본 정보와 히스토리를 탭으로 전환하며 보여줌
 *              PC와 모바일에서 다른 레이아웃으로 표시
 *
 * PROPS:
 * - container: 표시할 컨테이너 객체
 * - childPreview: 하위 항목 미리보기 배열
 * - tempStorage: 임시보관함 배열
 * - houseId: 집 ID
 * - houseName: 집 이름
 * - pathNames: 경로 이름 배열
 * - isMobile: 모바일 여부
 * - onEdit: 수정 함수
 * - onDelete: 삭제 함수
 * - onMoveToHere: 전체 이동 함수
 * - onMoveSingleToHere: 단일 항목 이동 함수
 * - onRemoveFromTemp: 임시보관함에서 제거 함수
 * - onClearAll: 전체 취소 함수
 * - onDrillDown: 드릴다운 함수 (모바일)
 ************************************************************/
function ContainerDetail(props) {

    /************************************************************
     * DESCRIPTION: State 선언부
     ************************************************************/
    const [activeTab, setActiveTab] = useState('basic'); // 활성 탭 ('basic' 또는 'history')

    return (
        <div className="container-detail">
            {/* 헤더 - 고정 영역 */}
            <div className="detail-header">
                {/* 제목 섹션 */}
                <div className="detail-title-section">
                    {/* 아이콘 */}
                    <div className="detail-icon">
                        <img src={getContainerIcon(props.container.type_cd)} alt="icon" style={{ width: '32px', height: '32px' }} />
                    </div>

                    {/* 제목 정보 */}
                    <div className="detail-title-info">
                        <h3 className="detail-title">{props.container.name}</h3>
                        <div className="detail-subtitle">
                            {/* 경로 표시 (예: 우리집 › 거실 › 서랍) */}
                            {props.houseName}
                            {props.pathNames.length > 0 && ` › ${props.pathNames.join(' › ')}`}
                        </div>
                    </div>
                </div>

                {/* PC에서만 헤더에 수정/삭제 버튼 표시 */}
                {!props.isMobile && props.container.type_cd !== 'house' && (
                    <div className="detail-actions">
                        <button
                            className="action-button"
                            onClick={() => props.onEdit(props.container)}
                        >
                            <img src={editIcon} alt="수정" style={{ width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
                            수정
                        </button>
                        <button
                            className="action-button delete"
                            onClick={() => props.onDelete(props.container)}
                        >
                            <img src={deleteIcon} alt="삭제" style={{ width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
                            삭제
                        </button>
                    </div>
                )}
            </div>

            {/* 모바일에서만 열기 버튼과 수정/삭제 버튼 표시 */}
            {props.isMobile && props.container.type_cd !== 'house' && (
                <>
                    {/* 열기 버튼 (물품이 아닐 때만, 영역/박스만) */}
                    {props.container.type_cd !== 'COM1200003' && props.onDrillDown && (
                        <div className="drill-down-section-mobile">
                            <button
                                className="drill-down-button-mobile"
                                onClick={props.onDrillDown}
                            >
                                열기
                            </button>
                        </div>
                    )}

                    {/* 수정/삭제 버튼 */}
                    <div className="detail-actions-mobile">
                        <button
                            className="action-button-mobile edit"
                            onClick={() => props.onEdit(props.container)}
                        >
                            <img src={editIcon} alt="수정" style={{ width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
                            수정
                        </button>
                        <button
                            className="action-button-mobile delete"
                            onClick={() => props.onDelete(props.container)}
                        >
                            <img src={deleteIcon} alt="삭제" style={{ width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
                            삭제
                        </button>
                    </div>
                </>
            )}

            {/* 탭 영역 - 고정 */}
            <div className="detail-tabs">
                <button
                    className={`detail-tab ${activeTab === 'basic' ? 'active' : ''}`}
                    onClick={() => setActiveTab('basic')}
                >
                    기본 정보
                </button>
                {/* 집이 아닐 때만 히스토리 탭 표시 */}
                {props.container.type_cd !== 'house' && (
                    <button
                        className={`detail-tab ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        히스토리
                    </button>
                )}
            </div>

            {/* 탭 콘텐츠 - 스크롤 가능 영역 */}
            <div className="detail-tab-content">
                {/* 기본 정보 탭 */}
                {activeTab === 'basic' && (
                    <BasicInfoTab
                        container={props.container}
                        childPreview={props.childPreview}
                    />
                )}

                {/* 히스토리 탭 */}
                {activeTab === 'history' && (
                    <HistoryTab
                        houseId={props.houseId}
                        containerId={props.container.id}
                    />
                )}

                {/* 임시보관함 영역 (물품이 아니고, 임시보관함에 항목이 있을 때만) */}
                {props.tempStorage && props.tempStorage.length > 0 &&
                    props.container.type_cd !== 'COM1200003' && (
                        <div className="temp-storage">
                            {/* 임시보관함 헤더 */}
                            <div className="temp-storage-header">
                                <div className="temp-storage-title">
                                    <img src={boxTempIcon} alt="임시보관함" style={{ width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
                                    임시보관함 ({props.tempStorage.length})
                                </div>

                                {/* 임시보관함 액션 버튼들 */}
                                <div className="temp-storage-actions">
                                    <button
                                        className="temp-clear-all-button"
                                        onClick={props.onClearAll}
                                    >
                                        전체 취소
                                    </button>
                                    <button
                                        className="temp-move-all-button"
                                        onClick={props.onMoveToHere}
                                    >
                                        여기로 이동
                                    </button>
                                </div>
                            </div>

                            {/* 임시보관함 항목 목록 */}
                            {props.tempStorage.map((item, index) => (
                                <div key={index} className="temp-item">
                                    <div className="temp-item-header">
                                        {/* 항목 정보 */}
                                        <div className="temp-item-info">
                                            <div className="temp-item-name">
                                                <img src={getContainerIcon(item.type_cd)} alt="icon" style={{ width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
                                                {item.name}
                                            </div>
                                            <div className="temp-item-location">
                                                위치: {item.path}
                                            </div>
                                            {/* 수량 (2개 이상일 때만) */}
                                            {item.quantity > 1 && (
                                                <div className="temp-item-meta">수량: {item.quantity}개</div>
                                            )}
                                        </div>

                                        {/* 항목 액션 버튼 */}
                                        <div className="temp-item-actions">
                                            <button
                                                className="temp-move-btn"
                                                onClick={() => props.onMoveSingleToHere(index)}
                                                title="여기로 이동"
                                            >
                                                여기로 이동
                                            </button>
                                            <span
                                                className="temp-remove"
                                                onClick={() => props.onRemoveFromTemp(index)}
                                                title="제거"
                                            >
                                                ✖
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
            </div>
        </div>
    );
}

export default ContainerDetail;
