import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import CreateHouseModal from '../common/modals/CreateHouseModal';
import MemberManagementModal from '../common/modals/MemberManagementModal';
import { houseIcon } from '../../utils/iconUtils';
import usersIcon from '../../assets/icons/users.svg';

/************************************************************
 * DESCRIPTION: HouseManagement 컴포넌트
 *              사용자가 속한 집 목록을 조회하고 관리하는
 *              메인 컴포넌트로 집 생성, 삭제, 나가기,
 *              구성원 관리 기능을 제공함
 *
 * PROPS:
 * - onViewHouse: 집 조회 시 호출되는 함수
 *                (HouseDetailView로 이동)
 * - triggerCreate: 외부에서 집 만들기를 트리거하는 값
 ************************************************************/
function HouseManagement(props) {

    /************************************************************
     * DESCRIPTION: State 선언부
     ************************************************************/
    const [houses, setHouses] = useState([]); // 집 목록
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(''); // 에러 메시지
    const [showCreateModal, setShowCreateModal] = useState(false); // 집 생성 모달 표시 여부
    const [showMemberModal, setShowMemberModal] = useState(false); // 구성원 관리 모달 표시 여부
    const [selectedHouse, setSelectedHouse] = useState(null); // 선택된 집 정보

    /************************************************************
     * DESCRIPTION: 컴포넌트 마운트 시 집 목록 조회
     ************************************************************/
    useEffect(() => {
        fetchHouses();
    }, []);

    /************************************************************
     * DESCRIPTION: 외부에서 집 만들기 트리거 감지
     *              헤더의 "새 집" 버튼 클릭 시 모달 열기
     ************************************************************/
    const prevTriggerRef = React.useRef();
    useEffect(() => {
        /* 첫 렌더링이 아니고, triggerCreate 값이 변경되었을 때만 모달 열기 */
        if (prevTriggerRef.current !== undefined && prevTriggerRef.current !== props.triggerCreate) {
            setShowCreateModal(true);
        }
        prevTriggerRef.current = props.triggerCreate;
    }, [props.triggerCreate]);

    /************************************************************
     * DESCRIPTION: 집 목록 조회 함수
     *              서버에서 사용자가 속한 집 목록을 가져옴
     ************************************************************/
    const fetchHouses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/houses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHouses(response.data.houses);
            setLoading(false);
        } catch (err) {
            setError('집 목록을 불러오는데 실패했습니다');
            setLoading(false);
            console.error(err);
        }
    };

    /************************************************************
     * DESCRIPTION: 집 삭제 처리 함수 (관리자 전용)
     *              관리자가 집을 삭제하면 관련된
     *              모든 데이터가 함께 삭제됨
     ************************************************************/
    const handleDeleteHouse = async (houseId, houseName) => {
        /* 1. 사용자 확인 */
        if (!window.confirm(`"${houseName}"을(를) 정말 삭제하시겠습니까?\n\n관련된 모든 데이터가 삭제됩니다.`)) {
            return;
        }

        try {
            /* 2. 서버에 삭제 요청 */
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/houses/${houseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            /* 3. 성공 알림 및 목록 새로고침 */
            alert('집이 삭제되었습니다');
            fetchHouses();
        } catch (err) {
            alert('집 삭제에 실패했습니다: ' + (err.response?.data?.error || err.message));
            console.error(err);
        }
    };

    /************************************************************
     * DESCRIPTION: 집 나가기 처리 함수 (멤버 전용)
     *              멤버가 집에서 탈퇴함
     ************************************************************/
    const handleLeaveHouse = async (houseId, houseName) => {
        /* 1. 사용자 확인 */
        if (!window.confirm(`"${houseName}"에서 정말 나가시겠습니까?`)) {
            return;
        }

        try {
            /* 2. 서버에 나가기 요청 */
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/houses/${houseId}/leave`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            /* 3. 성공 알림 및 목록 새로고침 */
            alert('집에서 나갔습니다');
            fetchHouses();
        } catch (err) {
            alert('나가기에 실패했습니다: ' + (err.response?.data?.error || err.message));
            console.error(err);
        }
    };

    /************************************************************
     * DESCRIPTION: 집 조회 함수
     *              선택한 집의 상세 화면으로 이동
     ************************************************************/
    const handleViewHouse = (house) => {
        props.onViewHouse(house); // 부모 컴포넌트에 전달
    };

    /************************************************************
     * DESCRIPTION: 구성원 관리 모달 열기
     *              집의 멤버 목록 조회 및 관리
     ************************************************************/
    const handleManageMembers = (house) => {
        setSelectedHouse(house);
        setShowMemberModal(true);
    };

    /* 로딩 중일 때 */
    if (loading) {
        return <div className="loading-box">데이터를 불러오는 중...</div>;
    }

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 집 목록 UI
     ************************************************************/
    return (
        <>
            {/* 헤더 영역 */}
            <div className="dashboard-header">
                <div className="header-left">
                    <h2>집 목록</h2>
                    <p>내가 속한 집 목록을 관리합니다</p>
                </div>
                <div className="header-buttons">
                    <button className="create-button" onClick={() => setShowCreateModal(true)}>
                        + 새 집 등록
                    </button>
                </div>
            </div>

            {/* 에러 메시지 표시 */}
            {error && (
                <div className="error-box">
                    {error}
                </div>
            )}

            {/* 집 목록 또는 빈 상태 */}
            {houses.length === 0 ? (
                <div className="empty-state">
                    <p>등록된 집이 없습니다. 새 집을 등록해주세요.</p>
                </div>
            ) : (
                <div className="houses-grid">
                    {houses.map((house) => (
                        <div key={house.id} className="house-card">
                            {/* 카드 헤더: 집 이름 + 역할 배지 */}
                            <div className="house-card-header">
                                <div className="house-title">
                                    <img src={houseIcon} alt="house" style={{ width: '24px', height: '24px' }} />
                                    <h3>{house.name}</h3>
                                </div>
                                <span className={house.role_cd === 'COM1100001' ? 'role-badge admin' : 'role-badge member'}>
                                    {house.role_nm}
                                </span>
                            </div>

                            {/* 카드 정보: 관리자, 구성원 수 */}
                            <div className="house-card-info">
                                <div className="info-row">
                                    <span className="info-label">관리자</span>
                                    <span className="info-value">{house.admin_name || '-'}</span>
                                </div>
                                <div
                                    className="info-row clickable"
                                    onClick={() => handleManageMembers(house)}
                                    title="클릭하여 구성원 관리"
                                >
                                    <span className="info-label">구성원</span>
                                    <span className="info-value members">
                                        <img src={usersIcon} alt="구성원" style={{ width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
                                        {house.member_count || 0}명
                                    </span>
                                </div>
                            </div>

                            {/* 카드 액션 버튼: 조회, 삭제/나가기 */}
                            <div className="house-card-actions">
                                <button
                                    className="card-view-btn"
                                    onClick={() => handleViewHouse(house)}
                                >
                                    조회
                                </button>
                                <button
                                    className="card-delete-btn"
                                    onClick={() =>
                                        house.role_cd === 'COM1100001'
                                            ? handleDeleteHouse(house.id, house.name) // 관리자: 삭제
                                            : handleLeaveHouse(house.id, house.name) // 멤버: 나가기
                                    }
                                >
                                    {house.role_cd === 'COM1100001' ? '삭제' : '나가기'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 집 생성 모달 */}
            {showCreateModal && (
                <CreateHouseModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={fetchHouses} // 생성 성공 시 목록 새로고침
                />
            )}

            {/* 구성원 관리 모달 */}
            {showMemberModal && selectedHouse && (
                <MemberManagementModal
                    houseId={selectedHouse.id}
                    houseName={selectedHouse.name}
                    onClose={() => {
                        setShowMemberModal(false);
                        setSelectedHouse(null);
                    }}
                    onSuccess={fetchHouses} // 변경 사항 발생 시 목록 새로고침
                />
            )}
        </>
    );
}

export default HouseManagement;
