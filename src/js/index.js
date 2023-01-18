import { $ } from "./utils/dom.js";
import store from "./store/store.js";
import MenuApi from "./api/api.js";

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

  const render = async () => {
    //리스트 불러와야 바로 보인다
    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(
      this.currentCategory
    );
    const template = this.menu[this.currentCategory]
      .map((item) => {
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
    const duplicatedItem = this.menu[this.currentCategory].find(
      (menuItem) => menuItem.name === $("#menu-name").value
    );
    if (duplicatedItem) {
      alert("이미 등록된 메뉴입니다. 다시 입력해주세요");
      $("#menu-name").value = "";
      return;
    }

    const MenuName = $("#menu-name").value; //입력값

    await MenuApi.createMenu(this.currentCategory, MenuName);
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
      //   this.menu[this.currentCategory].splice(menuId, 1);
      //   store.setLocalStorage(this.menu);
      render();
    }
  };
  //메뉴 품절 정의
  const soldoutMenu = async (e) => {
    const menuId = e.target.closest("li").dataset.menuId;
    await MenuApi.toggleSoldOutMenu(this.currentCategory, menuId);

    // this.menu[this.currentCategory][menuId].soldOut =
    //   !this.menu[this.currentCategory][menuId].soldOut;
    // store.setLocalStorage(this.menu);
    render();
  };

  // 다른 메뉴 이동 정의
  const anotherCategory = (e) => {
    if (e.target.classList.contains("cafe-category-name")) {
      const categoryName = e.target.dataset.categoryName;
      this.currentCategory = categoryName;
      $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
      render();
    }
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
    $("nav").addEventListener("click", anotherCategory);
  };
}
const app = new App();
app.init();
