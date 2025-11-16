import React, { useState, useEffect, useRef } from 'react';
import '../styles/MobileBottomSheet.css';

function MobileBottomSheet({ isOpen, onClose, children }) {
  const [isClosing, setIsClosing] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
      setDragOffset(0);
      setIsDragging(false);
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
      setDragOffset(0);
      onClose();
    }, 200); // 0.2s 애니메이션 후 닫기
  };

  const handleTouchStart = (e) => {
    // 드래그 기능 비활성화 (핸들 제거됨)
    // X 버튼이나 배경 클릭으로만 닫을 수 있음
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    // 아래로만 드래그 가능 (diff > 0)
    if (diff > 0) {
      setDragOffset(diff);
      // 드래그가 실제로 시작되었을 때만 스크롤 방지 (5px 이상 이동시)
      if (diff > 5) {
        e.preventDefault();
      }
    } else {
      // 위로 드래그하려는 경우 드래그 취소 (스크롤 허용)
      setIsDragging(false);
      setDragOffset(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    // 100px 이상 드래그하면 닫기
    if (dragOffset > 100) {
      handleClose();
    } else {
      // 그렇지 않으면 원위치
      setDragOffset(0);
    }
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
        style={{
          transform: isDragging ? `translateY(${dragOffset}px)` : undefined,
          transition: isDragging ? 'none' : undefined
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
