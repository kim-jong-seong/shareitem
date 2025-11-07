import React from 'react';

function BasicInfoTab(props) {
  // 아이콘 가져오기
  const getIcon = (typeCd) => {
    if (typeCd === 'COM1200001') return '📁';
    if (typeCd === 'COM1200002') return '📦';
    return '🏷️';
  };

  return (
    <>
      <div className="detail-section">
        <div className="detail-section-title">기본 정보</div>
        
        <div className="detail-field">
          <div className="detail-field-label">유형</div>
          <div className="detail-field-value">{props.container.type_nm}</div>
        </div>
        
        {props.container.type_cd === 'COM1200003' && (
          <>
            {props.container.quantity > 1 && (
              <div className="detail-field">
                <div className="detail-field-label">수량</div>
                <div className="detail-field-value">{props.container.quantity}개</div>
              </div>
            )}
            {props.container.owner_name && (
              <div className="detail-field">
                <div className="detail-field-label">소유자</div>
                <div className="detail-field-value">{props.container.owner_name}</div>
              </div>
            )}
            {props.container.remk && (
              <div className="detail-field">
                <div className="detail-field-label">메모</div>
                <div className="detail-field-value">{props.container.remk}</div>
              </div>
            )}
          </>
        )}
        
        {props.container.type_cd !== 'COM1200003' && (
          <div className="detail-field">
            <div className="detail-field-label">하위 항목</div>
            <div className="detail-field-value">
              {props.container.child_count || 0}개
            </div>
          </div>
        )}
      </div>

      {/* 하위 항목 미리보기 (영역/박스만) */}
      {props.childPreview && props.childPreview.length > 0 && (
        <div className="detail-section child-preview-section">
          <div className="detail-section-title">하위 항목 미리보기</div>
          {props.childPreview.map((child, index) => (
            <div 
              key={child.id} 
              className="item-card child-preview-item"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="item-icon">{getIcon(child.type_cd)}</div>
              <div className="item-info">
                <div className="item-name">{child.name}</div>
                <div className="item-meta">
                  {child.quantity > 1 && <span>수량: {child.quantity}개</span>}
                  {child.owner_name && <span className="item-badge owner">{child.owner_name}</span>}
                  {!child.owner_name && child.quantity <= 1 && <span>{child.type_nm}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default BasicInfoTab;