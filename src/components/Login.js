import { useState } from 'react';
import { API_URL } from '../config';

function Login(props) 
{

    const [formData, setFormData] = useState
    ({
        email: '',
        password: ''
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => 
    {
        setFormData
        ({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async(e) =>
    {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try
        {
            const response = await fetch(`${API_URL}/api/login`, 
            {
                method: 'POST',
                headers:
                {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if( response.ok )
            {
                setMessage("로그인 성공!");
                localStorage.setItem('token', data.token);
                props.onLoginSuccess(data.user);
            }
            else
            {
                setMessage(data.error || '로그인 실패');
            }
        }
        catch( error )
        {
            setMessage('서버 연결 실패');
        }
        finally
        {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Share Item</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>ID</label>
                    <br/>
                    <input type="text" name="email" value={formData.email} onChange={handleChange} required/>
                </div>
                <div>
                    <label>Password</label>
                    <br/>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required/>
                </div>
                {message && <p>{message}</p>}
                <div>
                    <button type="submit" disabled={loading}>
                        {loading ? "로그인 중..." : "로그인"}
                    </button>
                </div>
                <div>
                    <button type="button" disabled={loading} onClick={props.onSwitchToSignup}>회원가입</button>
                </div>
            </form>
        </div>
    )
}

export default Login;