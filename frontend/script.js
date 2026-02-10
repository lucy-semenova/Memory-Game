const card = document.getElementById("myFlipCard");

card.addEventListener("click", () => {
    card.classList.add("flipped");
   
  setTimeout(() => {
    card.classList.remove("flipped");
  }, 1000);
});