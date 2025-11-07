import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import ContainerCard from './ContainerCard';
import AddContainerModal from './AddContainerModal';
import EditContainerModal from './EditContainerModal';
import SearchModal from './SearchModal';
import TempStorageModal from './TempStorageModal';
import ContainerDetail from './ContainerDetail/ContainerDetail';
import '../styles/HouseDetailView.css';

function HouseDetailView(props) {
  // 상태 관리
  const [currentPath, setCurrentPath] = useState([]);
  const [pathNames, setPathNames] = useState([]);
  const [siblings, setSiblings] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailInfo, setDetailInfo] = useState(null);
  const [childPreview, setChildPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 모달 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showTempStorageModal, setShowTempStorageModal] = useState(false);
  const [addParentId, setAddParentId] = useState(null);

  // 임시보관함 상태
  const [tempStorage, setTempStorage] = useState([]);

  // 초기 로드
  useEffect(() => {
    loadRootLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.houseId]);

  // 최상위 레벨 로드
  const loadRootLevel = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/houses/${props.houseId}/containers?level=root`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentPath([]);
      setPathNames([]);
      setSiblings([]);
      setChildren(response.data.containers);
      setSelectedItem(null);
      setDetailInfo(null);
      setLoading(false);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다');
      setLoading(false);
      console.error(err);
    }
  };

  // 드릴다운 (더블클릭)
  const handleDrillDown = async (container) => {
    if (container.type_cd === 'COM1200003') return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      let siblingsData = [];
      if (currentPath.length === 0) {
        const response = await axios.get(
          `${API_URL}/api/houses/${props.houseId}/containers?level=root`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        siblingsData = response.data.containers;
      } else {
        const parentId = currentPath[currentPath.length - 1];
        const response = await axios.get(
          `${API_URL}/api/houses/${props.houseId}/containers?parent_id=${parentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        siblingsData = response.data.containers;
      }

      const childrenResponse = await axios.get(
        `${API_URL}/api/houses/${props.houseId}/containers?parent_id=${container.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentPath([...currentPath, container.id]);
      setPathNames([...pathNames, container.name]);
      setSiblings(siblingsData);
      setChildren(childrenResponse.data.containers);
      setSelectedItem(container);
      setDetailInfo(container); // null 대신 container 데이터를 즉시 표시
      setLoading(false);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다');
      setLoading(false);
      console.error(err);
    }
  };

  // 단일 클릭 - 최적화: 목록 데이터를 즉시 표시
  const handleItemClick = async (container) => {
    setSelectedItem(container);
    // 이미 목록에서 가져온 데이터를 즉시 표시
    setDetailInfo(container);
    setChildPreview([]); // 초기화
    
    // 상세 정보 및 하위 항목 미리보기 로드
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/houses/${props.houseId}/containers/${container.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDetailInfo(response.data.container);
      setChildPreview(response.data.child_preview || []);
    } catch (err) {
      console.error('상세 정보 조회 실패:', err);
    }
  };

  // 형제 클릭 (왼쪽 패널) - 상세정보만 표시 (최적화)
  const handleSiblingClick = async (container) => {
    setSelectedItem(container);
    // 이미 목록에서 가져온 데이터를 즉시 표시
    setDetailInfo(container);
    setChildPreview([]); // 초기화
    
    // 상세 정보 및 하위 항목 미리보기 로드
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/houses/${props.houseId}/containers/${container.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDetailInfo(response.data.container);
      setChildPreview(response.data.child_preview || []);
    } catch (err) {
      console.error('상세 정보 조회 실패:', err);
    }
    
    // pathNames의 마지막 항목을 현재 선택한 항목으로 업데이트
    if (pathNames.length > 0) {
      const newPathNames = [...pathNames];
      newPathNames[newPathNames.length - 1] = container.name;
      setPathNames(newPathNames);
    }
  };

  // 형제 더블클릭 (왼쪽 패널) - 드릴다운
  const handleSiblingDoubleClick = async (container) => {
    // 물품이면 더블클릭해도 아무 동작 안 함
    if (container.type_cd === 'COM1200003') {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${API_URL}/api/houses/${props.houseId}/containers?parent_id=${container.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newPath = [...currentPath];
      const newPathNames = [...pathNames];
      newPath[newPath.length - 1] = container.id;
      newPathNames[newPathNames.length - 1] = container.name;

      setCurrentPath(newPath);
      setPathNames(newPathNames);
      setChildren(response.data.containers);
      setSelectedItem(container);
      setDetailInfo(container); // 이미 있는 데이터 즉시 표시
      
      setLoading(false);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다');
      setLoading(false);
      console.error(err);
    }
  };

  // 브레드크럼 클릭
  const handleBreadcrumbClick = async (index) => {
    if (index === -1) {
      loadRootLevel();
    } else {
      const targetId = currentPath[index];
      const newPath = currentPath.slice(0, index + 1);
      const newPathNames = pathNames.slice(0, index + 1);

      setLoading(true);
      try {
        const token = localStorage.getItem('token');

        let siblingsData = [];
        if (index === 0) {
          const response = await axios.get(
            `${API_URL}/api/houses/${props.houseId}/containers?level=root`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          siblingsData = response.data.containers;
        } else {
          const parentId = currentPath[index - 1];
          const response = await axios.get(
            `${API_URL}/api/houses/${props.houseId}/containers?parent_id=${parentId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          siblingsData = response.data.containers;
        }

        const childrenResponse = await axios.get(
          `${API_URL}/api/houses/${props.houseId}/containers?parent_id=${targetId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCurrentPath(newPath);
        setPathNames(newPathNames);
        setSiblings(siblingsData);
        setChildren(childrenResponse.data.containers);
        setSelectedItem(null);
        setDetailInfo(null);
        setLoading(false);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다');
        setLoading(false);
        console.error(err);
      }
    }
  };

  const handleAddClick = (parentId) => {
    setAddParentId(parentId);
    setShowAddModal(true);
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    if (currentPath.length === 0) {
      loadRootLevel();
    } else {
      handleBreadcrumbClick(currentPath.length - 1);
    }
  };

  const handleEditClick = (container) => {
    setSelectedItem(container);
    setShowEditModal(true);
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    
    // 수정된 컨테이너의 ID 저장
    const editedContainerId = selectedItem?.id;
    
    // 화면 새로고침
    if (currentPath.length === 0) {
      await loadRootLevel();
    } else {
      await handleBreadcrumbClick(currentPath.length - 1);
    }
    
    // 수정된 컨테이너를 다시 선택하고 상세정보 로드
    if (editedContainerId) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_URL}/api/houses/${props.houseId}/containers/${editedContainerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const updatedContainer = response.data.container;
        setSelectedItem(updatedContainer);
        setDetailInfo(updatedContainer);
        
        // 하위 항목 미리보기 로드
        if (updatedContainer.type_cd !== 'COM1200003') {
          const childResponse = await axios.get(
            `${API_URL}/api/houses/${props.houseId}/containers?parent_id=${updatedContainer.id}&limit=5`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setChildPreview(childResponse.data.containers || []);
        } else {
          setChildPreview([]);
        }
      } catch (err) {
        console.error('수정된 항목 재선택 실패:', err);
      }
    }
  };

  const handleDelete = async (container) => {
    if (!window.confirm(`"${container.name}"을(를) 정말 삭제하시겠습니까?\n\n하위 항목도 모두 삭제됩니다.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/api/houses/${props.houseId}/containers/${container.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (currentPath.length === 0) {
        loadRootLevel();
      } else {
        handleBreadcrumbClick(currentPath.length - 1);
      }
    } catch (err) {
      alert('삭제에 실패했습니다: ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  const handleAddToTemp = (container) => {
    const itemWithPath = {
      ...container,
      path: pathNames.length > 0 ? pathNames.join(' > ') : props.houseName
    };
    setTempStorage([...tempStorage, itemWithPath]);
    // alert 제거
  };

  const handleRemoveFromTemp = (index) => {
    const newTemp = [...tempStorage];
    newTemp.splice(index, 1);
    setTempStorage(newTemp);
  };

  const handleMoveToHere = async () => {
    if (tempStorage.length === 0) {
      alert('임시보관함이 비어있습니다');
      return;
    }

    // 현재 보고 있는 위치의 ID를 가져옴 (여기로 이동할 부모 ID)
    // 집인 경우 null (최상위로 이동)
    let targetParentId;
    if (selectedItem?.type_cd === 'house') {
      targetParentId = null; // 집 = 최상위
    } else {
      targetParentId = selectedItem?.id || (currentPath.length > 0 ? currentPath[currentPath.length - 1] : null);
    }
    
    const currentLocation = selectedItem?.name || (currentPath.length > 0 ? pathNames[pathNames.length - 1] : props.houseName);

    console.log('이동 대상:', {
      targetParentId,
      currentLocation,
      selectedItem,
      currentPath,
      pathNames
    });

    try {
      const token = localStorage.getItem('token');
      const failedItems = [];

      for (const item of tempStorage) {
        try {
          await axios.patch(
            `${API_URL}/api/houses/${props.houseId}/containers/${item.id}`,
            { up_container_id: targetParentId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          console.error(`"${item.name}" 이동 실패:`, err);
          failedItems.push(item);
        }
      }

      // 실패한 항목만 임시보관함에 남김
      setTempStorage(failedItems);

      // 화면 새로고침
      if (currentPath.length === 0) {
        loadRootLevel();
      } else {
        handleBreadcrumbClick(currentPath.length - 1);
      }
    } catch (err) {
      alert('이동에 실패했습니다: ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  // 개별 항목을 여기로 이동
  const handleMoveSingleToHere = async (index) => {
    const item = tempStorage[index];
    
    // 현재 보고 있는 위치의 ID를 가져옴 (여기로 이동할 부모 ID)
    let targetParentId;
    if (selectedItem?.type_cd === 'house') {
      targetParentId = null; // 집 = 최상위
    } else {
      targetParentId = selectedItem?.id || (currentPath.length > 0 ? currentPath[currentPath.length - 1] : null);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/api/houses/${props.houseId}/containers/${item.id}`,
        { up_container_id: targetParentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 임시보관함에서 제거
      const newTemp = [...tempStorage];
      newTemp.splice(index, 1);
      setTempStorage(newTemp);

      // 화면 새로고침
      if (currentPath.length === 0) {
        loadRootLevel();
      } else {
        handleBreadcrumbClick(currentPath.length - 1);
      }
    } catch (err) {
      alert('이동에 실패했습니다: ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };
  // 새로고침
  const handleRefresh = () => {
    if (currentPath.length === 0) {
      loadRootLevel();
    } else {
      handleBreadcrumbClick(currentPath.length - 1);
    }
  };

    const handleSearchSelect = async (result) => {
    setShowSearchModal(false);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${API_URL}/api/houses/${props.houseId}/containers/${result.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const container = response.data.container;
      
      let parentPath = [];
      let parentPathNames = [];
      let currentParentId = container.up_container_id;
      
      while (currentParentId) {
        const parentResponse = await axios.get(
          `${API_URL}/api/houses/${props.houseId}/containers/${currentParentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const parent = parentResponse.data.container;
        parentPath.unshift(parent.id);
        parentPathNames.unshift(parent.name);
        currentParentId = parent.up_container_id;
      }
      
      if (container.type_cd === 'COM1200003') {
        let siblingsData = [];
        if (parentPath.length === 1) {
          const siblingsResponse = await axios.get(
            `${API_URL}/api/houses/${props.houseId}/containers?level=root`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          siblingsData = siblingsResponse.data.containers;
        } else if (parentPath.length > 1) {
          const grandParentId = parentPath[parentPath.length - 2];
          const siblingsResponse = await axios.get(
            `${API_URL}/api/houses/${props.houseId}/containers?parent_id=${grandParentId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          siblingsData = siblingsResponse.data.containers;
        }
        
        const childrenResponse = await axios.get(
          `${API_URL}/api/houses/${props.houseId}/containers?parent_id=${container.up_container_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setCurrentPath(parentPath);
        setPathNames(parentPathNames);
        setSiblings(siblingsData);
        setChildren(childrenResponse.data.containers);
        setSelectedItem(container);
        setDetailInfo(container);
      } else {
        if (parentPath.length === 0) {
          loadRootLevel();
        } else {
          await handleBreadcrumbClick(parentPath.length - 1);
        }
        
        setSelectedItem(container);
        setDetailInfo(container);
      }
    } catch (err) {
      console.error('이동 실패:', err);
      alert('위치로 이동하는데 실패했습니다');
    }
  };

  return (
    <div className="house-detail-view">
      {/* 헤더 */}
      <div className="header">
        <div className="header-left">
          <button className="back-button" onClick={props.onBack}>
            ← 목록
          </button>
          
          {/* 상위로 이동 버튼 (최상위가 아닐 때만 표시) */}
          {currentPath.length > 0 && (
            <button 
              className="back-button" 
              onClick={() => {
                if (currentPath.length === 1) {
                  loadRootLevel();
                } else {
                  handleBreadcrumbClick(currentPath.length - 2);
                }
              }}
            >
              ← 상위
            </button>
          )}
          
          <div className="breadcrumb">
            <span 
              className="breadcrumb-item"
              onClick={() => handleBreadcrumbClick(-1)}
            >
              {props.houseName}
            </span>
            {pathNames.map((name, index) => (
              <React.Fragment key={index}>
                <span className="breadcrumb-separator">›</span>
                <span 
                  className={index === pathNames.length - 1 ? 'breadcrumb-current' : 'breadcrumb-item'}
                  onClick={() => handleBreadcrumbClick(index)}
                >
                  {name}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="header-right">
          <div className="search-box" onClick={() => setShowSearchModal(true)}>
            <span>🔍</span>
          </div>
          <div className="search-box" onClick={handleRefresh} title="새로고침">
            <span>🔄</span>
          </div>
          {tempStorage.length > 0 && (
            <div 
              className="temp-badge" 
              onClick={() => setShowTempStorageModal(true)}
            >
              📦 임시보관함 ({tempStorage.length})
            </div>
          )}
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="panel-container">
        {/* 왼쪽 패널 */}
        <div className="panel left-panel">
          <div className="panel-header">
            <span>
              {currentPath.length === 0 
                ? props.houseName
                : currentPath.length === 1
                  ? props.houseName
                  : `${props.houseName} › ${pathNames.slice(0, -1).join(' › ')}`
              }
            </span>
          </div>
          <div className="panel-content">
            {loading ? (
              <div className="loading-box">로딩 중...</div>
            ) : currentPath.length === 0 ? (
              <div 
                className="item-card active"
                onClick={() => {
                  // 집 정보 표시
                  const houseInfo = {
                    id: props.houseId,
                    name: props.houseName,
                    type_cd: 'house',
                    type_nm: '집',
                    child_count: children.length
                  };
                  setSelectedItem(houseInfo);
                  setDetailInfo(houseInfo);
                  setChildPreview([]); // 집은 미리보기 없음
                }}
              >
                <div className="item-icon">🏠</div>
                <div className="item-info">
                  <div className="item-name">{props.houseName}</div>
                  <div className="item-meta">
                    <span>집</span>
                    <span>{children.length}개 항목</span>
                  </div>
                </div>
              </div>
            ) : (() => {
              const filteredSiblings = siblings.filter(sibling => !tempStorage.some(temp => temp.id === sibling.id));
              
              if (filteredSiblings.length === 0) {
                return (
                  <div className="empty-panel">
                    <p>비어있습니다</p>
                  </div>
                );
              }
              
              return (
                <>
                  {filteredSiblings.map((sibling, index) => (
                    <ContainerCard
                      key={sibling.id}
                      container={sibling}
                      isActive={selectedItem?.id === sibling.id}
                      onClick={() => handleSiblingClick(sibling)}
                      onDoubleClick={() => handleSiblingDoubleClick(sibling)}
                      onEdit={() => handleEditClick(sibling)}
                      onDelete={() => handleDelete(sibling)}
                      onAddToTemp={() => handleAddToTemp(sibling)}
                      animationDelay={`${index * 0.05}s`}
                    />
                  ))}
                </>
              );
            })()}
          </div>
        </div>

        {/* 중앙 패널 */}
        <div className="panel center-panel">
          <div className="panel-header">
            <span>
              {currentPath.length === 0
                ? `› ${props.houseName}`
                : `› ${pathNames[pathNames.length - 1]}`
              }
            </span>
            <button 
              className="add-button"
              onClick={() => handleAddClick(currentPath[currentPath.length - 1] || null)}
            >
              + 추가
            </button>
          </div>
          <div className="panel-content">
            {loading ? (
              <div className="loading-box">로딩 중...</div>
            ) : (() => {
              const filteredChildren = children.filter(child => !tempStorage.some(temp => temp.id === child.id));
              
              if (filteredChildren.length === 0) {
                return (
                  <div className="empty-panel">
                    <p>비어있습니다</p>
                  </div>
                );
              }
              return (
                <>
                  {filteredChildren.map((child, index) => (
                    <ContainerCard
                      key={child.id}
                      container={child}
                      isActive={selectedItem?.id === child.id}
                      onClick={() => handleItemClick(child)}
                      onDoubleClick={() => handleDrillDown(child)}
                      onEdit={() => handleEditClick(child)}
                      onDelete={() => handleDelete(child)}
                      onAddToTemp={() => handleAddToTemp(child)}
                      animationDelay={`${index * 0.05}s`}
                    />
                  ))}
                  <div 
                    className="add-item-footer"
                    onClick={() => handleAddClick(currentPath[currentPath.length - 1] || null)}
                  >
                    + 항목 추가
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* 오른쪽 패널 */}
        <div className="panel right-panel">
          <div className="panel-header">
            <span>상세 정보</span>
          </div>
          <div className="panel-content">
            {detailInfo ? (
              <ContainerDetail
                houseId={props.houseId}
                houseName={props.houseName}
                pathNames={pathNames}
                container={detailInfo}
                childPreview={childPreview}
                tempStorage={tempStorage}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onMoveToHere={handleMoveToHere}
                onRemoveFromTemp={handleRemoveFromTemp}
                onMoveSingleToHere={handleMoveSingleToHere}
              />
            ) : (
              <div className="empty-panel">
                <p>항목을 선택하면 상세 정보가 표시됩니다</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 모달들 */}
      {showAddModal && (
        <AddContainerModal
          houseId={props.houseId}
          parentId={addParentId}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {showEditModal && selectedItem && (
        <EditContainerModal
          houseId={props.houseId}
          container={selectedItem}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {showSearchModal && (
        <SearchModal
          houseId={props.houseId}
          houseName={props.houseName}
          onClose={() => setShowSearchModal(false)}
          onSelect={handleSearchSelect}
        />
      )}

      {showTempStorageModal && (
        <TempStorageModal
          tempStorage={tempStorage}
          onClose={() => setShowTempStorageModal(false)}
          onRemove={handleRemoveFromTemp}
        />
      )}
    </div>
  );
}

export default HouseDetailView;