import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { formatLogMessage, formatDate } from '../../../utils/logUtils';
import areaIcon from '../../../assets/icons/area.svg';
import boxIcon from '../../../assets/icons/box.svg';
import tagIcon from '../../../assets/icons/tag.svg';
import recentIcon from '../../../assets/icons/recent.svg';
import '../../../styles/Modal.css';
import '../../../styles/HouseHistoryModal.css';

/************************************************************
 * DESCRIPTION: HouseHistoryModal 컴포넌트
 *              집의 최근 활동 히스토리를 보여주는 모달
 *              컨테이너 추가/수정/삭제 등의 로그를 시간순으로 표시
 *
 * PROPS:
 * - houseId: 집 ID
 * - houseName: 집 이름 (모달 제목에 표시)
 * - onClose: 모달 닫기 함수
 * - onNavigateToContainer: 컨테이너로 이동하는 함수
 ************************************************************/
function HouseHistoryModal(props) {

    /************************************************************
     * DESCRIPTION: State 선언부
     ************************************************************/
    const [logs, setLogs] = useState([]); // 활동 로그 목록
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(''); // 에러 메시지
    const [isNavigating, setIsNavigating] = useState(false); // 이동 중 상태

    /* 모달 외부 클릭 시 드래그 방지를 위한 상태 */
    const [mouseDownTarget, setMouseDownTarget] = useState(null);
    const [mouseUpTarget, setMouseUpTarget] = useState(null);

    /************************************************************
     * DESCRIPTION: 컨테이너로 이동하는 함수
     *              히스토리 항목 클릭 시 해당 컨테이너로 이동
     *              부모 경로를 추적하여 올바른 위치를 찾아감
     ************************************************************/
    const handleContainerClick = async (log) => {
        /* 1. 삭제된 컨테이너는 이동 불가 */
        if (!log.container_id) return;

        setIsNavigating(true);

        try {
            const token = localStorage.getItem('token');

            /* 2. 컨테이너 정보 조회 */
            const response = await axios.get(
                `${API_URL}/api/houses/${props.houseId}/containers/${log.container_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const container = response.data.container;

            /* 3. 부모 경로 추적 (루트까지 거슬러 올라감) */
            let parentPath = [];
            let parentPathNames = [];
            let currentParentId = container.up_container_id;

            // 부모가 있으면 계속 거슬러 올라감
            while (currentParentId) {
                const parentResponse = await axios.get(
                    `${API_URL}/api/houses/${props.houseId}/containers/${currentParentId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const parent = parentResponse.data.container;
                parentPath.unshift(parent.id); // 배열 앞에 추가
                parentPathNames.unshift(parent.name); // 이름도 저장
                currentParentId = parent.up_container_id; // 다음 부모로
            }

            /* 4. 부모 컴포넌트의 네비게이션 함수 호출 */
            if (props.onNavigateToContainer) {
                await props.onNavigateToContainer({
                    container,
                    parentPath,
                    parentPathNames
                });
            }

            /* 5. 네비게이션 완료 후 모달 닫기 */
            props.onClose();
        } catch (err) {
            console.error('컨테이너 이동 실패:', err);
            setIsNavigating(false);
        }
    };

    /************************************************************
     * DESCRIPTION: 컴포넌트 마운트 시 히스토리 조회
     ************************************************************/
    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /************************************************************
     * DESCRIPTION: 활동 로그 조회 함수
     *              서버에서 최근 10개의 활동 내역을 가져옴
     ************************************************************/
    const fetchLogs = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/api/houses/${props.houseId}/logs?limit=10`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setLogs(response.data.logs);
            setLoading(false);
        } catch (err) {
            setError('정보를 불러오는데 실패했습니다');
            setLoading(false);
            console.error(err);
        }
    };

    /************************************************************
     * DESCRIPTION: 타입 코드에 따른 아이콘 반환 함수
     ************************************************************/
    const getTypeIcon = (typeCd) => {
        switch (typeCd) {
            case 'COM1200001': return areaIcon; // 영역
            case 'COM1200002': return boxIcon; // 박스
            case 'COM1200003': return tagIcon; // 물품
            default: return null;
        }
    };

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 히스토리 모달 UI
     ************************************************************/
    return (
        <div
            className="modal-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    setMouseDownTarget(e.currentTarget);
                } else {
                    setMouseDownTarget(null);
                }
            }}
            onMouseUp={(e) => {
                if (e.target === e.currentTarget) {
                    setMouseUpTarget(e.currentTarget);
                } else {
                    setMouseUpTarget(null);
                }
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget &&
                    mouseDownTarget === e.currentTarget &&
                    mouseUpTarget === e.currentTarget) {
                    props.onClose();
                }
            }}
        >
            <div className="modal-content house-history-modal" onClick={(e) => e.stopPropagation()}>
                {/* 모달 헤더 */}
                <div className="modal-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={recentIcon} alt="최근 활동" style={{ width: '20px', height: '20px' }} />
                        {props.houseName} 최근 활동
                    </h2>
                    <button className="modal-close" onClick={props.onClose} disabled={isNavigating}>
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    {/* 로딩 중 */}
                    {loading ? (
                        <div className="history-loading">로딩 중...</div>
                    ) : error ? (
                        /* 에러 발생 */
                        <div className="history-error">{error}</div>
                    ) : logs.length === 0 ? (
                        /* 히스토리 없음 */
                        <div className="history-empty">
                            <p>히스토리가 없습니다</p>
                        </div>
                    ) : (
                        /* 히스토리 목록 */
                        <div className="history-list">
                            {logs.map((log, index) => {
                                /* 로그 메시지 포맷팅 (formatLogMessage 유틸 사용) */
                                const formatted = formatLogMessage(log, props.houseName);
                                const containerName = log.container_name || '알 수 없음';
                                const isDeleted = !log.container_id; // 컨테이너가 삭제되었는지 확인
                                const typeIcon = getTypeIcon(log.container_type_cd);

                                return (
                                    <div
                                        key={log.id}
                                        className={`history-item ${!isDeleted ? 'clickable' : ''}`}
                                        style={{ animationDelay: `${index * 0.05}s` }} // 순차적 애니메이션
                                        onClick={() => !isDeleted && handleContainerClick(log)} // 삭제되지 않은 경우만 클릭 가능
                                    >
                                        {/* 히스토리 헤더 */}
                                        <div className="history-header">
                                            <div className="history-title">
                                                {/* 타입 아이콘 */}
                                                {typeIcon && (
                                                    <img src={typeIcon} alt="type" className="history-type-icon" />
                                                )}
                                                {/* 컨테이너 이름 */}
                                                <span className="history-container-name">
                                                    {containerName}
                                                    {isDeleted && <span className="deleted-badge">(삭제됨)</span>}
                                                </span>
                                                <span className="history-separator">-</span>
                                                {/* 액션 아이콘 */}
                                                <span className="history-icon">
                                                    {/* 아이콘이 이미지 경로인 경우 img 태그로, 아니면 텍스트로 */}
                                                    {(typeof formatted.icon === 'string' && (formatted.icon.startsWith('/') || formatted.icon.includes('.svg'))) ? (
                                                        <img src={formatted.icon} alt={formatted.action} style={{ width: '16px', height: '16px' }} />
                                                    ) : (
                                                        formatted.icon
                                                    )}
                                                </span>
                                                {/* 액션 이름 */}
                                                <span className="history-action-name">{formatted.action}</span>
                                            </div>
                                            {/* 날짜 (데스크톱) */}
                                            <span className="history-date">{formatDate(log.created_at)}</span>
                                        </div>
                                        {/* 상세 정보 (변경 내용 등) */}
                                        {formatted.detail && (
                                            <div className="history-detail">{formatted.detail}</div>
                                        )}
                                        {/* 히스토리 푸터 */}
                                        <div className="history-footer">
                                            {/* 작업한 사용자 */}
                                            <span className="history-user">{log.creator_name}</span>
                                            {/* 날짜 (모바일) */}
                                            <span className="history-date-mobile">{formatDate(log.created_at)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 로딩 오버레이 (이동 중일 때 표시) */}
                {isNavigating && (
                    <div className="history-loading-overlay">
                        <div className="history-loading-content">
                            <div className="history-loading-spinner"></div>
                            <div className="history-loading-text">이동 중...</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HouseHistoryModal;
