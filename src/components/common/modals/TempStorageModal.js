import React from 'react';
import { getContainerIcon } from '../../../utils/iconUtils';
import boxTempIcon from '../../../assets/icons/box_temp.svg';
import '../../../styles/Modal.css';
import '../../../styles/TempStorageModal.css';

/************************************************************
 * DESCRIPTION: TempStorageModal 컴포넌트
 *              임시보관함에 담긴 항목들을 보여주는 모달
 *              사용자가 임시로 저장한 컨테이너 목록을 관리함
 *
 * PROPS:
 * - tempStorage: 임시보관함에 담긴 항목 배열
 * - onClose: 모달 닫기 함수
 * - onClearAll: 전체 취소 함수
 * - onRemove: 개별 항목 제거 함수
 ************************************************************/
function TempStorageModal(props) {

    /************************************************************
     * DESCRIPTION: State 선언부
     *              모달 외부 클릭 시 드래그 방지를 위한 상태
     ************************************************************/
    const [mouseDownTarget, setMouseDownTarget] = React.useState(null);
    const [mouseUpTarget, setMouseUpTarget] = React.useState(null);

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 임시보관함 모달 UI
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
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* 모달 헤더 */}
                <div className="modal-header">
                    <h3>
                        <img src={boxTempIcon} alt="임시보관함" style={{ width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle' }} />
                        임시보관함
                    </h3>
                    <div className="modal-header-actions">
                        {/* 항목이 있을 때만 전체 취소 버튼 표시 */}
                        {props.tempStorage.length > 0 && (
                            <button className="clear-all-button" onClick={props.onClearAll}>
                                전체 취소
                            </button>
                        )}
                        <button className="modal-close" onClick={props.onClose}>✕</button>
                    </div>
                </div>

                <div className="modal-body">
                    {/* 빈 상태 표시 */}
                    {props.tempStorage.length === 0 ? (
                        <div className="search-status">임시보관함이 비어있습니다</div>
                    ) : (
                        <>
                            {/* 임시보관함 항목 목록 */}
                            {props.tempStorage.map((item, index) => (
                                <div key={index} className="temp-item-modal">
                                    {/* 아이콘 */}
                                    <div className="item-icon">
                                        <img src={getContainerIcon(item.type_cd)} alt="icon" style={{ width: '32px', height: '32px' }} />
                                    </div>

                                    {/* 항목 정보 */}
                                    <div className="temp-item-info">
                                        <div className="temp-item-name">{item.name}</div>
                                        <div className="temp-item-detail">
                                            {/* 물품이고 수량이 2개 이상일 때만 표시 */}
                                            {item.type_cd === 'COM1200003' && item.quantity > 1 && `수량: ${item.quantity}개`}
                                            {item.type_cd === 'COM1200003' && item.quantity > 1 && item.path && ' | '}
                                            {/* 위치 정보 표시 */}
                                            {item.path && `위치: ${item.path}`}
                                        </div>
                                    </div>

                                    {/* 개별 제거 버튼 */}
                                    <button
                                        className="remove-button"
                                        onClick={() => props.onRemove(index)}
                                        title="제거"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TempStorageModal;
