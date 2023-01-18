const store = {
  setLocalStorage(menu) {
    return localStorage.setItem("menu", JSON.stringify(menu));
  },
  getLocalStorage() {
    return JSON.parse(localStorage.getItem("menu")); //parse는 다시 json헝태로 바꿈
  },
};

export default store;
