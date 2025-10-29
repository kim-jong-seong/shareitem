function Dashboard(props)
{
    return (
        <div>
            <h2>{props.user.name} 님 환영합니다.</h2>
            <p>Email: {props.user.email}</p>
            <button onClick={props.onLogout}>로그아웃</button>
        </div>
    );
}

export default Dashboard;