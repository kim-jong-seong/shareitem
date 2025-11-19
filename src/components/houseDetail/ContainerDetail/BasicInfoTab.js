import React from 'react';
import { getContainerIcon } from '../../../utils/iconUtils';

/************************************************************
 * DESCRIPTION: BasicInfoTab 컴포넌트
 *              컨테이너의 기본 정보를 표시하는 탭
 *              타입, 수량, 소유자, 메모, 하위 항목 미리보기 등을 표시
 *
 * PROPS:
 * - container: 컨테이너 객체 (기본 정보)
 * - childPreview: 하위 항목 미리보기 배열
 ************************************************************/
function BasicInfoTab(props) {

    /************************************************************
     * DESCRIPTION: 타입 코드에 따른 아이콘 가져오기
     ************************************************************/
    const getIcon = (typeCd) => {
        return getContainerIcon(typeCd);
    };

    return (
        <>
            {/* 기본 정보 섹션 */}
            <div className="detail-section">
                <div className="detail-section-title">기본 정보</div>

                {/* 유형 */}
                <div className="detail-field">
                    <div className="detail-field-label">유형</div>
                    <div className="detail-field-value">{props.container.type_nm}</div>
                </div>

                {/* 물품일 때만 표시되는 필드들 */}
                {props.container.type_cd === 'COM1200003' && (
                    <>
                        {/* 수량 (2개 이상일 때만) */}
                        {props.container.quantity > 1 && (
                            <div className="detail-field">
                                <div className="detail-field-label">수량</div>
                                <div className="detail-field-value">{props.container.quantity}개</div>
                            </div>
                        )}

                        {/* 소유자 */}
                        {props.container.owner_name && (
                            <div className="detail-field">
                                <div className="detail-field-label">소유자</div>
                                <div className="detail-field-value">{props.container.owner_name}</div>
                            </div>
                        )}

                        {/* 메모 */}
                        {props.container.remk && (
                            <div className="detail-field">
                                <div className="detail-field-label">메모</div>
                                <div className="detail-field-value">{props.container.remk}</div>
                            </div>
                        )}
                    </>
                )}

                {/* 영역/박스일 때 하위 항목 개수 표시 */}
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

                    {/* 하위 항목 카드 목록 */}
                    {props.childPreview.map((child, index) => (
                        <div
                            key={child.id}
                            className="item-card child-preview-item"
                            style={{ animationDelay: `${index * 0.05}s` }} // 순차 애니메이션
                        >
                            {/* 아이콘 */}
                            <div className="item-icon">
                                <img src={getIcon(child.type_cd)} alt="icon" style={{ width: '32px', height: '32px' }} />
                            </div>

                            {/* 항목 정보 */}
                            <div className="item-info">
                                <div className="item-name">{child.name}</div>
                                <div className="item-meta">
                                    {/* 수량 (2개 이상일 때) */}
                                    {child.quantity > 1 && <span>수량: {child.quantity}개</span>}
                                    {/* 소유자 */}
                                    {child.owner_name && <span className="item-badge owner">{child.owner_name}</span>}
                                    {/* 타입 (수량도 없고 소유자도 없을 때) */}
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
