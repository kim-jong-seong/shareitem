import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import searchIcon from '../../../assets/icons/search.svg';
import { getContainerIcon } from '../../../utils/iconUtils';
import '../../../styles/SearchModal.css';

function SearchModal(props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('검색어를 입력해주세요');
  const [isNavigating, setIsNavigating] = useState(false);

  const searchTimerRef = useRef(null);
  const inputRef = useRef(null);

  const [mouseDownTarget, setMouseDownTarget] = useState(null);
  const [mouseUpTarget, setMouseUpTarget] = useState(null);

  // 모달 열릴 때 input에 포커스
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // 검색 실행 (debounce 0.5초)
  useEffect(() => {
    // 이전 타이머 취소
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (query.trim().length === 0) {
      setStatus('검색어를 입력해주세요');
      setResults([]);
      return;
    }

    // 입력 중 표시
    setStatus('검색 중...');

    // 0.5초 후 검색 실행
    searchTimerRef.current = setTimeout(() => {
      performSearch(query.trim());
    }, 500);

    // cleanup
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // 실제 검색 수행
  const performSearch = async (searchQuery) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/houses/${props.houseId}/containers/search?q=${encodeURIComponent(searchQuery)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResults(response.data.results || []);
      
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
        <div className="modal-header">
          <h3>
            <img src={searchIcon} alt="검색" style={{ width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle' }} />
            물품 검색
          </h3>
          <button className="modal-close" onClick={props.onClose} disabled={isNavigating}>✕</button>
        </div>

        <div className="modal-body">
          {/* 검색 입력 */}
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

          {/* 검색 결과 */}
          <div className="search-results">
            {results.length === 0 ? (
              <div className="search-status">{status}</div>
            ) : (
              <>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="search-result-item"
                  >
                    <div className="search-result-icon">
                      <img src={getContainerIcon(result.type_cd)} alt="icon" style={{ width: '32px', height: '32px' }} />
                    </div>
                    <div className="search-result-info">
                      <div className="search-result-name">{result.name}</div>
                      <div className="search-result-path">
                        {result.path ? `${props.houseName} › ${result.path}` : props.houseName}
                      </div>
                      {result.type_cd === 'COM1200003' && result.quantity > 1 && (
                        <div className="search-result-meta">수량: {result.quantity}개</div>
                      )}
                      {result.owner_name && (
                        <div className="search-result-meta">소유자: {result.owner_name}</div>
                      )}
                    </div>
                    <button
                      className="goto-button"
                      onClick={() => {
                        setIsNavigating(true);
                        props.onSelect(result);
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

        {/* 로딩 오버레이 */}
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