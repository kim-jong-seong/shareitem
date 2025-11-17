import addIcon from '../assets/icons/add.svg';
import editIcon from '../assets/icons/edit.svg';
import arrowGreenIcon from '../assets/icons/arrow_green.svg';
import deleteIcon from '../assets/icons/delete.svg';
import areaIcon from '../assets/icons/area.svg';
import boxIcon from '../assets/icons/box.svg';
import tagIcon from '../assets/icons/tag.svg';

// 로그 메시지 한 줄 포맷팅
export const formatLogOneLine = (log, currentHouseName) => {
  const containerName = log.container_name || '알 수 없음';
  const creatorName = log.creator_name || '알 수 없음';

  // 컨테이너 타입 아이콘
  const getTypeIcon = (typeCd) => {
    switch(typeCd) {
      case 'COM1200001': return areaIcon;
      case 'COM1200002': return boxIcon;
      case 'COM1200003': return tagIcon;
      default: return null;
    }
  };

  const typeIcon = getTypeIcon(log.container_type_cd);

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

    case 'COM1300002': // 반출
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
      const isCrossHouseMove = log.from_house_id && log.to_house_id &&
                                log.from_house_id !== log.to_house_id;

      if (isCrossHouseMove) {
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

    default:
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
