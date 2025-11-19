import React from 'react';
import recentIcon from '../../assets/icons/recent.svg';
import { getRelativeTime } from '../../utils/timeUtils';
import { formatLogOneLine } from '../../utils/logFormatUtils';

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
      <div className="recent-activity-header">
        <span onClick={onHistoryClick} style={{ cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <img src={recentIcon} alt="최근 활동" style={{ width: '16px', height: '16px' }} />
          최근 활동
        </span>
        {recentLogs.length > 0 && (
          <button
            className="activity-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsActivityExpanded(!isActivityExpanded);
            }}
            title={isActivityExpanded ? '접기' : '펼치기'}
          >
            <span className={`toggle-arrow ${isActivityExpanded ? 'expanded' : ''}`}>▼</span>
          </button>
        )}
      </div>
      {recentLogs.length > 0 ? (
        <div className="recent-activity-list">
          {recentLogs.slice(0, 3).map((log, index) => {
            const formatted = formatLogOneLine(log, selectedHouseName);
            const icon = formatted.icon;
            const shouldShow = index < (isActivityExpanded ? 3 : 1);
            return (
              <div
                key={log.id}
                className={`recent-activity-item ${isInitialActivityLoad ? 'initial-load' : ''} ${!shouldShow ? 'hidden' : ''}`}
                onClick={onHistoryClick}
                style={isInitialActivityLoad ? { animationDelay: `${index * 0.05}s` } : {}}
              >
                <span className="activity-icon">
                  {(typeof icon === 'string' && (icon.startsWith('/') || icon.includes('.svg'))) ? (
                    <img src={icon} alt={formatted.action} style={{ width: '16px', height: '16px' }} />
                  ) : (
                    icon
                  )}
                </span>
                <span className="activity-creator">{formatted.creator}</span>
                <span className="activity-content">
                  <span className="container-name-highlight">
                    {formatted.typeIcon && (
                      <img src={formatted.typeIcon} alt="type" className="type-icon-inline" />
                    )}
                    {formatted.containerName}
                  </span>
                  {formatted.detail && <span className="activity-detail-text"> {formatted.detail}</span>}
                </span>
                <span className="activity-time">{getRelativeTime(log.created_at)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="recent-activity-empty">최근 활동이 없습니다</div>
      )}
    </div>
  );
};

export default ActivitySection;
