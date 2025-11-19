import React from 'react';
import recentIcon from '../../assets/icons/recent.svg';
import { getRelativeTime } from '../../utils/timeUtils';
import { formatLogOneLine } from '../../utils/logFormatUtils';

/************************************************************
 * DESCRIPTION: ActivitySection 컴포넌트
 *              집의 최근 활동 내역을 요약해서 보여주는 섹션
 *              펼치기/접기 기능 포함
 *
 * PROPS:
 * - recentLogs: 최근 활동 로그 배열
 * - isActivityExpanded: 활동 목록이 펼쳐져 있는지 여부
 * - setIsActivityExpanded: 펼치기/접기 상태 변경 함수
 * - isInitialActivityLoad: 초기 로드인지 여부 (애니메이션용)
 * - selectedHouseName: 선택된 집 이름
 * - onHistoryClick: 히스토리 모달 열기 함수
 ************************************************************/
const ActivitySection = ({
    recentLogs,
    isActivityExpanded,
    setIsActivityExpanded,
    isInitialActivityLoad,
    selectedHouseName,
    onHistoryClick
}) => {
    return (
        <div className="recent-activity-section">
            {/* 최근 활동 헤더 */}
            <div className="recent-activity-header">
                <span onClick={onHistoryClick} style={{ cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img src={recentIcon} alt="최근 활동" style={{ width: '16px', height: '16px' }} />
                    최근 활동
                </span>

                {/* 활동 내역이 있을 때만 펼치기/접기 버튼 표시 */}
                {recentLogs.length > 0 && (
                    <button
                        className="activity-toggle-btn"
                        onClick={(e) => {
                            e.stopPropagation(); // 부모 클릭 이벤트 전파 방지
                            setIsActivityExpanded(!isActivityExpanded);
                        }}
                        title={isActivityExpanded ? '접기' : '펼치기'}
                    >
                        <span className={`toggle-arrow ${isActivityExpanded ? 'expanded' : ''}`}>▼</span>
                    </button>
                )}
            </div>

            {/* 최근 활동 목록 */}
            {recentLogs.length > 0 ? (
                <div className="recent-activity-list">
                    {/* 최대 3개 항목만 표시 */}
                    {recentLogs.slice(0, 3).map((log, index) => {
                        /* 로그 한 줄 포맷팅 */
                        const formatted = formatLogOneLine(log, selectedHouseName);
                        const icon = formatted.icon;

                        /* 펼침 상태에 따라 표시 여부 결정 (접혀있으면 1개, 펼쳐있으면 3개) */
                        const shouldShow = index < (isActivityExpanded ? 3 : 1);

                        return (
                            <div
                                key={log.id}
                                className={`recent-activity-item ${isInitialActivityLoad ? 'initial-load' : ''} ${!shouldShow ? 'hidden' : ''}`}
                                onClick={onHistoryClick} // 클릭 시 히스토리 모달 열기
                                style={isInitialActivityLoad ? { animationDelay: `${index * 0.05}s` } : {}} // 순차 애니메이션
                            >
                                {/* 액션 아이콘 */}
                                <span className="activity-icon">
                                    {/* 이미지 경로인 경우 img 태그로, 아니면 텍스트로 */}
                                    {(typeof icon === 'string' && (icon.startsWith('/') || icon.includes('.svg'))) ? (
                                        <img src={icon} alt={formatted.action} style={{ width: '16px', height: '16px' }} />
                                    ) : (
                                        icon
                                    )}
                                </span>

                                {/* 작업한 사용자 */}
                                <span className="activity-creator">{formatted.creator}</span>

                                {/* 활동 내용 */}
                                <span className="activity-content">
                                    <span className="container-name-highlight">
                                        {/* 컨테이너 타입 아이콘 */}
                                        {formatted.typeIcon && (
                                            <img src={formatted.typeIcon} alt="type" className="type-icon-inline" />
                                        )}
                                        {formatted.containerName}
                                    </span>
                                    {/* 상세 정보 (예: "수량 변경: 1개 → 2개") */}
                                    {formatted.detail && <span className="activity-detail-text"> {formatted.detail}</span>}
                                </span>

                                {/* 상대적 시간 (예: "방금 전", "5분 전") */}
                                <span className="activity-time">{getRelativeTime(log.created_at)}</span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* 활동 내역이 없을 때 */
                <div className="recent-activity-empty">최근 활동이 없습니다</div>
            )}
        </div>
    );
};

export default ActivitySection;
