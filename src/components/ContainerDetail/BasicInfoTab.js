import React from 'react';

function BasicInfoTab(props) {
  return (
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
          <div className="detail-field-value">{props.container.child_count || 0}개</div>
        </div>
      )}
    </div>
  );
}

export default BasicInfoTab;