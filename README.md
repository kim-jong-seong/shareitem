# 개발 시 .env 생성
 - REACT_APP_API_URL=http://18.219.127.156:3001

# 백그라운드 실행
 - nohup npm start > react.log 2>&1 &

## 1. 종료
- pkill -f "npm start"

## 2. 재시작
 - pkill -f "npm start" && cd ~/shareitem && nohup npm start > react.log 2>&1 &

## 3. 확인
 - tail -f react.log
