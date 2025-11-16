import React, { useState } from 'react';
import BasicInfoTab from './BasicInfoTab';
import HistoryTab from './HistoryTab';
import { getContainerIcon } from '../../utils/iconUtils';
import editIcon from '../../assets/icons/edit.svg';
import deleteIcon from '../../assets/icons/delete.svg';
import boxTempIcon from '../../assets/icons/box_temp.svg';
import '../../styles/ContainerDetail.css';

function ContainerDetail(props) {
  const [activeTab, setActiveTab] = useState('basic');

  return (
    <div className="container-detail">
      {/* 헤더 - 고정 */}
      <div className="detail-header">
        <div className="detail-title-section">
          <div className="detail-icon">
            <img src={getContainerIcon(props.container.type_cd)} alt="icon" style={{ width: '32px', height: '32px' }} />
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
              <img src={editIcon} alt="수정" style={{ width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
              수정
            </button>
            <button
              className="action-button"
              onClick={() => props.onDelete(props.container)}
            >
              <img src={deleteIcon} alt="삭제" style={{ width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 탭 - 고정 */}
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

      {/* 탭 콘텐츠 - 스크롤 영역 */}
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

        {/* 임시보관함 */}
        {props.tempStorage && props.tempStorage.length > 0 && 
         props.container.type_cd !== 'COM1200003' && (
          <div className="temp-storage">
            <div className="temp-storage-header">
              <div className="temp-storage-title">
                <img src={boxTempIcon} alt="임시보관함" style={{ width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
                임시보관함 ({props.tempStorage.length})
              </div>
              <button
                className="action-button primary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={props.onMoveToHere}
              >
                여기로 전체 이동
              </button>
            </div>
            {props.tempStorage.map((item, index) => (
              <div key={index} className="temp-item">
                <div className="temp-item-header">
                  <div className="temp-item-info">
                    <div className="temp-item-name">
                      <img src={getContainerIcon(item.type_cd)} alt="icon" style={{ width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
                      {item.name}
                    </div>
                    <div className="temp-item-location">
                      위치: {item.path}
                    </div>
                    {item.quantity > 1 && (
                      <div className="temp-item-meta">수량: {item.quantity}개</div>
                    )}
                  </div>
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