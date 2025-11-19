import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { formatLogMessage, formatDate } from '../../../utils/logUtils';

/************************************************************
 * DESCRIPTION: HistoryTab 컴포넌트
 *              특정 컨테이너의 변경 이력을 표시하는 탭
 *              생성, 수정, 이동 등의 로그를 시간순으로 표시
 *
 * PROPS:
 * - houseId: 집 ID
 * - containerId: 컨테이너 ID
 ************************************************************/
function HistoryTab(props) {

    /************************************************************
     * DESCRIPTION: State 선언부
     ************************************************************/
    const [logs, setLogs] = useState([]); // 변경 이력 배열
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(''); // 에러 메시지
    const [currentHouseName, setCurrentHouseName] = useState(''); // 현재 집 이름

    /************************************************************
     * DESCRIPTION: 변경 이력 조회 함수
     *              서버에서 컨테이너의 변경 이력을 가져옴
     *              useCallback으로 감싸서 함수 재생성 방지
     ************************************************************/
    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/api/houses/${props.houseId}/containers/${props.containerId}/logs`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setLogs(response.data.logs); // 로그 목록 설정
            setCurrentHouseName(response.data.current_house_name || ''); // 현재 집 이름 설정
            setLoading(false);
        } catch (err) {
            setError('정보를 불러오는데 실패했습니다');
            setLoading(false);
            console.error(err);
        }
    }, [props.houseId, props.containerId]);

    /************************************************************
     * DESCRIPTION: 컴포넌트 마운트 시 변경 이력 조회
     ************************************************************/
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    /************************************************************
     * DESCRIPTION: 로딩 중일 때 표시
     ************************************************************/
    if (loading) {
        return <div className="history-loading">로딩 중...</div>;
    }

    /************************************************************
     * DESCRIPTION: 에러 발생 시 표시
     ************************************************************/
    if (error) {
        return <div className="history-error">{error}</div>;
    }

    /************************************************************
     * DESCRIPTION: 변경 이력이 없을 때 표시
     ************************************************************/
    if (logs.length === 0) {
        return (
            <div className="history-empty">
                <p>히스토리가 없습니다</p>
            </div>
        );
    }

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 변경 이력 목록
     ************************************************************/
    return (
        <div className="history-list">
            {logs.map((log, index) => {
                /* 로그 메시지 포맷팅 (formatLogMessage 유틸 사용) */
                const formatted = formatLogMessage(log, currentHouseName);

                return (
                    <div
                        key={log.id}
                        className="history-item"
                        style={{ animationDelay: `${index * 0.05}s` }} // 순차 애니메이션
                    >
                        {/* 히스토리 헤더 (액션 + 날짜) */}
                        <div className="history-header">
                            <div className="history-action">
                                {/* 액션 아이콘 */}
                                <span className="history-icon">
                                    {/* 아이콘이 이미지 경로인 경우 img 태그로, 아니면 텍스트로 */}
                                    {(typeof formatted.icon === 'string' && (formatted.icon.startsWith('/') || formatted.icon.includes('.svg'))) ? (
                                        <img src={formatted.icon} alt={formatted.action} style={{ width: '20px', height: '20px' }} />
                                    ) : (
                                        formatted.icon
                                    )}
                                </span>
                                {/* 액션 이름 */}
                                <span className="history-action-name">{formatted.action}</span>
                            </div>
                            {/* 날짜 */}
                            <div className="history-date">{formatDate(log.created_at)}</div>
                        </div>

                        {/* 상세 정보 (변경 내용 등) */}
                        {formatted.detail && (
                            <div className="history-detail">{formatted.detail}</div>
                        )}

                        {/* 작업한 사용자 */}
                        <div className="history-user">{log.creator_name}</div>
                    </div>
                );
            })}
        </div>
    );
}

export default HistoryTab;
