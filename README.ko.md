# Comap

Comap은 실시간으로 코로나19 마스크 판매 현황을 지도에 표시하는 서비스입니다. 2020년에 개발되었으며, 팬데믹 동안 사용자들이 가까운 매장에서 마스크를 찾을 수 있도록 돕기 위해 만들어졌습니다.

## 주요 기능

- **실시간 지도 표시**: 대화형 지도에서 마스크 재고 현황을 표시합니다.
- **실시간 데이터 업데이트**: 마스크 재고 정보를 자동으로 가져오고 갱신합니다.
- **매장 검색 기능**: 사용자가 가까운 매장을 검색하여 마스크 재고를 확인할 수 있습니다.
- **사용자 친화적 인터페이스**: 직관적이고 간편한 UI 제공.

## 사용 기술

- **프론트엔드**: Vue.js, Leaflet.js (대화형 지도 구현)
- **백엔드**: Node.js, Express
- **데이터베이스**: Firebase (실시간 데이터 업데이트)
- **API 연동**: 공공 보건 및 유통 API를 활용한 실시간 데이터 제공

## 설치 방법

프로젝트를 로컬 환경에서 실행하려면:

```sh
git clone https://github.com/yourusername/comap.git
cd comap
npm install
npm run dev
```
