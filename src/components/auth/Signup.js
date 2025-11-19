import { useState } from 'react';
import { API_URL } from '../../config';
import '../../styles/Login.css'; // Login과 같은 스타일 사용

function Signup(props) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
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

        try {
            const response = await fetch(`${API_URL}/api/signup`, {
               method: 'POST',
               headers: {
                    'Content-Type': 'application/json'
               },
               body: JSON.stringify(formData)
            });

            const data = await response.json();

            if(response.ok) {
                setMessage("회원가입 성공! 로그인해주세요.");
                setMessageType('success');
                setFormData({ email: '', password: '', name: '' });
                setTimeout(() => {
                    props.onSwitchToLogin();
                }, 1500);
            } else {
                setMessage(data.error || "회원가입 실패");
                setMessageType('error');
            }
        } catch(error) {
            setMessage("서버 연결 실패");
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Share Item</h2>
                    <p>새 계정을 만들어보세요</p>
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
                            placeholder="안전한 비밀번호를 입력하세요"
                            required
                        />
                    </div>

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

                    <div className="auth-buttons">
                        <button 
                            type="submit" 
                            className={`btn btn-primary ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? '가입 중...' : '가입하기'}
                        </button>
                    </div>

                    {message && (
                        <div className={`message-box ${messageType}`}>
                            {message}
                        </div>
                    )}
                </form>

                <div className="auth-footer">
                    이미 계정이 있으신가요? <a href="#login" onClick={(e) => { e.preventDefault(); props.onSwitchToLogin(); }}>로그인</a>
                </div>
            </div>
        </div>
    );
}

export default Signup;