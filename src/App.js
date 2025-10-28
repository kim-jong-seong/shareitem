// 여기서부터 시작
import './App.css';

// const API_URL = 'http://18.219.127.156:5000';

function Login(props) {
  return (
    <div>
      <h2>Share Item</h2>
      <form>
        <div>
          <label>ID</label>
          <br/>
          <input type="text" name="username" />
        </div>
        <div>
          <label>Password</label>
          <br/>
          <input type="password" name="password" />
        </div>
        <div>
          <button type="submit">로그인</button>
        </div>
        <div>
          <button type="button">회원가입</button>
        </div>
      </form>
    </div>
  )
}

function App() {
  return (
    <div>
      <div>
        <Login />
      </div>
    </div>
  );
}

export default App;
