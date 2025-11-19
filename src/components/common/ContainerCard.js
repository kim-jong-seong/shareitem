import React from 'react';
import { getContainerIcon } from '../../utils/iconUtils';
import boxTempIcon from '../../assets/icons/box_temp.svg';
import '../../styles/ContainerCard.css';

/************************************************************
 * DESCRIPTION: ContainerCard 컴포넌트
 *              컨테이너(영역/박스/물품)를 카드 형태로 표시하는
 *              재사용 가능한 컴포넌트
 *
 * PROPS:
 * - container: 컨테이너 데이터 객체
 * - isActive: 현재 선택된 카드인지 여부
 * - animationDelay: 애니메이션 지연 시간
 * - onClick: 카드 클릭 시 호출되는 함수
 * - onDoubleClick: 카드 더블클릭 시 호출되는 함수
 * - onAddToTemp: 임시보관함 추가 버튼 클릭 시 호출되는 함수
 ************************************************************/
function ContainerCard(props) {

    /************************************************************
     * DESCRIPTION: 타입별 아이콘 가져오기
     *              컨테이너 타입에 맞는 아이콘을 반환
     ************************************************************/
    const getIcon = () => {
        return getContainerIcon(props.container.type_cd);
    };

    /************************************************************
     * DESCRIPTION: 메타 정보 생성 함수
     *              컨테이너 타입에 따라 다른 메타 정보를 표시
     *              - 물품: 소유자, 수량
     *              - 영역/박스: 타입명, 하위 항목 개수
     ************************************************************/
    const getMeta = () => {
        if (props.container.type_cd === 'COM1200003') {
            /* 물품인 경우 */
            const parts = [];
            if (props.container.owner_name) {
                parts.push(props.container.owner_name); // 소유자 이름
            }
            if (props.container.quantity && props.container.quantity > 1) {
                parts.push(`수량: ${props.container.quantity}개`); // 수량 (2개 이상일 때만)
            }
            return parts;
        } else {
            /* 영역 또는 박스인 경우 */
            return [
                props.container.type_nm, // 타입 이름 (영역/박스)
                `${props.container.child_count || 0}개 항목` // 하위 항목 개수
            ];
        }
    };

    const meta = getMeta();

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 컨테이너 카드 UI
     ************************************************************/
    return (
        <div
            className={`item-card ${props.isActive ? 'active' : ''}`}
            style={props.animationDelay ? { animationDelay: props.animationDelay } : {}}
            onClick={props.onClick}
            onDoubleClick={props.onDoubleClick}
            data-container-id={props.container.id}
        >
            {/* 아이콘 영역 */}
            <div className="item-icon">
                <img src={getIcon()} alt="icon" style={{ width: '32px', height: '32px' }} />
            </div>

            {/* 정보 영역: 이름 + 메타 정보 */}
            <div className="item-info">
                <div className="item-name">{props.container.name}</div>
                <div className="item-meta">
                    {meta.map((text, index) => (
                        <span
                            key={index}
                            className={props.container.owner_name && text === props.container.owner_name ? 'item-badge owner' : ''}
                        >
                            {text}
                        </span>
                    ))}
                </div>
            </div>

            {/* 호버 시 표시되는 액션 버튼 (임시보관함 추가) */}
            <div className="item-card-actions">
                <button
                    className="item-action-btn temp-btn"
                    onClick={(e) => {
                        e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
                        props.onAddToTemp();
                    }}
                    title="임시보관함으로"
                >
                    <img src={boxTempIcon} alt="임시보관함" style={{ width: '16px', height: '16px' }} />
                </button>
            </div>
        </div>
    );
}

export default ContainerCard;
