import { useState } from 'react';
import { API_URL } from '../config';

function Signup(props) 
{
    const [formData, setFormData] = useState
    ({
        email: '',
        password: '',
        name: ''
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
            const response = await fetch(`${API_URL}/api/signup`,
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
                setMessage("회원가입 성공! 로그인해주세요.");
            }
            else
            {
                setMessage(data.error || "회원가입 실패");
            }
        } 
        catch( error )
        {
            setMessage("서버 연결 실패");
        }
        finally
        {
            setLoading(false);
        }
    }

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
                <div>
                    <label>Name</label>
                    <br/>
                    <input type="name" name="name" value={formData.name} onChange={handleChange} required/>
                </div>
                {message && <p>{message}</p>}
                <div>
                    <button type="submit" disabled={loading}>
                        {loading ? "가입 중..." : "가입"}
                    </button>
                </div>
                <div>
                    <button type="button" disabled={loading} onClick={props.onSwitchToLogin}>홈으로</button>
                </div>
            </form>
        </div>
    )
}

export default Signup;