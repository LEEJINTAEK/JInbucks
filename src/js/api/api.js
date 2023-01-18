// 서버 요청 부분
// [] 웹 서버를 띄운다.
// [] 서버에 새로운 메뉴가 추가될 수 있도록 요청
// [] 서버에 카테고리별 메뉴리스트를 불러온다
// [] 서버에 메뉴가 수정 될 수 있도록 요청한다.
// [] 서버에 메뉴의 품절상태가 토글될 수 있도록 요청한다.
// [] 서버에 메뉴가 삭제 될 수 있도록 요청한다.

// 리펙터링 부분
// [] local storage에 저장하는 로직은 지운다.
// [] fetch 비동기 api를 사용하는 부분을 async await을 사용하여 구현

//사용자 경험
// [] api 통신이 실패하는 경우에 대해 사용자가 알 수 있게 alert로 예외처리 진행
// [] 중복되는 메뉴는 추가할 수 없다.

//리펙터링으로 코드 간소화, 정리 등등 필수!
//되도록 파일 분할
const BASE_URL = "http://localhost:3000/api/";

const HTTP_METHOD = {
  POST(data) {
    return {
      method: "POST", //생성
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
  },
  PUT(data) {
    return {
      method: "PUT", //수정
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : null,
    };
  },
  DELETE() {
    return {
      method: "DELETE",
    };
  },
};

const request = async (url, option) => {
  const response = await fetch(url, option);
  if (!response.ok) {
    alert("에러가 발생했습니다.");
    console.error(e);
  }
  return response.json(); //json으로 반환
};

const requestWithoutJson = async (url, option) => {
  const response = await fetch(url, option);
  if (!response.ok) {
    alert("에러가 발생했습니다.");
    console.error(e);
  }
};

const MenuApi = {
  getAllMenuByCategory(category) {
    return request(`${BASE_URL}/category/${category}/menu`);
  },
  createMenu(category, name) {
    return request(
      `${BASE_URL}/category/${category}/menu`,
      HTTP_METHOD.POST({ name })
    );
  },
  reviseMenuName(category, name, menuId) {
    return request(
      `${BASE_URL}/category/${category}/menu/${menuId}`,
      HTTP_METHOD.PUT({ name })
    );
  },
  toggleSoldOutMenu(category, menuId) {
    return request(
      `${BASE_URL}/category/${category}/menu/${menuId}/soldout`,
      HTTP_METHOD.PUT()
    );
  },
  removeMenu(category, menuId) {
    return requestWithoutJson(
      `${BASE_URL}/category/${category}/menu/${menuId}`,
      HTTP_METHOD.DELETE()
    );
  },
};

export default MenuApi;
