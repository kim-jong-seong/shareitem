# npm 서버 실행

## 1. 종료
- pkill -f "npm start"

## 2. 재시작
 - pkill -f "npm start" && cd ~/shareitem && nohup npm start > react.log 2>&1 &

## 3. 확인
 - tail -f react.log
