import { useState } from 'react';
import { API_URL } from '../../config';
import '../../styles/Login.css';

/************************************************************
 * DESCRIPTION: Signup 컴포넌트
 *              새로운 사용자가 회원가입할 수 있는 화면을 제공하는 컴포넌트
 *
 * PROPS:
 * - onSwitchToLogin: 로그인 화면으로 전환하는 함수
 ************************************************************/
function Signup(props) {

    /************************************************************
     * DESCRIPTION: State 선언부
     ************************************************************/
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });
    const [message, setMessage] = useState(''); // 사용자에게 보여줄 메시지
    const [messageType, setMessageType] = useState(''); // 'success' 또는 'error'
    const [loading, setLoading] = useState(false); // 로딩 중 여부

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
     * DESCRIPTION: 회원가입 버튼 클릭 핸들러
     *              서버에 회원가입 요청을 보내고 응답을 처리함
     ************************************************************/
    const handleSubmit = async(e) => {
        /* 1. 폼 제출 준비 */
        e.preventDefault(); // 페이지 새로고침 방지
        setLoading(true); // 로딩 시작
        setMessage(''); // 이전 메시지 초기화

        try {
            /* 2. 서버에 회원가입 요청 */
            const response = await fetch(`${API_URL}/api/signup`, {
               method: 'POST',
               headers: {
                    'Content-Type': 'application/json'
               },
               body: JSON.stringify(formData) // 이메일, 비밀번호, 이름을 JSON으로 변환
            });

            /* 3. 응답 데이터 파싱 */
            const data = await response.json();

            /* 4. 응답 처리 */
            if(response.ok) {
                setMessage("회원가입 성공! 로그인해주세요.");
                setMessageType('success');
                setFormData({ email: '', password: '', name: '' }); // 입력창 초기화

                setTimeout(() => {
                    props.onSwitchToLogin(); // 로그인 화면으로 전환
                }, 1500); // 사용자가 성공 메시지를 볼 시간 제공
            } else {
                setMessage(data.error || "회원가입 실패");
                setMessageType('error');
            }
        } catch(error) {
            setMessage("서버 연결 실패");
            setMessageType('error');
        } finally {
            setLoading(false); // 로딩 종료
        }
    };

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 화면에 그려질 HTML 구조
     ************************************************************/
    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Share Item</h2>
                    <p>새 계정을 만들어보세요</p>
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
                            placeholder="안전한 비밀번호를 입력하세요"
                            required
                        />
                    </div>

                    {/* 이름 입력창 */}
                    <div className="form-group">
                        <label>이름</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="홍길동"
                            required
                        />
                    </div>

                    {/* 가입 버튼 */}
                    <div className="auth-buttons">
                        <button
                            type="submit"
                            className={`btn btn-primary ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? '가입 중...' : '가입하기'}
                        </button>
                    </div>

                    {/* 메시지 표시 영역 */}
                    {message && (
                        <div className={`message-box ${messageType}`}>
                            {message}
                        </div>
                    )}
                </form>

                {/* 로그인 링크 */}
                <div className="auth-footer">
                    이미 계정이 있으신가요? <a href="#login" onClick={(e) => { e.preventDefault(); props.onSwitchToLogin(); }}>로그인</a>
                </div>
            </div>
        </div>
    );
}

export default Signup;
