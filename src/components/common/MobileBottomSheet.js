import React, { useState, useEffect, useRef } from 'react';
import '../../styles/MobileBottomSheet.css';

/************************************************************
 * DESCRIPTION: MobileBottomSheet 컴포넌트
 *              모바일에서 하단에서 올라오는 시트 형태의 모달
 *              배경 스크롤 방지 및 닫기 애니메이션 포함
 *
 * PROPS:
 * - isOpen: 바텀시트 열림 상태
 * - onClose: 바텀시트 닫기 함수
 * - children: 바텀시트 내부에 표시할 컨텐츠
 ************************************************************/
function MobileBottomSheet({ isOpen, onClose, children }) {

    /************************************************************
     * DESCRIPTION: State 선언부
     ************************************************************/
    const [isClosing, setIsClosing] = useState(false); // 닫히는 중 상태 (애니메이션용)
    const containerRef = useRef(null); // 바텀시트 컨테이너 DOM 참조

    /************************************************************
     * DESCRIPTION: 바텀시트가 닫힐 때 닫히는 중 상태 초기화
     ************************************************************/
    useEffect(() => {
        if (!isOpen) {
            setIsClosing(false);
        }
    }, [isOpen]);

    /************************************************************
     * DESCRIPTION: 바텀시트 열릴 때 배경 스크롤 막기
     *              모바일에서 바텀시트가 열려있을 때
     *              뒤 화면이 스크롤되지 않도록 함
     ************************************************************/
    useEffect(() => {
        if (isOpen) {
            /* 1. 현재 스크롤 위치 저장 */
            const scrollY = window.scrollY;

            /* 2. body를 fixed로 고정하여 스크롤 방지 */
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';

            /* 3. cleanup: 바텀시트 닫힐 때 원래 스크롤 위치로 복원 */
            return () => {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                window.scrollTo(0, scrollY); // 원래 스크롤 위치로 이동
            };
        }
    }, [isOpen]);

    /************************************************************
     * DESCRIPTION: 바텀시트가 닫혀있고 닫히는 중도 아니면 렌더링 안함
     ************************************************************/
    if (!isOpen && !isClosing) return null;

    /************************************************************
     * DESCRIPTION: 바텀시트 닫기 처리 함수
     *              애니메이션을 보여주기 위해 0.2초 후에 실제로 닫음
     ************************************************************/
    const handleClose = () => {
        /* 1. 닫히는 중 상태로 변경 (닫기 애니메이션 시작) */
        setIsClosing(true);

        /* 2. 0.2초 후 실제로 닫기 */
        setTimeout(() => {
            setIsClosing(false);
            onClose(); // 부모 컴포넌트에 닫기 알림
        }, 200); // CSS 애니메이션 duration과 동일
    };

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 바텀시트 UI
     ************************************************************/
    return (
        <div className={`mobile-bottom-sheet-overlay ${isClosing ? 'closing' : ''}`}>
            {/* 배경 (클릭 시 닫기) */}
            <div
                className="bottom-sheet-backdrop"
                onClick={handleClose}
            />

            {/* 바텀시트 컨테이너 */}
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
