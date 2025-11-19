import React from 'react';
import pinIcon from '../../assets/icons/pin.svg';
import '../../styles/InfoBox.css';

function InfoBox() {
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