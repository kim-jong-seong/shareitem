/************************************************************
 * FILE: timeUtils.js
 * DESCRIPTION: 시간 관련 유틸리티 함수
 *              날짜를 사용자 친화적인 상대 시간으로 변환
 *
 * EXPORTS:
 * - getRelativeTime: 상대 시간 문자열 반환 (예: "5분 전", "1시간 전")
 ************************************************************/

/************************************************************
 * DESCRIPTION: 상대 시간 계산 함수
 *              주어진 날짜와 현재 시간의 차이를 계산하여
 *              사람이 읽기 쉬운 상대 시간 문자열로 반환
 *
 * PARAMS:
 * - dateString: 날짜 문자열 (Date 객체로 변환 가능한 형식)
 *
 * RETURNS:
 * - 상대 시간 문자열:
 *   - "방금 전" (1분 미만)
 *   - "N분 전" (1분 ~ 1시간 미만)
 *   - "N시간 전" (1시간 ~ 1일 미만)
 *   - "N일 전" (1일 ~ 30일 미만)
 *   - "N개월 전" (30일 ~ 365일 미만)
 *   - "N년 전" (365일 이상)
 *
 * EXAMPLE:
 * getRelativeTime('2025-11-20 14:00:00') // "5분 전"
 * getRelativeTime('2025-11-19 14:00:00') // "1일 전"
 ************************************************************/
export const getRelativeTime = (dateString) => {
  /* 1. 날짜 객체 생성 */
  const date = new Date(dateString);
  const now = new Date();

  /* 2. 시간 차이 계산 (밀리초) */
  const diff = now - date;

  /* 3. 각 단위로 변환 */
  const seconds = Math.floor(diff / 1000); // 초
  const minutes = Math.floor(seconds / 60); // 분
  const hours = Math.floor(minutes / 60); // 시간
  const days = Math.floor(hours / 24); // 일
  const months = Math.floor(days / 30); // 월 (약 30일 기준)
  const years = Math.floor(days / 365); // 년 (약 365일 기준)

  /* 4. 적절한 단위로 문자열 반환 */
  if (seconds < 60) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 30) return `${days}일 전`;
  if (months < 12) return `${months}개월 전`;
  return `${years}년 전`;
};
