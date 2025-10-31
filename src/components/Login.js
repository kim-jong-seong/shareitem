import { useState } from 'react';
import { API_URL } from '../config';
import '../styles/Login.css';

function Login(props) {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        let responseSuccess = false; // 로그인 성공 시 로딩 프로그레스 바가 계속 도는 것으로 보이게 함

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if(response.ok) {
                responseSuccess = true;
                // setMessage("로그인 성공!");
                // setMessageType('success');
                localStorage.setItem('token', data.token);
                setTimeout(() => {
                    props.onLoginSuccess(data.user);
                }, 500);
            } else {
                setMessage(data.error || '로그인 실패');
                setMessageType('error');
            }
        } catch(error) {
            setMessage('서버 연결 실패');
            setMessageType('error');
        } finally {
            if(!responseSuccess) {
                setLoading(false);
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Share Item</h2>
                    <p>물품을 공유하고 관리해보세요</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
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

                    {message && (
                        <div className={`message-box ${messageType}`}>
                            {message}
                        </div>
                    )}

                    <div className="auth-buttons">
                        <button 
                            type="submit" 
                            className={`btn btn-primary ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </button>
                    </div>
                </form>

                <div className="auth-footer">
                    계정이 없으신가요? <a href="#signup" onClick={(e) => { e.preventDefault(); props.onSwitchToSignup(); }}>회원가입</a>
                </div>
            </div>
        </div>
    );
}

export default Login;