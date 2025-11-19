/************************************************************
 * FILE: logFormatUtils.js
 * DESCRIPTION: 로그 한 줄 포맷팅 유틸리티
 *              활동 로그를 한 줄로 표시하기 위한 포맷팅 함수
 *              다양한 형태의 메시지 제공 (icon, creator, action, detail 등)
 *
 * EXPORTS:
 * - formatLogOneLine: 로그를 한 줄 형식으로 포맷팅
 ************************************************************/

import addIcon from '../assets/icons/add.svg';
import editIcon from '../assets/icons/edit.svg';
import arrowGreenIcon from '../assets/icons/arrow_green.svg';
import deleteIcon from '../assets/icons/delete.svg';
import areaIcon from '../assets/icons/area.svg';
import boxIcon from '../assets/icons/box.svg';
import tagIcon from '../assets/icons/tag.svg';

/************************************************************
 * DESCRIPTION: 로그 메시지 한 줄 포맷팅 함수
 *              활동 로그를 한 줄 형태로 표시하기 위한 다양한 정보 제공
 *              액션 아이콘, 타입 아이콘, 작성자, 메시지 등을 포함
 *
 * PARAMS:
 * - log: 로그 데이터 객체
 *   - container_name: 컨테이너 이름
 *   - creator_name: 작성자 이름
 *   - container_type_cd: 컨테이너 타입 코드
 *   - act_cd: 액션 코드
 *   - from_house_id/to_house_id: 출발지/목적지 집 ID
 *   - from_house_name/to_house_name: 출발지/목적지 집 이름
 *   - from_container_name/to_container_name: 출발지/목적지 컨테이너 이름
 *   - log_remk: 로그 비고
 *   - act_nm: 액션 이름
 * - currentHouseName: 현재 집 이름
 *
 * RETURNS:
 * - 포맷팅된 로그 정보 객체:
 *   - icon: 액션 아이콘 (SVG)
 *   - creator: 작성자 이름
 *   - action: 액션 이름 (예: "생성", "이동")
 *   - containerName: 컨테이너 이름
 *   - typeIcon: 컨테이너 타입 아이콘
 *   - detail: 상세 정보 문자열
 *   - content: 콘텐츠 문자열
 *   - message: 전체 메시지 (작성자 + 내용)
 ************************************************************/
export const formatLogOneLine = (log, currentHouseName) => {
  /* 1. 기본 정보 추출 */
  const containerName = log.container_name || '알 수 없음';
  const creatorName = log.creator_name || '알 수 없음';

  /* 2. 컨테이너 타입 아이콘 가져오기 */
  const getTypeIcon = (typeCd) => {
    switch(typeCd) {
      case 'COM1200001': return areaIcon; // 영역
      case 'COM1200002': return boxIcon; // 박스
      case 'COM1200003': return tagIcon; // 물품
      default: return null;
    }
  };

  const typeIcon = getTypeIcon(log.container_type_cd);

  /* 3. 액션 코드에 따른 포맷팅 */
  switch(log.act_cd) {
    case 'COM1300001': // 생성
      return {
        icon: addIcon,
        creator: creatorName,
        action: '생성',
        containerName: containerName,
        typeIcon: typeIcon,
        detail: '생성',
        content: `${containerName} 생성`,
        message: `${creatorName}님 ${containerName} 생성`
      };

    case 'COM1300002': // 반출 (삭제)
      return {
        icon: '📤',
        creator: creatorName,
        action: '반출',
        containerName: containerName,
        typeIcon: typeIcon,
        detail: '반출',
        content: `${containerName} 반출`,
        message: `${creatorName}님 ${containerName} 반출`
      };

    case 'COM1300003': // 이동
      /* 집 간 이동인지 확인 */
      const isCrossHouseMove = log.from_house_id && log.to_house_id &&
                                log.from_house_id !== log.to_house_id;

      if (isCrossHouseMove) {
        /* 다른 집으로 이동 - 집 이름 포함하여 표시 */
        const fromLocation = log.from_container_name
          ? `[${log.from_house_name}] ${log.from_container_name}`
          : `[${log.from_house_name}]`;
        const toLocation = log.to_container_name
          ? `[${log.to_house_name}] ${log.to_container_name}`
          : `[${log.to_house_name}]`;

        return {
          icon: arrowGreenIcon,
          creator: creatorName,
          action: '이동',
          containerName: containerName,
          typeIcon: typeIcon,
          detail: `이동: ${fromLocation} → ${toLocation}`,
          content: `${containerName} 이동 ${fromLocation} → ${toLocation}`,
          message: `${creatorName}님 ${containerName} 이동 ${fromLocation} → ${toLocation}`
        };
      }

      /* 같은 집 내 이동 - 컨테이너 이름만 표시 */
      const fromLoc = log.from_container_name || currentHouseName;
      const toLoc = log.to_container_name || currentHouseName;

      return {
        icon: arrowGreenIcon,
        creator: creatorName,
        action: '이동',
        containerName: containerName,
        typeIcon: typeIcon,
        detail: `이동: ${fromLoc} → ${toLoc}`,
        content: `${containerName} 이동 ${fromLoc} → ${toLoc}`,
        message: `${creatorName}님 ${containerName} 이동 ${fromLoc} → ${toLoc}`
      };

    case 'COM1300004': // 수정
      /* 변경 사항을 한 줄로 정리 (줄바꿈을 쉼표로 변환) */
      const changes = log.log_remk
        ? log.log_remk.split('\n').map(part => part.trim()).filter(part => part).join(', ')
        : '';
      return {
        icon: editIcon,
        creator: creatorName,
        action: '수정',
        containerName: containerName,
        typeIcon: typeIcon,
        detail: changes ? `변경: ${changes}` : '수정',
        content: `${containerName} 수정 ${log.log_remk || ''}`,
        message: `${creatorName}님 ${containerName} 수정 ${log.log_remk || ''}`
      };

    case 'COM1300007': // 삭제
      return {
        icon: deleteIcon,
        creator: creatorName,
        action: '삭제',
        containerName: containerName,
        typeIcon: typeIcon,
        detail: '삭제',
        content: `${containerName} 삭제`,
        message: `${creatorName}님 ${containerName} 삭제`
      };

    default: // 알 수 없는 액션 타입
      return {
        icon: '📋',
        creator: creatorName,
        action: log.act_nm || '알 수 없음',
        containerName: containerName,
        typeIcon: typeIcon,
        detail: log.act_nm || '알 수 없음',
        content: `${containerName} ${log.act_nm || '알 수 없음'}`,
        message: `${creatorName}님 ${containerName} ${log.act_nm || '알 수 없음'}`
      };
  }
};
