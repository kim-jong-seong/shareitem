# ★
npm run build
pm2 restart "shareitem-frontend"

# npm 서버 실행

## 1. 종료
- pkill -f "npm start"

## 2. 재시작
 - pkill -f "npm start" && cd ~/shareitem && nohup npm start > react.log 2>&1 &

## 3. 확인
 - tail -f react.log

# 포트 열려있는지 체크
 - https://portchecker.co/check-v0

# 빌드
## 1. 개발 서버 종료
pkill -f "react-scripts"

## 2. 프로덕션 빌드 생성
cd /home/ec2-user/shareitem
npm run build

## 3. serve로 배포
npm install -g serve
serve -s build -l 4000

# 백그라운드 실행
nohup serve -s build -l 4000 > serve.log 2>&1 &

pm2 start "serve -s build -l 4000" --name "shareitem-frontend"
