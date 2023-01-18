import { $ } from "./utils/dom.js";
import store from "./store/store.js";

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

const MenuApi = {
  async getAllMenuByCategory(category) {
    const response = await fetch(`${BASE_URL}/category/${category}/menu`);
    return response.json();
  },
  async createMenu(category, name) {
    const response = await fetch(`${BASE_URL}/category/${category}/menu`, {
      method: "POST", //생성
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      console.error("에러가 발생했습니다.");
    }
  },
  async reviseMenuName(category, name, menuId) {
    const response = await fetch(
      `${BASE_URL}/category/${category}/menu/${menuId}`,
      {
        method: "PUT", //수정
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      }
    );
    if (!response.ok) {
      console.error("에러가 발생했습니다.");
    }
    return response.json();
  },
  async toggleSoldOutMenu(category, menuId) {
    const response = await fetch(
      `${BASE_URL}/category/${category}/menu/${menuId}/soldout`,
      {
        method: "PUT",
      }
    );
    if (!response.ok) {
      console.error("에러가 발생했습니다.");
    }
  },
  async removeMenu(category, menuId) {
    const response = await fetch(
      `${BASE_URL}/category/${category}/menu/${menuId}/`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      console.error("에러가 발생했습니다.");
    }
  },
};

function App() {
  //상태는 변하는 데이터.. 관리필요
  this.menu = {
    espresso: [],
    frappuccino: [],
    blended: [],
    teavana: [],
    desert: [],
  }; //데이터 수정 및 변경 등
  this.currentCategory = "espresso";
  this.init = async () => {
    //데이터 불러오기 위해 (쿠키 느낌.. 데이터가 유지되고 있다)
    // if (store.getLocalStorage()) {
    //   this.menu = store.getLocalStorage();
    // }

    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(
      this.currentCategory
    );
    render();
    initEventListeners();
  };

  const render = () => {
    const template = this.menu[this.currentCategory]
      .map((item, index) => {
        return `<li data-menu-id="${
          item.id
        }" class= "menu-list-item d-flex items-center py-2">
          <span class="w-100 pl-2 menu-name ${
            item.isSoldOut ? "sold-out" : ""
          }">${item.name}</span>
          <button
            type="button"
            class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
          >
            품절
          </button>
          <button
            type="button"
            class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
          >
            수정
          </button>
          <button
            type="button"
            class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
          >
            삭제
          </button>
        </li>`;
      })
      .join("");

    $("#menu-list").innerHTML = template;
    updateMenuCount();
  };

  //메뉴 카운트 정의
  const updateMenuCount = () => {
    const menuCount = this.menu[this.currentCategory].length;
    $(".menu-count").innerText = `총 ${menuCount}개`;
  };

  //메뉴
  const callMenu = async () => {
    if ($("#menu-name").value === "") {
      alert("입력해주세요!!");
      return;
    }
    const MenuName = $("#menu-name").value;

    await MenuApi.createMenu(this.currentCategory, MenuName);
    //리스트 불러와야 바로 보임
    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(
      this.currentCategory
    );
    render();
    $("#menu-name").value = "";

    //요부분 서버 연결하면서 옮김
    // this.menu[this.currentCategory].push({ name: MenuName });
    //store.setLocalStorage(this.menu);
    // render();
    // $("#menu-name").value = "";
  };

  //메뉴 수정 정의
  const reviseMenu = async (e) => {
    const menuId = e.target.closest("li").dataset.menuId;
    const $menuName = e.target.closest("li").querySelector(".menu-name"); //closest 위임...!
    const reviseName = prompt("메뉴명을 수정해주세요", $menuName.innerText);

    await MenuApi.reviseMenuName(this.currentCategory, reviseName, menuId);
    //리스트 불러와야 바로 보인다
    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(
      this.currentCategory
    );
    // //데이터도 수정
    // this.menu[this.currentCategory][menuId].name = reviseName;
    // store.setLocalStorage(this.menu);
    render();
  };
  //메뉴 제거 정의
  const removeMenu = async (e) => {
    if (confirm("삭제 하시겠습니까?")) {
      //데이터도 제거
      const menuId = e.target.closest("li").dataset.menuId;
      await MenuApi.removeMenu(this.currentCategory, menuId);
      //리스트 불러와야 바로 보인다
      this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(
        this.currentCategory
      );
      //   this.menu[this.currentCategory].splice(menuId, 1);
      //   store.setLocalStorage(this.menu);
      render();
    }
  };
  //메뉴 품절 정의
  const soldoutMenu = async (e) => {
    const menuId = e.target.closest("li").dataset.menuId;
    await MenuApi.toggleSoldOutMenu(this.currentCategory, menuId);
    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(
      this.currentCategory
    );
    // this.menu[this.currentCategory][menuId].soldOut =
    //   !this.menu[this.currentCategory][menuId].soldOut;
    // store.setLocalStorage(this.menu);
    render();
  };

  //이벤트 구현
  const initEventListeners = () => {
    //수정 삭제 구현
    $("#menu-list").addEventListener("click", (e) => {
      if (e.target.classList.contains("menu-sold-out-button")) {
        soldoutMenu(e);
        return;
      }

      if (e.target.classList.contains("menu-edit-button")) {
        reviseMenu(e);
        return;
      }

      if (e.target.classList.contains("menu-remove-button")) {
        removeMenu(e);
        return;
      }
    });

    //form 태그 자동 전송 방지 구현
    $("#menu-form").addEventListener("submit", (e) => {
      e.preventDefault();
    });
    //마우스 클릭 이벤트 발생
    $("#menu-submit-button").addEventListener("click", () => {
      callMenu();
    });
    //엔터키 입력 이벤트 발생
    $("#menu-name").addEventListener("keypress", (e) => {
      if (e.key !== "Enter") {
        return;
      }
      callMenu();
    });
    //다른 메뉴
    $("nav").addEventListener("click", async (e) => {
      if (e.target.classList.contains("cafe-category-name")) {
        const categoryName = e.target.dataset.categoryName;
        this.currentCategory = categoryName;
        $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
        this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(
          this.currentCategory
        );
        render();
      }
    });
  };
}
const app = new App();
app.init();
