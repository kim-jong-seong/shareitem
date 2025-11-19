import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import api from '../../services/api';
import ActivitySection from './ActivitySection';
import BreadcrumbNav from './BreadcrumbNav';
import LeftPanel from './LeftPanel';
import CenterPanel from './CenterPanel';
import RightPanel from './RightPanel';
import MobileLayout from './MobileLayout';
import AddContainerModal from '../common/modals/AddContainerModal';
import EditContainerModal from '../common/modals/EditContainerModal';
import SearchModal from '../common/modals/SearchModal';
import TempStorageModal from '../common/modals/TempStorageModal';
import HouseHistoryModal from '../common/modals/HouseHistoryModal';
import '../../styles/HouseDetailView.css';

/************************************************************
 * DESCRIPTION: HouseDetailView 컴포넌트
 *              집 상세보기 메인 컨테이너 컴포넌트
 *              물품 관리의 핵심 화면으로 다음 기능을 제공:
 *              - 계층 구조 탐색 (집 > 영역 > 박스 > 물품)
 *              - 3개 패널 레이아웃 (PC) 또는 모바일 레이아웃
 *              - 임시보관함으로 물품 이동
 *              - 검색, 히스토리, 추가/수정/삭제
 *
 * PROPS:
 * - houseId: 초기 선택된 집 ID
 * - houseName: 초기 선택된 집 이름
 *
 * SPECIAL:
 * - forwardRef: 부모 컴포넌트에서 메서드 접근 가능
 * - useImperativeHandle로 handleUpClick, handleAddClick 등 노출
 ************************************************************/
const HouseDetailView = forwardRef(function HouseDetailView(props, ref) {

  /************************************************************
   * DESCRIPTION: State 선언부 - 경로 및 데이터 관리
   ************************************************************/
  const [currentPath, setCurrentPath] = useState([]); // 현재 경로 (컨테이너 ID 배열)
  const [pathNames, setPathNames] = useState([]); // 경로 이름 배열 (브레드크럼 표시용)
  const [siblings, setSiblings] = useState([]); // 형제 컨테이너 (왼쪽 패널)
  const [children, setChildren] = useState([]); // 자식 컨테이너 (중앙 패널)
  const [selectedItem, setSelectedItem] = useState(null); // 선택된 항목
  const [detailInfo, setDetailInfo] = useState(null); // 상세 정보 (오른쪽 패널)
  const [childPreview, setChildPreview] = useState([]); // 하위 항목 미리보기 (최대 5개)
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(''); // 에러 메시지

  /************************************************************
   * DESCRIPTION: State 선언부 - 모달 상태
   ************************************************************/
  const [showAddModal, setShowAddModal] = useState(false); // 추가 모달
  const [showEditModal, setShowEditModal] = useState(false); // 수정 모달
  const [showSearchModal, setShowSearchModal] = useState(false); // 검색 모달
  const [showTempStorageModal, setShowTempStorageModal] = useState(false); // 임시보관함 모달
  const [showHistoryModal, setShowHistoryModal] = useState(false); // 히스토리 모달
  const [addParentId, setAddParentId] = useState(null); // 추가할 때 부모 ID

  /************************************************************
   * DESCRIPTION: State 선언부 - 최근 활동
   ************************************************************/
  const [recentLogs, setRecentLogs] = useState([]); // 최근 활동 로그 배열
  const [isActivityExpanded, setIsActivityExpanded] = useState(false); // 최근 활동 확장 상태
  const [isInitialActivityLoad, setIsInitialActivityLoad] = useState(true); // 초기 로드 애니메이션 제어

  /************************************************************
   * DESCRIPTION: State 선언부 - 임시보관함
   ************************************************************/
  const [tempStorage, setTempStorage] = useState([]); // 임시보관함 배열 (localStorage와 동기화)

  /************************************************************
   * DESCRIPTION: State 선언부 - 집 목록
   ************************************************************/
  const [houses, setHouses] = useState([]); // 모든 집 목록
  const [selectedHouseId, setSelectedHouseId] = useState(props.houseId); // 현재 선택된 집 ID

  /************************************************************
   * DESCRIPTION: State 선언부 - 모바일 대응
   ************************************************************/
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // 모바일 여부 (768px 기준)
  const [showBottomSheet, setShowBottomSheet] = useState(false); // 모바일 바텀시트 표시 여부

  /************************************************************
   * DESCRIPTION: State 선언부 - 기타
   ************************************************************/
  const [shouldScrollToSelected, setShouldScrollToSelected] = useState(false); // 자동 스크롤 트리거 (검색/히스토리에서 이동 시)

  /************************************************************
   * DESCRIPTION: 계산된 값 - 현재 선택된 집 이름
   *              houses 배열에서 selectedHouseId에 해당하는 집의 이름을 찾음
   ************************************************************/
  const selectedHouseName = houses.find(h => h.id === selectedHouseId)?.name || props.houseName;

  /************************************************************
   * DESCRIPTION: Ref 선언부
   *              AbortController로 이전 API 요청 취소 (상세 정보 로드 최적화)
   ************************************************************/
  const abortControllerRef = useRef(null);

  /************************************************************
   * DESCRIPTION: useEffect - 초기 로드
   *              컴포넌트 마운트 시 집 목록과 임시보관함 데이터를 로드
   ************************************************************/
  useEffect(() => {
    const init = async () => {
      /* 1. 집 목록 조회 (서버에서) */
      await fetchHouses();

      /* 2. 임시보관함 데이터 로드 (localStorage에서) */
      loadTempStorage();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열 = 마운트 시 한 번만 실행

  /************************************************************
   * DESCRIPTION: useEffect - 선택된 집 변경 시 최근 활동 조회
   *              사용자가 다른 집을 선택하면 해당 집의 최근 활동을 가져옴
   ************************************************************/
  useEffect(() => {
    if (selectedHouseId) {
      fetchRecentLogs(3); // 최근 3개 로그만 조회
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHouseId]); // selectedHouseId가 변경될 때마다 실행

  /************************************************************
   * DESCRIPTION: useEffect - 반응형 감지 (resize 이벤트)
   *              브라우저 창 크기 변경 시 모바일/PC 모드 전환
   ************************************************************/
  useEffect(() => {
    /* 윈도우 리사이즈 핸들러 */
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // 768px 이하면 모바일
    };

    /* 리사이즈 이벤트 리스너 등록 */
    window.addEventListener('resize', handleResize);

    /* cleanup: 컴포넌트 언마운트 시 이벤트 리스너 제거 */
    return () => window.removeEventListener('resize', handleResize);
  }, []); // 마운트 시 한 번만 등록

  /************************************************************
   * DESCRIPTION: useEffect - 집 목록 로드 후 초기 선택 처리
   *              집 목록이 로드되면 현재 집을 선택하고 루트 레벨 목록을 가져옴
   ************************************************************/
  useEffect(() => {
    if (houses.length > 0 && selectedHouseId && currentPath.length === 0) {
      /* 1. 현재 선택된 집 찾기 */
      const currentHouse = houses.find(h => h.id === selectedHouseId);

      if (currentHouse && (!selectedItem || selectedItem.id !== currentHouse.id)) {
        /* 2. 집 정보를 상세정보 패널에 표시 */
        const houseInfo = {
          ...currentHouse,
          type_cd: 'house', // 집임을 표시
          child_count: currentHouse.container_count || 0
        };
        setSelectedItem(houseInfo);
        setDetailInfo(houseInfo);

        /* 3. 중앙 목록 로드 (초기 진입 시) */
        const loadInitialChildren = async () => {
          try {
            const response = await api.get(
              `/houses/${selectedHouseId}/containers?level=root`, // 루트 레벨 조회
              { }
            );
            setChildren(response.data.containers); // 중앙 패널에 표시할 목록
          } catch (err) {
            console.error('초기 목록 로드 실패:', err);
          }
        };
        loadInitialChildren();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [houses, selectedHouseId]); // houses 또는 selectedHouseId 변경 시 실행

  /************************************************************
   * DESCRIPTION: useEffect - 선택된 아이템으로 스크롤
   *              검색/히스토리에서 특정 항목으로 이동 시
   *              해당 항목이 보이도록 스크롤 이동
   ************************************************************/
  useEffect(() => {
    if (shouldScrollToSelected && selectedItem && selectedItem.id) {
      /* 1. DOM이 완전히 렌더링된 후 스크롤하기 위해 약간의 지연 */
      const timeoutId = setTimeout(() => {
        /* 2. data-container-id 속성으로 해당 요소 찾기 */
        const element = document.querySelector(`[data-container-id="${selectedItem.id}"]`);

        if (element) {
          /* 3. 부드럽게 스크롤하여 화면 중앙에 표시 */
          element.scrollIntoView({
            behavior: 'smooth', // 부드러운 스크롤
            block: 'center' // 화면 중앙에 위치
          });
        }

        /* 4. 스크롤 완료 후 트리거 해제 */
        setShouldScrollToSelected(false);
      }, 100); // 100ms 지연

      /* cleanup: 타이머 정리 */
      return () => clearTimeout(timeoutId);
    }
  }, [shouldScrollToSelected, selectedItem]); // 트리거나 선택 항목 변경 시 실행

  /************************************************************
   * DESCRIPTION: 집 목록 조회 함수
   *              서버에서 사용자가 접근 가능한 모든 집 목록을 가져옴
   ************************************************************/
  const fetchHouses = async () => {
    try {
      /* API 호출: 모든 집 목록 조회 */
      const response = await api.get('/houses');
      setHouses(response.data.houses);
    } catch (err) {
      console.error('집 목록 조회 실패:', err);
      setError('집 목록을 불러오는데 실패했습니다');
    }
  };

  /************************************************************
   * DESCRIPTION: 최근 활동 조회 함수
   *              선택된 집의 최근 변경 이력을 가져옴
   *
   * PARAMS:
   * - limit: 가져올 로그 개수 (기본값 3)
   ************************************************************/
  const fetchRecentLogs = async (limit = 3) => {
    try {
      /* 1. API 호출: 최근 로그 조회 */
      const response = await api.get(`/houses/${selectedHouseId}/logs?limit=${limit}`);
      setRecentLogs(response.data.logs || []);

      /* 2. 초기 로드 후에는 애니메이션 비활성화 */
      if (isInitialActivityLoad) {
        setTimeout(() => setIsInitialActivityLoad(false), 500);
      }
    } catch (err) {
      console.error('최근 활동 조회 실패:', err);
      /* 에러 시 빈 배열로 설정 (UI에서 "활동 내역이 없습니다" 표시) */
      setRecentLogs([]);
    }
  };

  /************************************************************
   * DESCRIPTION: 집 클릭 핸들러 (단일 클릭)
   *              집을 클릭하면 상세정보만 표시 (경로나 목록은 변경하지 않음)
   *
   * PARAMS:
   * - house: 클릭한 집 객체
   ************************************************************/
  const handleHouseClick = (house) => {
    /* 1. 집 정보를 상세정보용 형식으로 변환 */
    const houseInfo = {
      ...house,
      type_cd: 'house', // 집임을 표시
      type_nm: '집',
      child_count: house.container_count || 0
    };

    /* 2. 상세정보 패널에 집 정보 표시 */
    setSelectedItem(houseInfo);
    setDetailInfo(houseInfo);
    setChildPreview([]); // 집은 하위 미리보기 없음
  };

  /************************************************************
   * DESCRIPTION: 집 더블클릭 핸들러 - 드릴다운
   *              집을 더블클릭하면 해당 집 내부로 진입 (루트 레벨 표시)
   *
   * PARAMS:
   * - house: 더블클릭한 집 객체
   ************************************************************/
  const handleHouseDoubleClick = async (house) => {
    try {
      /* 1. 집 전환 (다른 집을 선택한 경우) */
      if (house.id !== selectedHouseId) {
        setSelectedHouseId(house.id);
      }

      /* 2. 집 목록 백그라운드 새로고침 (로딩 표시 없이) */
      fetchHouses();

      /* 3. 중앙 패널만 로딩 표시 */
      setLoading(true);

      /* 4. 집 내부로 진입 (해당 집의 루트 레벨 로드) */
      const response = await api.get(
        `/houses/${house.id}/containers?level=root`, // 루트 레벨 조회
        { }
      );

      /* 5. 경로 초기화 (최상위로 이동) */
      setCurrentPath([]);
      setPathNames([]);
      setSiblings([]);
      setChildren(response.data.containers); // 루트 레벨 컨테이너들

      /* 6. 집 정보를 선택 및 상세정보 표시 */
      const houseInfo = {
        ...house,
        type_cd: 'house',
        type_nm: '집',
        child_count: house.container_count || 0
      };
      setSelectedItem(houseInfo);
      setDetailInfo(houseInfo);

      /* 7. 로딩 완료 */
      setLoading(false);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다');
      setLoading(false);
      console.error(err);
    }
  };

  /************************************************************
   * DESCRIPTION: 임시보관함 localStorage 키 생성 함수
   *              전역으로 하나의 임시보관함 사용
   ************************************************************/
  const getTempStorageKey = () => 'tempStorage_global';

  /************************************************************
   * DESCRIPTION: 임시보관함 데이터 로드
   *              localStorage에서 임시보관함 데이터를 불러옴
   ************************************************************/
  const loadTempStorage = () => {
    /* 1. localStorage 키 가져오기 */
    const key = getTempStorageKey();
    const saved = localStorage.getItem(key);

    if (saved) {
      try {
        /* 2. JSON 파싱하여 state에 설정 */
        setTempStorage(JSON.parse(saved));
      } catch {
        /* 파싱 실패 시 빈 배열 */
        setTempStorage([]);
      }
    } else {
      /* 저장된 데이터 없으면 빈 배열 */
      setTempStorage([]);
    }
  };

  /************************************************************
   * DESCRIPTION: 임시보관함 데이터 저장
   *              localStorage와 state를 동시에 업데이트
   *
   * PARAMS:
   * - newTempStorage: 저장할 임시보관함 배열
   ************************************************************/
  const saveTempStorage = (newTempStorage) => {
    /* 1. localStorage에 JSON으로 저장 */
    const key = getTempStorageKey();
    localStorage.setItem(key, JSON.stringify(newTempStorage));

    /* 2. state 업데이트 */
    setTempStorage(newTempStorage);
  };

  /************************************************************
   * DESCRIPTION: 최상위 레벨 로드 함수
   *              현재 집의 루트 레벨로 이동 (경로 초기화)
   ************************************************************/
  const loadRootLevel = async () => {
    setLoading(true);
    try {
      /* 1. 루트 레벨 컨테이너 목록 조회 */
      const response = await api.get(
        `/houses/${selectedHouseId}/containers?level=root`,
        { }
      );

      /* 2. 경로 초기화 */
      setCurrentPath([]);
      setPathNames([]);
      setSiblings([]);
      setChildren(response.data.containers);

      /* 3. 집 정보를 선택 및 상세정보 표시 */
      const currentHouse = houses.find(h => h.id === selectedHouseId);
      if (currentHouse) {
        const houseInfo = {
          ...currentHouse,
          type_cd: 'house',
          type_nm: '집',
          child_count: currentHouse.container_count || 0
        };
        setSelectedItem(houseInfo);
        setDetailInfo(houseInfo);
      }

      /* 4. 로딩 완료 */
      setLoading(false);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다');
      setLoading(false);
      console.error(err);
    }
  };

  /************************************************************
   * DESCRIPTION: 드릴다운 핸들러 (더블클릭)
   *              컨테이너 내부로 진입 (영역 또는 박스)
   *              물품(COM1200003)은 드릴다운 불가
   *
   * PARAMS:
   * - container: 더블클릭한 컨테이너 객체
   ************************************************************/
  const handleDrillDown = async (container) => {
    /* 물품이면 드릴다운 불가 (아무 동작 안 함) */
    if (container.type_cd === 'COM1200003') return;

    setLoading(true);
    try {
      /* 1. 현재 레벨의 형제 컨테이너 조회 (왼쪽 패널용) */
      let siblingsData = [];
      if (currentPath.length === 0) {
        /* 최상위 레벨인 경우: 루트 레벨 조회 */
        const response = await api.get(
          `/houses/${selectedHouseId}/containers?level=root`,
          { }
        );
        siblingsData = response.data.containers;
      } else {
        /* 하위 레벨인 경우: 현재 부모의 자식들 조회 */
        const parentId = currentPath[currentPath.length - 1];
        const response = await api.get(
          `/houses/${selectedHouseId}/containers?parent_id=${parentId}`,
          { }
        );
        siblingsData = response.data.containers;
      }

      /* 2. 드릴다운할 컨테이너의 자식들 조회 (중앙 패널용) */
      const childrenResponse = await api.get(
        `/houses/${selectedHouseId}/containers?parent_id=${container.id}`,
        { }
      );

      /* 3. 경로 업데이트 (한 단계 깊어짐) */
      setCurrentPath([...currentPath, container.id]);
      setPathNames([...pathNames, container.name]);

      /* 4. 데이터 설정 */
      setSiblings(siblingsData); // 왼쪽 패널
      setChildren(childrenResponse.data.containers); // 중앙 패널
      setSelectedItem(container);
      setDetailInfo(container); // 목록 데이터를 즉시 표시 (API 재호출 안 함)

      /* 5. 로딩 완료 */
      setLoading(false);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다');
      setLoading(false);
      console.error(err);
    }
  };

  /************************************************************
   * DESCRIPTION: 항목 클릭 핸들러 (단일 클릭) - 최적화
   *              중앙 패널에서 항목을 클릭하면 상세 정보 표시
   *              목록 데이터를 즉시 표시하고, 백그라운드에서 상세 정보 로드
   *
   * PARAMS:
   * - container: 클릭한 컨테이너 객체
   ************************************************************/
  const handleItemClick = async (container) => {
    /* 1. 즉시 선택 및 표시 (목록 데이터 사용) */
    setSelectedItem(container);
    setDetailInfo(container); // 이미 목록에서 가져온 데이터를 즉시 표시
    setChildPreview([]); // 초기화

    /* 2. 이전 API 요청이 있으면 취소 (중복 요청 방지) */
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    /* 3. 새로운 AbortController 생성 */
    abortControllerRef.current = new AbortController();

    /* 4. 백그라운드에서 상세 정보 및 하위 항목 미리보기 로드 */
    try {
      const response = await api.get(
        `/houses/${selectedHouseId}/containers/${container.id}`,
        {
          signal: abortControllerRef.current.signal // 취소 가능하도록 signal 전달
        }
      );

      /* 5. 상세 정보로 업데이트 (하위 미리보기 포함) */
      setDetailInfo(response.data.container);
      setChildPreview(response.data.child_preview || []);
    } catch (err) {
      /* 취소된 요청은 에러 무시 */
      if (err.name !== 'CanceledError') {
        console.error('상세 정보 조회 실패:', err);
      }
    }
  };

  /************************************************************
   * DESCRIPTION: 모바일 전용 - 항목 클릭 시 바텀시트 열기
   *              모바일에서는 상세 정보를 바텀시트로 표시
   *
   * PARAMS:
   * - container: 클릭한 컨테이너 객체
   ************************************************************/
  const handleItemClickMobile = async (container) => {
    /* 1. 즉시 선택 및 바텀시트 열기 */
    setSelectedItem(container);
    setDetailInfo(container);
    setChildPreview([]);
    setShowBottomSheet(true); // 즉시 바텀시트 열기

    /* 2. 상세 정보 로드 (백그라운드) */
    try {
      const response = await api.get(
        `/houses/${selectedHouseId}/containers/${container.id}`,
        { }
      );

      /* 3. 상세 정보 업데이트 */
      setDetailInfo(response.data.container);
      setChildPreview(response.data.child_preview || []);
    } catch (err) {
      console.error('상세 정보 조회 실패:', err);
    }
  };

  /************************************************************
   * DESCRIPTION: 형제 클릭 핸들러 (왼쪽 패널) - 최적화
   *              왼쪽 패널에서 형제 컨테이너를 클릭하면 상세정보만 표시
   *              목록 데이터를 즉시 사용하고 API 재호출 안 함
   *
   * PARAMS:
   * - container: 클릭한 형제 컨테이너 객체
   ************************************************************/
  const handleSiblingClick = (container) => {
    setSelectedItem(container);
    setDetailInfo(container); // 목록에서 가져온 데이터를 즉시 표시 (API 호출 없음)
    setChildPreview([]); // 하위 항목 미리보기는 목록 데이터에 없으므로 초기화
  };

  /************************************************************
   * DESCRIPTION: 형제 더블클릭 핸들러 (왼쪽 패널) - 드릴다운
   *              왼쪽 패널에서 형제를 더블클릭하면 해당 컨테이너로 이동
   *              현재 경로의 마지막 항목을 클릭한 형제로 교체
   *
   * PARAMS:
   * - container: 더블클릭한 형제 컨테이너 객체
   ************************************************************/
  const handleSiblingDoubleClick = async (container) => {
    /* 물품이면 더블클릭해도 아무 동작 안 함 */
    if (container.type_cd === 'COM1200003') {
      return;
    }

    setLoading(true);
    try {
      /* 1. 클릭한 형제의 자식들 조회 */
      const response = await api.get(
        `/houses/${selectedHouseId}/containers?parent_id=${container.id}`,
        { }
      );

      /* 2. 경로 업데이트 (마지막 항목만 교체) */
      const newPath = [...currentPath];
      const newPathNames = [...pathNames];
      newPath[newPath.length - 1] = container.id; // 마지막 항목을 클릭한 형제로 교체
      newPathNames[newPathNames.length - 1] = container.name;

      /* 3. 데이터 설정 */
      setCurrentPath(newPath);
      setPathNames(newPathNames);
      setChildren(response.data.containers);
      setSelectedItem(container);
      setDetailInfo(container); // 목록 데이터 즉시 표시

      /* 4. 로딩 완료 */
      setLoading(false);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다');
      setLoading(false);
      console.error(err);
    }
  };

  /************************************************************
   * DESCRIPTION: 브레드크럼 클릭 핸들러
   *              브레드크럼 네비게이션에서 특정 경로를 클릭하면 해당 위치로 이동
   *              경로를 축소하여 상위 레벨로 돌아감
   *
   * PARAMS:
   * - index: 클릭한 브레드크럼 인덱스 (-1: 루트, 0 이상: 해당 경로)
   ************************************************************/
  const handleBreadcrumbClick = async (index) => {
    /* 1. 루트 레벨 클릭 시 */
    if (index === -1) {
      loadRootLevel();
    } else {
      /* 2. 특정 경로 레벨 클릭 시 */
      const targetId = currentPath[index];
      const newPath = currentPath.slice(0, index + 1); // 클릭한 인덱스까지만 유지
      const newPathNames = pathNames.slice(0, index + 1);

      setLoading(true);
      try {
        /* 3. 형제 데이터 조회 (왼쪽 패널용) */
        let siblingsData = [];
        if (index === 0) {
          /* 첫 번째 레벨: 루트 레벨 조회 */
          const response = await api.get(
            `/houses/${selectedHouseId}/containers?level=root`,
            { }
          );
          siblingsData = response.data.containers;
        } else {
          /* 하위 레벨: 부모의 자식들 조회 */
          const parentId = currentPath[index - 1];
          const response = await api.get(
            `/houses/${selectedHouseId}/containers?parent_id=${parentId}`,
            { }
          );
          siblingsData = response.data.containers;
        }

        /* 4. 자식 데이터 조회 (중앙 패널용) */
        const childrenResponse = await api.get(
          `/houses/${selectedHouseId}/containers?parent_id=${targetId}`,
          { }
        );

        /* 5. 데이터 설정 */
        setCurrentPath(newPath);
        setPathNames(newPathNames);
        setSiblings(siblingsData);
        setChildren(childrenResponse.data.containers);
        setSelectedItem(null); // 선택 해제
        setDetailInfo(null);

        /* 6. 로딩 완료 */
        setLoading(false);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다');
        setLoading(false);
        console.error(err);
      }
    }
  };

  /************************************************************
   * DESCRIPTION: 추가 버튼 클릭 핸들러
   *              추가 모달을 열고 부모 ID 설정
   *
   * PARAMS:
   * - parentId: 추가할 컨테이너의 부모 ID
   ************************************************************/
  const handleAddClick = (parentId) => {
    setAddParentId(parentId);
    setShowAddModal(true);
  };

  /************************************************************
   * DESCRIPTION: 추가 성공 핸들러
   *              모달을 닫고 현재 화면을 새로고침
   ************************************************************/
  const handleAddSuccess = () => {
    /* 1. 모달 닫기 */
    setShowAddModal(false);

    /* 2. 현재 화면 새로고침 */
    if (currentPath.length === 0) {
      loadRootLevel();
      fetchHouses(); // 최상위에서 추가 시 집 목록도 새로고침 (container_count 업데이트)
    } else {
      handleBreadcrumbClick(currentPath.length - 1);
    }

    /* 3. 최근 활동 갱신 */
    fetchRecentLogs(3);
  };

  /************************************************************
   * DESCRIPTION: 수정 버튼 클릭 핸들러
   *              수정 모달을 열고 선택 항목 설정
   *
   * PARAMS:
   * - container: 수정할 컨테이너 객체
   ************************************************************/
  const handleEditClick = (container) => {
    setSelectedItem(container);
    setShowEditModal(true);
  };

  /************************************************************
   * DESCRIPTION: 수정 성공 핸들러
   *              모달을 닫고 화면을 새로고침한 후
   *              수정된 항목을 다시 선택하여 상세정보 표시
   ************************************************************/
  const handleEditSuccess = async () => {
    /* 1. 모달 닫기 */
    setShowEditModal(false);

    /* 2. 수정된 컨테이너의 ID 저장 (재선택용) */
    const editedContainerId = selectedItem?.id;

    /* 3. 화면 새로고침 */
    if (currentPath.length === 0) {
      await loadRootLevel();
    } else {
      await handleBreadcrumbClick(currentPath.length - 1);
    }

    /* 4. 수정된 컨테이너를 다시 선택하고 상세정보 로드 */
    if (editedContainerId) {
      try {
        /* 4-1. 상세 정보 조회 */
        const response = await api.get(
          `/houses/${selectedHouseId}/containers/${editedContainerId}`,
          { }
        );

        const updatedContainer = response.data.container;
        setSelectedItem(updatedContainer);
        setDetailInfo(updatedContainer);

        /* 4-2. 하위 항목 미리보기 로드 (물품이 아닌 경우) */
        if (updatedContainer.type_cd !== 'COM1200003') {
          const childResponse = await api.get(
            `/houses/${selectedHouseId}/containers?parent_id=${updatedContainer.id}&limit=5`,
            { }
          );
          setChildPreview(childResponse.data.containers || []);
        } else {
          setChildPreview([]);
        }
      } catch (err) {
        console.error('수정된 항목 재선택 실패:', err);
      }
    }

    /* 5. 최근 활동 갱신 */
    fetchRecentLogs(3);
  };

  /************************************************************
   * DESCRIPTION: 삭제 핸들러
   *              확인 후 컨테이너를 삭제하고 화면 새로고침
   *              하위 항목도 모두 삭제됨 (서버에서 cascade 처리)
   *
   * PARAMS:
   * - container: 삭제할 컨테이너 객체
   ************************************************************/
  const handleDelete = async (container) => {
    /* 1. 사용자 확인 */
    if (!window.confirm(`"${container.name}"을(를) 정말 삭제하시겠습니까?\n\n하위 항목도 모두 삭제됩니다.`)) {
      return;
    }

    try {
      /* 2. API 호출: 삭제 요청 */
      await api.delete(
        `/houses/${selectedHouseId}/containers/${container.id}`,
        { }
      );

      /* 3. 화면 새로고침 */
      if (currentPath.length === 0) {
        loadRootLevel();
      } else {
        handleBreadcrumbClick(currentPath.length - 1);
      }

      /* 4. 최근 활동 갱신 */
      fetchRecentLogs(3);
    } catch (err) {
      alert('삭제에 실패했습니다: ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  /************************************************************
   * DESCRIPTION: 임시보관함에 추가 핸들러
   *              컨테이너를 임시보관함에 추가하고 localStorage에 저장
   *              현재 경로나 선택 항목이 추가된 경우 적절히 처리
   *
   * PARAMS:
   * - container: 임시보관함에 추가할 컨테이너 객체
   ************************************************************/
  const handleAddToTemp = (container) => {
    /* 1. 경로 정보를 포함하여 임시보관함 항목 생성 */
    const itemWithPath = {
      ...container,
      path: pathNames.length > 0 ? pathNames.join(' › ') : selectedHouseName,
      from_house_id: selectedHouseId,
      from_house_name: selectedHouseName
    };

    /* 2. 임시보관함에 추가 및 저장 */
    const newTemp = [...tempStorage, itemWithPath];
    saveTempStorage(newTemp);

    /* 3. 현재 경로의 컨테이너를 임시보관함에 추가한 경우 처리 */
    const isCurrentPathContainer = currentPath.length > 0 &&
                                   currentPath[currentPath.length - 1] === container.id;

    if (isCurrentPathContainer) {
      /* 상위 경로로 이동 (재귀 참조 방지) */
      if (currentPath.length === 1) {
        loadRootLevel();
      } else {
        handleBreadcrumbClick(currentPath.length - 2);
      }
    } else {
      /* 4. 임시보관함으로 이동한 항목이 현재 선택된 항목이면 상세정보 초기화 */
      if (selectedItem?.id === container.id) {
        setSelectedItem(null);
        setDetailInfo(null);
        setChildPreview([]);
      }
    }
  };

  /************************************************************
   * DESCRIPTION: 임시보관함에서 제거 핸들러
   *              특정 인덱스의 항목을 임시보관함에서 제거
   *
   * PARAMS:
   * - index: 제거할 항목의 인덱스
   ************************************************************/
  const handleRemoveFromTemp = (index) => {
    const newTemp = [...tempStorage];
    newTemp.splice(index, 1); // 해당 인덱스 항목 제거
    saveTempStorage(newTemp);
  };

  /************************************************************
   * DESCRIPTION: 임시보관함 전체 취소 핸들러
   *              임시보관함의 모든 항목을 제거
   ************************************************************/
  const handleClearAllTemp = () => {
    saveTempStorage([]);
  };

  /************************************************************
   * DESCRIPTION: 임시보관함 전체 이동 핸들러 ("여기로 이동" 버튼)
   *              임시보관함의 모든 항목을 현재 선택된 위치로 이동
   *              같은 집 내 이동과 집 간 이동을 구분하여 처리
   *              실패한 항목은 임시보관함에 남김
   ************************************************************/
  const handleMoveToHere = async () => {
    /* 1. 임시보관함이 비어있는지 확인 */
    if (tempStorage.length === 0) {
      alert('임시보관함이 비어있습니다');
      return;
    }

    /* 2. 목적지 집 ID 결정 */
    let targetHouseId;
    if (selectedItem?.type_cd === 'house') {
      targetHouseId = selectedItem.id; // 집을 클릭한 경우: 해당 집의 ID 사용
    } else {
      targetHouseId = selectedHouseId; // 컨테이너를 클릭한 경우: 현재 선택된 집 ID 사용
    }

    /* 3. 목적지 부모 ID 결정 */
    let targetParentId;
    if (selectedItem?.type_cd === 'house') {
      targetParentId = null; // 집 = 최상위로 이동
    } else {
      /* 선택된 항목이 있으면 그 안으로, 없으면 현재 경로의 마지막 위치로 */
      targetParentId = selectedItem?.id || (currentPath.length > 0 ? currentPath[currentPath.length - 1] : null);
    }

    /* 4. 현재 선택 상태 백업 (화면 새로고침 후 복원용) */
    const currentSelectedItem = selectedItem;
    const currentDetailInfo = detailInfo;

    try {
      /* 5. 각 항목을 순회하며 이동 시도 */
      const failedItems = []; // 실패한 항목 저장

      for (const item of tempStorage) {
        try {
          /* 5-1. 출발지 집 ID 확인 */
          const fromHouseId = item.from_house_id || targetHouseId;

          if (fromHouseId === targetHouseId) {
            /* 5-2. 같은 집 내 이동: 부모만 변경 */
            await api.patch(
              `/houses/${targetHouseId}/containers/${item.id}`,
              { up_container_id: targetParentId },
              { }
            );
          } else {
            /* 5-3. 집 간 이동: 전용 move API 사용 */
            await api.patch(
              `/houses/${fromHouseId}/containers/${item.id}/move`,
              {
                parent_id: targetParentId,
                to_house_id: targetHouseId
              },
              { }
            );
          }
        } catch (err) {
          console.error(`"${item.name}" 이동 실패:`, err.response?.data || err);
          failedItems.push(item); // 실패한 항목은 리스트에 추가
        }
      }

      /* 6. 실패한 항목이 있으면 사용자에게 알림 */
      if (failedItems.length > 0) {
        alert(`${tempStorage.length - failedItems.length}개 항목이 이동되었습니다.\n${failedItems.length}개 항목은 실패했습니다.`);
      }

      /* 7. 화면 새로고침 (임시보관함 필터링 유지) */
      if (currentPath.length === 0) {
        /* 7-1. 최상위 경로: 루트 레벨 새로고침 */
        const response = await api.get(
          `/houses/${selectedHouseId}/containers?level=root`,
          { }
        );
        setChildren(response.data.containers); // 먼저 새 목록 설정
        setTimeout(() => saveTempStorage(failedItems), 0); // 렌더링 후 임시보관함 업데이트
      } else {
        /* 7-2. 하위 경로: 현재 경로 새로고침 */

        /* 형제 데이터 조회 */
        let siblingsData = [];
        if (currentPath.length === 1) {
          const response = await api.get(
            `/houses/${selectedHouseId}/containers?level=root`,
            { }
          );
          siblingsData = response.data.containers;
        } else {
          const parentId = currentPath[currentPath.length - 2];
          const response = await api.get(
            `/houses/${selectedHouseId}/containers?parent_id=${parentId}`,
            { }
          );
          siblingsData = response.data.containers;
        }

        /* 자식 데이터 조회 */
        const targetId = currentPath[currentPath.length - 1];
        const childrenResponse = await api.get(
          `/houses/${selectedHouseId}/containers?parent_id=${targetId}`,
          { }
        );

        /* 데이터 설정 */
        setSiblings(siblingsData);
        setChildren(childrenResponse.data.containers);

        /* 선택 상태 복원 */
        setSelectedItem(currentSelectedItem);
        setDetailInfo(currentDetailInfo);

        /* 임시보관함 업데이트 (실패한 항목만 남김) */
        setTimeout(() => saveTempStorage(failedItems), 0);
      }

      /* 8. 집 목록 새로고침 (항목 개수 업데이트) */
      fetchHouses();

      /* 9. 최근 활동 갱신 */
      fetchRecentLogs(3);

      /* 10. 모바일에서는 바텀시트 닫기 */
      if (isMobile && showBottomSheet) {
        setShowBottomSheet(false);
      }
    } catch (err) {
      alert('이동에 실패했습니다: ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  /************************************************************
   * DESCRIPTION: 임시보관함 단일 항목 이동 핸들러
   *              임시보관함에서 선택한 하나의 항목만 현재 위치로 이동
   *              handleMoveToHere와 유사하지만 단일 항목만 처리
   *
   * PARAMS:
   * - index: 임시보관함에서 이동할 항목의 인덱스
   ************************************************************/
  const handleMoveSingleToHere = async (index) => {
    const item = tempStorage[index];

    /* 1. 목적지 집 ID 결정 */
    let targetHouseId;
    if (selectedItem?.type_cd === 'house') {
      targetHouseId = selectedItem.id; // 집을 클릭한 경우
    } else {
      targetHouseId = selectedHouseId; // 컨테이너를 클릭한 경우
    }

    /* 2. 목적지 부모 ID 결정 */
    let targetParentId;
    if (selectedItem?.type_cd === 'house') {
      targetParentId = null; // 집 = 최상위
    } else {
      targetParentId = selectedItem?.id || (currentPath.length > 0 ? currentPath[currentPath.length - 1] : null);
    }

    /* 3. 현재 선택 상태 백업 */
    const currentSelectedItem = selectedItem;
    const currentDetailInfo = detailInfo;

    try {
      /* 4. 출발지 집 ID 확인 */
      const fromHouseId = item.from_house_id || targetHouseId;

      /* 5. 이동 API 호출 */
      if (fromHouseId === targetHouseId) {
        /* 같은 집 내 이동 */
        await api.patch(
          `/houses/${targetHouseId}/containers/${item.id}`,
          { up_container_id: targetParentId },
          { }
        );
      } else {
        /* 집 간 이동 */
        await api.patch(
          `/houses/${fromHouseId}/containers/${item.id}/move`,
          {
            parent_id: targetParentId,
            to_house_id: targetHouseId
          },
          { }
        );
      }

      /* 6. 임시보관함에서 이동된 항목 제거 */
      const newTemp = [...tempStorage];
      newTemp.splice(index, 1);

      /* 7. 화면 새로고침 */
      if (currentPath.length === 0) {
        /* 최상위 경로: 루트 레벨 새로고침 */
        const response = await api.get(
          `/houses/${selectedHouseId}/containers?level=root`,
          { }
        );
        setChildren(response.data.containers);
        setTimeout(() => saveTempStorage(newTemp), 0); // 임시보관함 업데이트
      } else {
        /* 하위 경로: 현재 경로 새로고침 */
        let siblingsData = [];
        if (currentPath.length === 1) {
          const response = await api.get(
            `/houses/${selectedHouseId}/containers?level=root`,
            { }
          );
          siblingsData = response.data.containers;
        } else {
          const parentId = currentPath[currentPath.length - 2];
          const response = await api.get(
            `/houses/${selectedHouseId}/containers?parent_id=${parentId}`,
            { }
          );
          siblingsData = response.data.containers;
        }

        const targetId = currentPath[currentPath.length - 1];
        const childrenResponse = await api.get(
          `/houses/${selectedHouseId}/containers?parent_id=${targetId}`,
          { }
        );

        setSiblings(siblingsData);
        setChildren(childrenResponse.data.containers);
        setSelectedItem(currentSelectedItem); // 선택 상태 복원
        setDetailInfo(currentDetailInfo);
        setTimeout(() => saveTempStorage(newTemp), 0);
      }

      /* 8. 집 목록 새로고침 */
      fetchHouses();

      /* 9. 최근 활동 갱신 */
      fetchRecentLogs(3);

      /* 10. 모바일에서는 바텀시트 닫기 */
      if (isMobile && showBottomSheet) {
        setShowBottomSheet(false);
      }
    } catch (err) {
      alert('이동에 실패했습니다: ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  /************************************************************
   * DESCRIPTION: 새로고침 핸들러
   *              현재 화면을 새로고침하고 최근 활동 갱신
   ************************************************************/
  const handleRefresh = () => {
    if (currentPath.length === 0) {
      loadRootLevel();
    } else {
      handleBreadcrumbClick(currentPath.length - 1);
    }
    fetchRecentLogs(3); // 최근 활동 갱신
  };

  /************************************************************
   * DESCRIPTION: 모바일 전용 - 바텀시트에서 드릴다운
   *              바텀시트를 닫고 드릴다운 실행
   *              물품이 아닌 경우에만 동작
   ************************************************************/
  const handleDrillDownFromSheet = async () => {
    if (!selectedItem || selectedItem.type_cd === 'COM1200003') return;

    /* 1. 바텀시트 닫기 */
    setShowBottomSheet(false);

    /* 2. 닫기 애니메이션 후 드릴다운 실행 (300ms 대기) */
    setTimeout(() => {
      handleDrillDown(selectedItem);
    }, 300);
  };

  /************************************************************
   * DESCRIPTION: useImperativeHandle - 부모 컴포넌트에 메서드 노출
   *              forwardRef와 함께 사용하여 부모 컴포넌트에서
   *              이 컴포넌트의 메서드와 상태에 접근 가능하게 함
   *
   * EXPOSED:
   * - currentPath: 현재 경로
   * - tempStorage: 임시보관함
   * - handleUpClick: 상위로 이동
   * - handleAddClick: 추가 모달 열기
   * - handleSearchClick: 검색 모달 열기
   * - handleRefreshClick: 새로고침
   * - handleTempStorageClick: 임시보관함 모달 열기
   ************************************************************/
  useImperativeHandle(ref, () => ({
    currentPath,
    tempStorage,
    handleUpClick: () => {
      if (currentPath.length === 1) {
        loadRootLevel();
      } else if (currentPath.length > 1) {
        handleBreadcrumbClick(currentPath.length - 2);
      }
    },
    handleAddClick: () => {
      const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;
      handleAddClick(parentId);
    },
    handleSearchClick: () => setShowSearchModal(true),
    handleRefreshClick: handleRefresh,
    handleTempStorageClick: () => setShowTempStorageModal(true)
  }));

  /************************************************************
   * DESCRIPTION: 검색 결과 선택 핸들러
   *              검색 모달에서 항목을 선택하면 해당 위치로 이동
   *              부모 경로를 역추적하여 정확한 위치로 네비게이션
   *
   * PARAMS:
   * - result: 검색 결과 객체 (id 포함)
   ************************************************************/
  const handleSearchSelect = async (result) => {
    try {
      /* 1. 선택된 컨테이너의 상세 정보 조회 */
      const response = await api.get(
        `/houses/${selectedHouseId}/containers/${result.id}`,
        { }
      );
      const container = response.data.container;

      /* 2. 부모 경로 역추적 (최상위까지 올라가며 경로 구성) */
      let parentPath = [];
      let parentPathNames = [];
      let currentParentId = container.up_container_id;

      while (currentParentId) {
        const parentResponse = await api.get(
          `/houses/${selectedHouseId}/containers/${currentParentId}`,
          { }
        );
        const parent = parentResponse.data.container;
        parentPath.unshift(parent.id); // 앞에 추가 (역순)
        parentPathNames.unshift(parent.name);
        currentParentId = parent.up_container_id;
      }

      /* 3. 물품인 경우: 부모 위치로 이동 후 선택 */
      if (container.type_cd === 'COM1200003') {
        /* 형제 데이터 조회 */
        let siblingsData = [];
        if (parentPath.length === 1) {
          const siblingsResponse = await api.get(
            `/houses/${selectedHouseId}/containers?level=root`,
            { }
          );
          siblingsData = siblingsResponse.data.containers;
        } else if (parentPath.length > 1) {
          const grandParentId = parentPath[parentPath.length - 2];
          const siblingsResponse = await api.get(
            `/houses/${selectedHouseId}/containers?parent_id=${grandParentId}`,
            { }
          );
          siblingsData = siblingsResponse.data.containers;
        }

        /* 부모의 자식들 조회 (물품이 포함된 목록) */
        const childrenResponse = await api.get(
          `/houses/${selectedHouseId}/containers?parent_id=${container.up_container_id}`,
          { }
        );

        /* 경로 설정 및 선택 */
        setCurrentPath(parentPath);
        setPathNames(parentPathNames);
        setSiblings(siblingsData);
        setChildren(childrenResponse.data.containers);
        setSelectedItem(container);
        setDetailInfo(container);
      } else {
        /* 4. 영역/박스인 경우: 해당 컨테이너 위치로 이동 */
        if (parentPath.length === 0) {
          loadRootLevel();
        } else {
          await handleBreadcrumbClick(parentPath.length - 1);
        }

        setSelectedItem(container);
        setDetailInfo(container);
      }

      /* 5. 모달 닫기 */
      setShowSearchModal(false);

      /* 6. 스크롤 트리거 (선택된 항목으로 자동 스크롤) */
      setShouldScrollToSelected(true);
    } catch (err) {
      console.error('이동 실패:', err);
      alert('위치로 이동하는데 실패했습니다');
      setShowSearchModal(false);
    }
  };

  /************************************************************
   * DESCRIPTION: 히스토리 모달 네비게이션 핸들러
   *              히스토리 모달에서 특정 컨테이너를 클릭하면 해당 위치로 이동
   *              검색 결과 선택과 유사하지만 경로 정보가 이미 제공됨
   *
   * PARAMS:
   * - container: 이동할 컨테이너 객체
   * - parentPath: 부모 경로 ID 배열
   * - parentPathNames: 부모 경로 이름 배열
   ************************************************************/
  const handleHistoryNavigate = async ({ container, parentPath, parentPathNames }) => {
    try {
      /* 1. 물품인 경우: 부모 위치로 이동 후 선택 */
      if (container.type_cd === 'COM1200003') {
        /* 형제 데이터 조회 */
        let siblingsData = [];
        if (parentPath.length === 1) {
          const siblingsResponse = await api.get(
            `/houses/${selectedHouseId}/containers?level=root`,
            { }
          );
          siblingsData = siblingsResponse.data.containers;
        } else if (parentPath.length > 1) {
          const grandParentId = parentPath[parentPath.length - 2];
          const siblingsResponse = await api.get(
            `/houses/${selectedHouseId}/containers?parent_id=${grandParentId}`,
            { }
          );
          siblingsData = siblingsResponse.data.containers;
        }

        /* 부모의 자식들 조회 */
        const childrenResponse = await api.get(
          `/houses/${selectedHouseId}/containers?parent_id=${container.up_container_id}`,
          { }
        );

        /* 경로 설정 및 선택 */
        setCurrentPath(parentPath);
        setPathNames(parentPathNames);
        setSiblings(siblingsData);
        setChildren(childrenResponse.data.containers);
        setSelectedItem(container);
        setDetailInfo(container);
      } else {
        /* 2. 영역/박스인 경우: 해당 컨테이너 위치로 이동 */
        if (parentPath.length === 0) {
          loadRootLevel();
        } else {
          await handleBreadcrumbClick(parentPath.length - 1);
        }

        setSelectedItem(container);
        setDetailInfo(container);
      }

      /* 3. 스크롤 트리거 */
      setShouldScrollToSelected(true);
    } catch (err) {
      console.error('컨테이너 이동 실패:', err);
      alert('위치로 이동하는데 실패했습니다');
    }
  };

  /************************************************************
   * DESCRIPTION: JSX 렌더링 - 전체 화면 구조
   ************************************************************/
  return (
    <div className="house-detail-view">
      {/* 헤더 (최근 활동 + 브레드크럼) */}
      <div className="header">
        <ActivitySection
          recentLogs={recentLogs}
          isActivityExpanded={isActivityExpanded}
          setIsActivityExpanded={setIsActivityExpanded}
          isInitialActivityLoad={isInitialActivityLoad}
          selectedHouseName={selectedHouseName}
          onHistoryClick={() => setShowHistoryModal(true)}
        />

        {!isMobile && (
          <BreadcrumbNav
            isMobile={false}
            selectedHouseName={selectedHouseName}
            pathNames={pathNames}
            onBreadcrumbClick={handleBreadcrumbClick}
          />
        )}

        {isMobile && (
          <BreadcrumbNav
            isMobile={true}
            selectedHouseName={selectedHouseName}
            pathNames={pathNames}
            onBreadcrumbClick={handleBreadcrumbClick}
          />
        )}
      </div>

      {error && <div className="error-box">{error}</div>}

      {/* PC/모바일 분기 */}
      {isMobile ? (
        <MobileLayout
          children={children}
          tempStorage={tempStorage}
          loading={loading}
          selectedItem={selectedItem}
          detailInfo={detailInfo}
          childPreview={childPreview}
          showBottomSheet={showBottomSheet}
          houseId={selectedHouseId}
          houseName={selectedHouseName}
          pathNames={pathNames}
          onItemClick={handleItemClickMobile}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          onAddToTemp={handleAddToTemp}
          onRemoveFromTemp={handleRemoveFromTemp}
          onClearAll={handleClearAllTemp}
          onMoveToHere={handleMoveToHere}
          onMoveSingleToHere={handleMoveSingleToHere}
          onDrillDownFromSheet={handleDrillDownFromSheet}
          onCloseBottomSheet={() => setShowBottomSheet(false)}
        />
      ) : (
        <div className="panel-container">
          <LeftPanel
            currentPath={currentPath}
            pathNames={pathNames}
            selectedHouseName={selectedHouseName}
            houses={houses}
            siblings={siblings}
            selectedItem={selectedItem}
            tempStorage={tempStorage}
            onHouseClick={handleHouseClick}
            onHouseDoubleClick={handleHouseDoubleClick}
            onSiblingClick={handleSiblingClick}
            onSiblingDoubleClick={handleSiblingDoubleClick}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onAddToTemp={handleAddToTemp}
          />

          <CenterPanel
            currentPath={currentPath}
            pathNames={pathNames}
            selectedHouseName={selectedHouseName}
            children={children}
            selectedItem={selectedItem}
            tempStorage={tempStorage}
            loading={loading}
            onItemClick={handleItemClick}
            onDrillDown={handleDrillDown}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onAddToTemp={handleAddToTemp}
            onAddClick={handleAddClick}
            onRemoveFromTemp={handleRemoveFromTemp}
            onClearAll={handleClearAllTemp}
            onMoveToHere={handleMoveToHere}
          />

          <RightPanel
            detailInfo={detailInfo}
            childPreview={childPreview}
            tempStorage={tempStorage}
            houseId={selectedHouseId}
            houseName={selectedHouseName}
            pathNames={pathNames}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onMoveToHere={handleMoveToHere}
            onMoveSingleToHere={handleMoveSingleToHere}
            onRemoveFromTemp={handleRemoveFromTemp}
            onClearAll={handleClearAllTemp}
          />
        </div>
      )}

      {/* 모달들 */}
      {showAddModal && (
        <AddContainerModal
          houseId={selectedHouseId}
          parentId={addParentId}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {showEditModal && selectedItem && (
        <EditContainerModal
          houseId={selectedHouseId}
          container={selectedItem}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {showSearchModal && (
        <SearchModal
          houseId={selectedHouseId}
          houseName={selectedHouseName}
          onClose={() => setShowSearchModal(false)}
          onSelect={handleSearchSelect}
        />
      )}

      {showTempStorageModal && (
        <TempStorageModal
          tempStorage={tempStorage}
          onClose={() => setShowTempStorageModal(false)}
          onRemove={handleRemoveFromTemp}
          onClearAll={handleClearAllTemp}
        />
      )}

      {showHistoryModal && (
        <HouseHistoryModal
          houseId={selectedHouseId}
          houseName={selectedHouseName}
          onClose={() => setShowHistoryModal(false)}
          onNavigateToContainer={handleHistoryNavigate}
        />
      )}
    </div>
  );
});

export default HouseDetailView;
