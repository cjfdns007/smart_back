### 프로젝트 소개
해당 프로젝트는 독거노인을 보조하기 위한 프로젝트입니다.
여러 센서들로 부터 받은 데이터(심박수, 약통 열림, 외출 여부, 걸음수)들을 종합합니다.
모은 데이터들을 보호자에게 가시화하여 제공하며, 응급상황이 발생하면 알림을 통해 정보를 전달합니다.

### 기술 스택
node.js + express + typescript
Redis
mysql
Firebase Cloud Messaging

### 수행업무
* API 설계
* DB 설계
* 인증관련
* - 회원가입
  - - 회원가입시 입력한 비밀번호를 암호화하여 DB에 저장하였습니다.
  - - 독거노인과 보호자 두 가지로 가입이 가능하도록 하였습니다.
* - 로그인
  - - 로그인시 JWT 토큰을 발급하고 토큰에 대한 ID와 독거노인 여부를 reids에 저장하였습니다.
  - - 또한, 해당 유저 관련 FCM 토큰을 redis에 저장하여, 추후 알림이 갈 수 있도록 하였습니다.
* - 로그아웃
  - - redis에 저장되어있던 관련 정보들을 삭제하였습니다.

 
