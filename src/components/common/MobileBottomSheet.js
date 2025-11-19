import React, { useState, useEffect, useRef } from 'react';
import '../../styles/MobileBottomSheet.css';

function MobileBottomSheet({ isOpen, onClose, children }) {
  const [isClosing, setIsClosing] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  // 바텀시트 열릴 때 배경 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      // 현재 스크롤 위치 저장
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // 바텀시트 닫힐 때 원래 스크롤 위치로 복원
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200); // 0.2s 애니메이션 후 닫기
  };

  return (
    <div className={`mobile-bottom-sheet-overlay ${isClosing ? 'closing' : ''}`}>
      {/* 배경 (클릭 시 닫기) */}
      <div
        className="bottom-sheet-backdrop"
        onClick={handleClose}
      />

      {/* 바텀시트 */}
      <div
        ref={containerRef}
        className="bottom-sheet-container"
      >
        {/* X 버튼 */}
        <button
          className="bottom-sheet-close-btn"
          onClick={handleClose}
          aria-label="닫기"
        >
          ✕
        </button>

        {/* 내용 */}
        <div className="bottom-sheet-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default MobileBottomSheet;
