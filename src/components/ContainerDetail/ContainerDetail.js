import React, { useState } from 'react';
import BasicInfoTab from './BasicInfoTab';
import HistoryTab from './HistoryTab';
import '../../styles/ContainerDetail.css';

function ContainerDetail(props) {
  const [activeTab, setActiveTab] = useState('basic');

  return (
    <div className="container-detail">
      {/* 헤더 */}
      <div className="detail-header">
        <div className="detail-title-section">
          <div className="detail-icon">
            {props.container.type_cd === 'house' ? '🏠' :
             props.container.type_cd === 'COM1200001' ? '📁' :
             props.container.type_cd === 'COM1200002' ? '📦' : '🏷️'}
          </div>
          <div className="detail-title-info">
            <h3 className="detail-title">{props.container.name}</h3>
            <div className="detail-subtitle">
              {props.houseName}
              {props.pathNames.length > 0 && ` › ${props.pathNames.join(' › ')}`}
            </div>
          </div>
        </div>
        {props.container.type_cd !== 'house' && (
          <div className="detail-actions">
            <button 
              className="action-button"
              onClick={() => props.onEdit(props.container)}
            >
              ✏️ 수정
            </button>
            <button 
              className="action-button"
              onClick={() => props.onDelete(props.container)}
            >
              🗑️ 삭제
            </button>
          </div>
        )}
      </div>

      {/* 탭 */}
      <div className="detail-tabs">
        <button 
          className={`detail-tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          기본 정보
        </button>
        {props.container.type_cd !== 'house' && (
          <button 
            className={`detail-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            히스토리
          </button>
        )}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="detail-tab-content">
        {activeTab === 'basic' && (
          <BasicInfoTab 
            container={props.container}
            childPreview={props.childPreview}
          />
        )}
        {activeTab === 'history' && (
          <HistoryTab 
            houseId={props.houseId}
            containerId={props.container.id} 
          />
        )}
      </div>

      {/* 임시보관함 */}
      {props.tempStorage && props.tempStorage.length > 0 && 
       props.container.type_cd !== 'COM1200003' && (
        <div className="temp-storage">
          <div className="temp-storage-header">
            <div className="temp-storage-title">📦 임시보관함 ({props.tempStorage.length})</div>
            <button 
              className="action-button primary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={props.onMoveToHere}
            >
              여기로 이동
            </button>
          </div>
          {props.tempStorage.map((item, index) => (
            <div key={index} className="temp-item">
              <div className="temp-item-header">
                <div className="temp-item-info">
                  <div className="temp-item-name">
                    {item.type_cd === 'COM1200001' ? '📁' :
                     item.type_cd === 'COM1200002' ? '📦' : '🏷️'}
                    {' '}{item.name}
                  </div>
                  <div className="temp-item-location">
                    위치: {item.path}
                  </div>
                  {item.quantity > 1 && (
                    <div className="temp-item-meta">수량: {item.quantity}개</div>
                  )}
                </div>
                <span 
                  className="temp-remove"
                  onClick={() => props.onRemoveFromTemp(index)}
                >
                  ✖
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContainerDetail;