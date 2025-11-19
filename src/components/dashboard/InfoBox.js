import React from 'react';
import pinIcon from '../../assets/icons/pin.svg';
import '../../styles/InfoBox.css';

/************************************************************
 * DESCRIPTION: InfoBox 컴포넌트
 *              대시보드 상단에 고정된 안내 메시지를
 *              표시하는 간단한 컴포넌트
 ************************************************************/
function InfoBox() {

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 안내 메시지 박스
     ************************************************************/
    return (
        <div className="info-box">
            <span className="pin-icon">
                <img src={pinIcon} alt="pin" style={{ width: '20px', height: '20px' }} />
            </span>
            <p>Share Item에서 물품을 관리해보세요</p>
        </div>
    );
}

export default InfoBox;
