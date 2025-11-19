/************************************************************
 * FILE: iconUtils.js
 * DESCRIPTION: 컨테이너 타입별 아이콘 유틸리티
 *              각 컨테이너 타입에 맞는 아이콘을 반환하는 함수 제공
 *
 * EXPORTS:
 * - getContainerIcon: 타입 코드로 아이콘 가져오기
 * - houseIcon, areaIcon, boxIcon, tagIcon: 개별 아이콘 export
 ************************************************************/

import houseIcon from '../assets/icons/house.svg';
import areaIcon from '../assets/icons/area.svg';
import boxIcon from '../assets/icons/box.svg';
import tagIcon from '../assets/icons/tag.svg';

/************************************************************
 * DESCRIPTION: 컨테이너 타입에 따라 적절한 아이콘을 반환
 *              UI에서 컨테이너를 시각적으로 구분하기 위해 사용
 *
 * PARAMS:
 * - type_cd: 컨테이너 타입 코드
 *   - 'house': 집
 *   - 'COM1200001': 영역 (Area) - 큰 구역
 *   - 'COM1200002': 박스 (Box) - 중간 크기 보관함
 *   - 'COM1200003': 물품 (Tag) - 실제 물건
 *   - default: 알 수 없는 타입은 박스 아이콘 반환
 *
 * RETURNS:
 * - 아이콘 경로 (SVG 파일)
 *
 * EXAMPLE:
 * const icon = getContainerIcon('COM1200003'); // tagIcon 반환
 ************************************************************/
export const getContainerIcon = (type_cd) => {
  switch (type_cd) {
    case 'house':
      return houseIcon; // 집 아이콘
    case 'COM1200001':
      return areaIcon; // 영역 아이콘 (큰 구역)
    case 'COM1200002':
      return boxIcon; // 박스 아이콘 (보관함)
    case 'COM1200003':
      return tagIcon; // 물품 아이콘 (태그)
    default:
      return boxIcon; // 기본값: 박스 아이콘
  }
};

/************************************************************
 * DESCRIPTION: 개별 아이콘 export
 *              다른 컴포넌트에서 직접 특정 아이콘을 import할 수 있도록 제공
 ************************************************************/
export { houseIcon, areaIcon, boxIcon, tagIcon };
