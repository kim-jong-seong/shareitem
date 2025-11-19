import { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import '../../styles/Login.css';
import boxIcon from '../../assets/icons/box.svg';

function Login(props) {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [loading, setLoading] = useState(false);
    const [saveEmail, setSaveEmail] = useState(false);

    // 컴포넌트 마운트 시 저장된 이메일 불러오기
    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail }));
            setSaveEmail(true);
        }
    }, []);

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
                localStorage.setItem('token', data.token);
                
                // 아이디 저장 처리
                if (saveEmail) {
                    localStorage.setItem('savedEmail', formData.email);
                } else {
                    localStorage.removeItem('savedEmail');
                }
                
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
                    <h2>
                        <img src={boxIcon} alt="box" className="login-logo-icon" />
                        Share Item
                    </h2>
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

                    <div className="auth-buttons">
                        <button 
                            type="submit" 
                            className={`btn btn-primary ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </button>
                    </div>

                    {message && (
                        <div className={`message-box ${messageType}`}>
                            {message}
                        </div>
                    )}
                    
                </form>

                <div className="auth-footer">
                    계정이 없으신가요? <a href="#signup" onClick={(e) => { e.preventDefault(); props.onSwitchToSignup(); }}>회원가입</a>
                </div>
            </div>
        </div>
    );
}

export default Login;