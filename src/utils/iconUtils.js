import houseIcon from '../assets/icons/house.svg';
import areaIcon from '../assets/icons/area.svg';
import boxIcon from '../assets/icons/box.svg';
import tagIcon from '../assets/icons/tag.svg';

/**
 * 컨테이너 타입에 따라 적절한 아이콘을 반환합니다
 * @param {string} type_cd - 컨테이너 타입 코드
 * @returns {string} - 아이콘 경로
 */
export const getContainerIcon = (type_cd) => {
  switch (type_cd) {
    case 'house':
      return houseIcon;
    case 'COM1200001': // 큰 상자 (Area)
      return areaIcon;
    case 'COM1200002': // 중간 상자 (Box)
      return boxIcon;
    case 'COM1200003': // 물품 (Tag)
      return tagIcon;
    default:
      return boxIcon;
  }
};

export { houseIcon, areaIcon, boxIcon, tagIcon };
