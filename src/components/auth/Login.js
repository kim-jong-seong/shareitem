import { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import '../../styles/Login.css';
import boxIcon from '../../assets/icons/box.svg';

/************************************************************
 * DESCRIPTION: Login 컴포넌트
 *              사용자 이메일/비밀번호 로그인 화면을 제공하는 컴포넌트
 *
 * PROPS:
 * - onLoginSuccess: 로그인 성공 시 호출되는 함수
 * - onSwitchToSignup: 회원가입 화면으로 전환하는 함수
 ************************************************************/
function Login(props) {

    /************************************************************
     * DESCRIPTION: State 선언부
     ************************************************************/
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [message, setMessage] = useState(''); // 사용자에게 보여줄 메시지
    const [messageType, setMessageType] = useState(''); // 'success' 또는 'error'
    const [loading, setLoading] = useState(false); // 로딩 중 여부
    const [saveEmail, setSaveEmail] = useState(false); // 아이디 저장 체크박스 상태

    /************************************************************
     * DESCRIPTION: 컴포넌트 마운트 시 실행
     *              저장된 이메일이 있으면 자동으로 입력창에 채움
     ************************************************************/
    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail })); // 이메일만 업데이트
            setSaveEmail(true); // 체크박스도 체크 상태로 변경
        }
    }, []); // 빈 배열: 컴포넌트 마운트 시 한 번만 실행

    /************************************************************
     * DESCRIPTION: 입력창 값 변경 핸들러
     *              리액트는 입력창 값을 state로 관리해야 함
     ************************************************************/
    const handleChange = (e) => {
        setFormData({
            ...formData, // 기존 데이터 유지
            [e.target.name]: e.target.value // 변경된 필드만 업데이트
        });
    };

    /************************************************************
     * DESCRIPTION: 로그인 버튼 클릭 핸들러
     *              서버에 인증 요청을 보내고 응답을 처리함
     ************************************************************/
    const handleSubmit = async(e) => {
        /* 1. 폼 제출 준비 */
        e.preventDefault(); // 페이지 새로고침 방지
        setLoading(true); // 로딩 시작
        setMessage(''); // 이전 메시지 초기화
        let responseSuccess = false; // 성공 시 로딩 유지용 플래그

        try {
            /* 2. 서버에 로그인 요청 */
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData) // 이메일, 비밀번호를 JSON으로 변환
            });

            /* 3. 응답 데이터 파싱 */
            const data = await response.json();

            /* 4. 응답 처리 */
            if(response.ok) {
                responseSuccess = true;
                localStorage.setItem('token', data.token); // 인증 토큰 저장

                // 아이디 저장 처리
                if (saveEmail) {
                    localStorage.setItem('savedEmail', formData.email);
                } else {
                    localStorage.removeItem('savedEmail');
                }

                setTimeout(() => {
                    props.onLoginSuccess(data.user); // 부모 컴포넌트에 사용자 정보 전달
                }, 500); // 부드러운 화면 전환을 위한 딜레이
            } else {
                setMessage(data.error || '로그인 실패');
                setMessageType('error');
            }
        } catch(error) {
            setMessage('서버 연결 실패');
            setMessageType('error');
        } finally {
            if(!responseSuccess) {
                setLoading(false); // 실패한 경우에만 로딩 해제
            }
        }
    };

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 화면에 그려질 HTML 구조
     ************************************************************/
    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>
                        <img src={boxIcon} alt="box" className="login-logo-icon" />
                        Share Item
                    </h2>
                    <p>물품을 공유하고 관리해보세요</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {/* 이메일 입력창 */}
                    <div className="form-group">
                        <label>이메일</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@email.com"
                            required
                        />
                    </div>

                    {/* 비밀번호 입력창 */}
                    <div className="form-group">
                        <label>비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>

                    {/* 아이디 저장 체크박스 */}
                    <div className="save-email-box">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={saveEmail}
                                onChange={(e) => setSaveEmail(e.target.checked)}
                            />
                            <span>아이디 저장</span>
                        </label>
                    </div>

                    {/* 로그인 버튼 */}
                    <div className="auth-buttons">
                        <button
                            type="submit"
                            className={`btn btn-primary ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </button>
                    </div>

                    {/* 메시지 표시 영역 */}
                    {message && (
                        <div className={`message-box ${messageType}`}>
                            {message}
                        </div>
                    )}

                </form>

                {/* 회원가입 링크 */}
                <div className="auth-footer">
                    계정이 없으신가요? <a href="#signup" onClick={(e) => { e.preventDefault(); props.onSwitchToSignup(); }}>회원가입</a>
                </div>
            </div>
        </div>
    );
}

export default Login;
