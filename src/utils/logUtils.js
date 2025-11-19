import addIcon from '../assets/icons/add.svg';
import editIcon from '../assets/icons/edit.svg';
import arrowGreenIcon from '../assets/icons/arrow_green.svg';

/**
 * 로그 메시지를 포맷팅하는 함수
 * @param {Object} log - 로그 데이터
 * @param {string} currentHouseName - 현재 집 이름 (같은 집 내 이동 시 사용)
 * @returns {Object} { icon, action, detail }
 */
export const formatLogMessage = (log, currentHouseName = '') => {
  switch(log.act_cd) {
    case 'COM1300001': // 생성
      return {
        icon: addIcon,
        action: '생성',
        detail: log.log_remk || ''
      };

    case 'COM1300002': // 반출
      return {
        icon: '📤',
        action: '반출',
        detail: log.log_remk || '삭제됨'
      };

    case 'COM1300003': // 이동
      // 집 간 이동인지 확인 (from_house_id와 to_house_id가 다를 때만)
      const isCrossHouseMove = log.from_house_id && log.to_house_id &&
                                log.from_house_id !== log.to_house_id;

      if (isCrossHouseMove) {
        // 다른 집으로 이동 - 집 이름 표시
        const fromLocation = log.from_container_name
          ? `[${log.from_house_name}] ${log.from_container_name}`
          : `[${log.from_house_name}]`;
        const toLocation = log.to_container_name
          ? `[${log.to_house_name}] ${log.to_container_name}`
          : `[${log.to_house_name}]`;

        return {
          icon: arrowGreenIcon,
          action: '이동',
          detail: `${fromLocation} → ${toLocation}`
        };
      }

      // 같은 집 내 이동 - 집 이름 표시 안 함
      return {
        icon: arrowGreenIcon,
        action: '이동',
        detail: `${log.from_container_name || currentHouseName} → ${log.to_container_name || currentHouseName}`
      };

    case 'COM1300004': // 수정 (통합)
      return {
        icon: editIcon,
        action: '수정',
        detail: log.log_remk || '정보 수정'
      };

    default:
      return {
        icon: '📋',
        action: log.act_nm || '알 수 없음',
        detail: log.log_remk || ''
      };
  }
};

/**
 * 날짜 문자열을 포맷팅하는 함수
 * @param {string} dateString - "2025-11-06 23:15:26" 형식의 날짜 문자열
 * @returns {string} "2025.11.06 23:15" 형식의 포맷된 문자열
 */
export const formatDate = (dateString) => {
  // 백엔드에서 "2025-11-06 23:15:26" 형식의 문자열로 받음 (시간대 정보 없음)
  // 그대로 Date 객체로 변환하면 로컬 시간으로 인식됨
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}`;
};
