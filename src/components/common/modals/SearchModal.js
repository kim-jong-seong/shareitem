import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import searchIcon from '../../../assets/icons/search.svg';
import { getContainerIcon } from '../../../utils/iconUtils';
import '../../../styles/SearchModal.css';

/************************************************************
 * DESCRIPTION: SearchModal 컴포넌트
 *              집 내의 컨테이너(물품)를 검색하는 모달
 *              실시간 검색(debounce)과 검색 결과 표시 기능 제공
 *
 * PROPS:
 * - houseId: 집 ID
 * - houseName: 집 이름 (검색 결과 경로에 표시)
 * - onClose: 모달 닫기 함수
 * - onSelect: 검색 결과 선택 시 호출되는 함수
 ************************************************************/
function SearchModal(props) {

    /************************************************************
     * DESCRIPTION: State 선언부
     ************************************************************/
    const [query, setQuery] = useState(''); // 검색어
    const [results, setResults] = useState([]); // 검색 결과 목록
    const [status, setStatus] = useState('검색어를 입력해주세요'); // 상태 메시지
    const [isNavigating, setIsNavigating] = useState(false); // 이동 중 상태

    /* useRef를 이용한 참조값 저장 */
    const searchTimerRef = useRef(null); // 검색 디바운스 타이머
    const inputRef = useRef(null); // 입력창 DOM 참조

    /* 모달 외부 클릭 시 드래그 방지를 위한 상태 */
    const [mouseDownTarget, setMouseDownTarget] = useState(null);
    const [mouseUpTarget, setMouseUpTarget] = useState(null);

    /************************************************************
     * DESCRIPTION: 모달 열릴 때 입력창에 자동 포커스
     ************************************************************/
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    /************************************************************
     * DESCRIPTION: 검색 실행 (debounce 0.5초)
     *              사용자가 입력을 멈춘 후 0.5초 뒤에 검색 수행
     *              이렇게 하면 타이핑할 때마다 요청을 보내지 않아
     *              서버 부담을 줄일 수 있음
     ************************************************************/
    useEffect(() => {
        /* 1. 이전 타이머 취소 */
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        /* 2. 검색어가 없으면 빈 상태로 설정 */
        if (query.trim().length === 0) {
            setStatus('검색어를 입력해주세요');
            setResults([]);
            return;
        }

        /* 3. 입력 중 표시 */
        setStatus('검색 중...');

        /* 4. 0.5초 후 검색 실행 */
        searchTimerRef.current = setTimeout(() => {
            performSearch(query.trim());
        }, 500);

        /* 5. cleanup: 컴포넌트 언마운트 시 타이머 정리 */
        return () => {
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    /************************************************************
     * DESCRIPTION: 실제 검색 수행 함수
     *              서버에 검색 요청을 보내고 결과를 받아옴
     ************************************************************/
    const performSearch = async (searchQuery) => {
        try {
            /* 1. 서버에 검색 요청 */
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/api/houses/${props.houseId}/containers/search?q=${encodeURIComponent(searchQuery)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            /* 2. 검색 결과 설정 */
            setResults(response.data.results || []);

            /* 3. 결과가 없을 때 메시지 표시 */
            if (!response.data.results || response.data.results.length === 0) {
                setStatus(`"${searchQuery}"에 대한 검색 결과가 없습니다`);
            }
        } catch (err) {
            console.error('검색 실패:', err.response?.data || err);
            setResults([]);
            const errorMsg = err.response?.data?.error || err.message || '알 수 없는 오류';
            setStatus(`검색에 실패했습니다: ${errorMsg}`);
        }
    };

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 검색 모달 UI
     ************************************************************/
    return (
        <div
            className="modal-overlay search-modal"
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
            <div className="modal-content search-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* 모달 헤더 */}
                <div className="modal-header">
                    <h3>
                        <img src={searchIcon} alt="검색" style={{ width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle' }} />
                        물품 검색
                    </h3>
                    <button className="modal-close" onClick={props.onClose} disabled={isNavigating}>✕</button>
                </div>

                <div className="modal-body">
                    {/* 검색 입력창 */}
                    <div className="search-input-container">
                        <input
                            ref={inputRef}
                            type="text"
                            className="search-input"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="물품명을 입력하세요..."
                            autoComplete="off"
                            disabled={isNavigating}
                        />
                    </div>

                    {/* 검색 결과 영역 */}
                    <div className="search-results">
                        {results.length === 0 ? (
                            /* 결과가 없을 때 상태 메시지 표시 */
                            <div className="search-status">{status}</div>
                        ) : (
                            <>
                                {/* 검색 결과 목록 */}
                                {results.map((result, index) => (
                                    <div
                                        key={index}
                                        className="search-result-item"
                                    >
                                        {/* 아이콘 */}
                                        <div className="search-result-icon">
                                            <img src={getContainerIcon(result.type_cd)} alt="icon" style={{ width: '32px', height: '32px' }} />
                                        </div>

                                        {/* 검색 결과 정보 */}
                                        <div className="search-result-info">
                                            <div className="search-result-name">{result.name}</div>
                                            <div className="search-result-path">
                                                {/* 경로 표시 (예: 우리집 › 거실 › 서랍) */}
                                                {result.path ? `${props.houseName} › ${result.path}` : props.houseName}
                                            </div>
                                            {/* 물품이고 수량이 2개 이상일 때 표시 */}
                                            {result.type_cd === 'COM1200003' && result.quantity > 1 && (
                                                <div className="search-result-meta">수량: {result.quantity}개</div>
                                            )}
                                            {/* 소유자 정보 표시 */}
                                            {result.owner_name && (
                                                <div className="search-result-meta">소유자: {result.owner_name}</div>
                                            )}
                                        </div>

                                        {/* 이동 버튼 */}
                                        <button
                                            className="goto-button"
                                            onClick={() => {
                                                setIsNavigating(true);
                                                props.onSelect(result); // 선택한 항목으로 이동
                                            }}
                                            disabled={isNavigating}
                                        >
                                            이동
                                        </button>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                {/* 로딩 오버레이 (이동 중일 때 표시) */}
                {isNavigating && (
                    <div className="search-loading-overlay">
                        <div className="search-loading-content">
                            <div className="search-loading-spinner"></div>
                            <div className="search-loading-text">이동 중...</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchModal;
