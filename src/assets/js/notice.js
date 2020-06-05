(() => {
  const modalContainer = document.querySelector(".modal-container"),
    confirmButton = document.querySelector(".modal .btn-container .confirm"),
    exitButton = document.querySelector(".modal .exit-btn");
  const handleModalClose = () => {
    if (modalContainer) {
      modalContainer.style.display = "none";
    }
  };
  const init = () => {
    confirmButton.addEventListener("click", handleModalClose);
    exitButton.addEventListener("click", handleModalClose);
  };
  init();
})();
