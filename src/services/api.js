/************************************************************
 * FILE: api.js
 * DESCRIPTION: Axios API 클라이언트 설정
 *              백엔드 API와 통신하기 위한 axios 인스턴스
 *              자동 토큰 인증 처리 포함
 *
 * EXPORTS:
 * - api: 설정된 axios 인스턴스 (default export)
 *
 * FEATURES:
 * - baseURL 자동 설정
 * - JWT 토큰 자동 추가 (Request Interceptor)
 * - localStorage에서 토큰 자동 조회
 ************************************************************/

import axios from 'axios';
import { API_URL } from '../config';

/************************************************************
 * DESCRIPTION: Axios 인스턴스 생성
 *              모든 API 요청에 사용할 기본 설정을 가진 axios 인스턴스
 *
 * CONFIG:
 * - baseURL: API 기본 URL (config.js에서 가져옴)
 *            예: http://localhost:5001/api
 *
 * USAGE:
 * import api from '../services/api';
 * const response = await api.get('/houses');
 * const response = await api.post('/houses', data);
 ************************************************************/
const api = axios.create({
  baseURL: `${API_URL}/api`, // 모든 요청의 기본 URL
});

/************************************************************
 * DESCRIPTION: Request Interceptor - 자동 토큰 추가
 *              모든 API 요청 전에 실행되는 인터셉터
 *              localStorage에서 JWT 토큰을 가져와 Authorization 헤더에 자동 추가
 *
 * FLOW:
 * 1. localStorage에서 'token' 키로 JWT 토큰 조회
 * 2. 토큰이 있으면 Authorization 헤더에 "Bearer {token}" 형식으로 추가
 * 3. 수정된 config 반환 (요청 진행)
 *
 * WHY:
 * - 매번 수동으로 토큰을 추가할 필요 없음
 * - 인증이 필요한 모든 API 호출에 자동 적용
 * - 코드 중복 제거 및 편의성 향상
 ************************************************************/
api.interceptors.request.use((config) => {
  /* 1. localStorage에서 토큰 가져오기 */
  const token = localStorage.getItem('token');

  /* 2. 토큰이 있으면 Authorization 헤더에 추가 */
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  /* 3. 수정된 config 반환 */
  return config;
});

/************************************************************
 * DESCRIPTION: API 인스턴스 export
 *              다른 컴포넌트에서 import하여 사용
 *
 * EXAMPLE:
 * import api from './services/api';
 *
 * // GET 요청
 * const houses = await api.get('/houses');
 *
 * // POST 요청
 * const newHouse = await api.post('/houses', { name: '우리집' });
 *
 * // DELETE 요청
 * await api.delete('/houses/1');
 ************************************************************/
export default api;
