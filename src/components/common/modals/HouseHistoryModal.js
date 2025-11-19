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

function HouseHistoryModal(props) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [mouseDownTarget, setMouseDownTarget] = useState(null);
  const [mouseUpTarget, setMouseUpTarget] = useState(null);

  // 컨테이너로 이동
  const handleContainerClick = async (log) => {
    // 삭제된 컨테이너는 이동 불가
    if (!log.container_id) return;

    setIsNavigating(true);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${API_URL}/api/houses/${props.houseId}/containers/${log.container_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const container = response.data.container;

      // 부모 경로 추적
      let parentPath = [];
      let parentPathNames = [];
      let currentParentId = container.up_container_id;

      while (currentParentId) {
        const parentResponse = await axios.get(
          `${API_URL}/api/houses/${props.houseId}/containers/${currentParentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const parent = parentResponse.data.container;
        parentPath.unshift(parent.id);
        parentPathNames.unshift(parent.name);
        currentParentId = parent.up_container_id;
      }

      // onNavigateToContainer 호출 (await 추가)
      if (props.onNavigateToContainer) {
        await props.onNavigateToContainer({
          container,
          parentPath,
          parentPathNames
        });
      }

      // 네비게이션 완료 후 모달 닫기
      props.onClose();
    } catch (err) {
      console.error('컨테이너 이동 실패:', err);
      setIsNavigating(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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


  const getTypeIcon = (typeCd) => {
    switch(typeCd) {
      case 'COM1200001': return areaIcon;
      case 'COM1200002': return boxIcon;
      case 'COM1200003': return tagIcon;
      default: return null;
    }
  };

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
          {loading ? (
            <div className="history-loading">로딩 중...</div>
          ) : error ? (
            <div className="history-error">{error}</div>
          ) : logs.length === 0 ? (
            <div className="history-empty">
              <p>히스토리가 없습니다</p>
            </div>
          ) : (
            <div className="history-list">
              {logs.map((log, index) => {
                const formatted = formatLogMessage(log, props.houseName);
                const containerName = log.container_name || '알 수 없음';
                const isDeleted = !log.container_id;
                const typeIcon = getTypeIcon(log.container_type_cd);

                return (
                  <div
                    key={log.id}
                    className={`history-item ${!isDeleted ? 'clickable' : ''}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => !isDeleted && handleContainerClick(log)}
                  >
                    <div className="history-header">
                      <div className="history-title">
                        {typeIcon && (
                          <img src={typeIcon} alt="type" className="history-type-icon" />
                        )}
                        <span className="history-container-name">
                          {containerName}
                          {isDeleted && <span className="deleted-badge">(삭제됨)</span>}
                        </span>
                        <span className="history-separator">-</span>
                        <span className="history-icon">
                          {(typeof formatted.icon === 'string' && (formatted.icon.startsWith('/') || formatted.icon.includes('.svg'))) ? (
                            <img src={formatted.icon} alt={formatted.action} style={{ width: '16px', height: '16px' }} />
                          ) : (
                            formatted.icon
                          )}
                        </span>
                        <span className="history-action-name">{formatted.action}</span>
                      </div>
                      <span className="history-date">{formatDate(log.created_at)}</span>
                    </div>
                    {formatted.detail && (
                      <div className="history-detail">{formatted.detail}</div>
                    )}
                    <div className="history-footer">
                      <span className="history-user">{log.creator_name}</span>
                      <span className="history-date-mobile">{formatDate(log.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 로딩 오버레이 */}
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
