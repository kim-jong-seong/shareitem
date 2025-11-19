/************************************************************
 * FILE: logUtils.js
 * DESCRIPTION: 로그 메시지 포맷팅 유틸리티
 *              활동 로그를 사용자에게 표시하기 위한 포맷팅 함수
 *              액션 타입에 따라 아이콘과 메시지를 다르게 표시
 *
 * EXPORTS:
 * - formatLogMessage: 로그 메시지를 포맷팅 (아이콘 + 액션 + 상세 정보)
 * - formatDate: 날짜를 표시용 문자열로 포맷팅
 ************************************************************/

import addIcon from '../assets/icons/add.svg';
import editIcon from '../assets/icons/edit.svg';
import arrowGreenIcon from '../assets/icons/arrow_green.svg';

/************************************************************
 * DESCRIPTION: 로그 메시지 포맷팅 함수
 *              활동 로그 데이터를 UI에 표시하기 적합한 형태로 변환
 *              액션 타입에 따라 아이콘과 메시지를 다르게 구성
 *
 * PARAMS:
 * - log: 로그 데이터 객체
 *   - act_cd: 액션 코드 (COM1300001: 생성, COM1300002: 반출, COM1300003: 이동, COM1300004: 수정)
 *   - log_remk: 로그 비고 (상세 설명)
 *   - from_house_id/to_house_id: 출발지/목적지 집 ID (이동 시)
 *   - from_house_name/to_house_name: 출발지/목적지 집 이름
 *   - from_container_name/to_container_name: 출발지/목적지 컨테이너 이름
 *   - act_nm: 액션 이름 (알 수 없는 타입일 때 사용)
 * - currentHouseName: 현재 집 이름 (같은 집 내 이동 시 기본값 사용)
 *
 * RETURNS:
 * - { icon, action, detail } 객체
 *   - icon: 표시할 아이콘 (SVG 경로 또는 이모지)
 *   - action: 액션 이름 (예: "생성", "이동", "수정")
 *   - detail: 상세 정보 문자열
 *
 * EXAMPLE:
 * formatLogMessage({ act_cd: 'COM1300001', log_remk: '새 상자' })
 * // => { icon: addIcon, action: '생성', detail: '새 상자' }
 ************************************************************/
export const formatLogMessage = (log, currentHouseName = '') => {
  switch(log.act_cd) {
    case 'COM1300001': // 생성
      return {
        icon: addIcon,
        action: '생성',
        detail: log.log_remk || ''
      };

    case 'COM1300002': // 반출 (삭제)
      return {
        icon: '📤',
        action: '반출',
        detail: log.log_remk || '삭제됨'
      };

    case 'COM1300003': // 이동
      /* 집 간 이동인지 확인 (from_house_id와 to_house_id가 다를 때) */
      const isCrossHouseMove = log.from_house_id && log.to_house_id &&
                                log.from_house_id !== log.to_house_id;

      if (isCrossHouseMove) {
        /* 다른 집으로 이동 - 집 이름 표시 */
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

      /* 같은 집 내 이동 - 집 이름 표시 안 함 */
      return {
        icon: arrowGreenIcon,
        action: '이동',
        detail: `${log.from_container_name || currentHouseName} → ${log.to_container_name || currentHouseName}`
      };

    case 'COM1300004': // 수정
      return {
        icon: editIcon,
        action: '수정',
        detail: log.log_remk || '정보 수정'
      };

    default: // 알 수 없는 액션 타입
      return {
        icon: '📋',
        action: log.act_nm || '알 수 없음',
        detail: log.log_remk || ''
      };
  }
};

/************************************************************
 * DESCRIPTION: 날짜 포맷팅 함수
 *              서버에서 받은 날짜 문자열을 표시용 형식으로 변환
 *              "YYYY-MM-DD HH:mm:ss" → "YYYY.MM.DD HH:mm"
 *
 * PARAMS:
 * - dateString: 날짜 문자열 (예: "2025-11-06 23:15:26")
 *               백엔드에서 시간대 정보 없이 전송됨
 *               로컬 시간으로 해석됨
 *
 * RETURNS:
 * - 포맷된 날짜 문자열 (예: "2025.11.06 23:15")
 *
 * EXAMPLE:
 * formatDate('2025-11-06 23:15:26') // "2025.11.06 23:15"
 ************************************************************/
export const formatDate = (dateString) => {
  /* 1. Date 객체로 변환 (로컬 시간으로 해석) */
  const date = new Date(dateString);

  /* 2. 각 요소 추출 및 포맷팅 */
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  /* 3. 포맷팅된 문자열 반환 */
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};
