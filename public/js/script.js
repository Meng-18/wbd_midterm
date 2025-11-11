const swiper = new Swiper(".slider-container", {
  effect: "slide",
  speed: 1000,
  autoplay: { delay: 2000 },
});


// Add to cart functionality with event delegation
// document.addEventListener("click", function (e) {
//   if (
//     e.target.classList.contains("btn") &&
//     e.target.textContent.includes("Add to Cart")
//   ) {
//     const selectedSize = document.querySelector(
//       'input[name="size"]:checked'
//     )?.value;
//     const quantityInput = document.querySelector(".qtyview");
//     const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

//     // Get productId from the button's onclick attribute or data attribute
//     const productId =
//       e.target.getAttribute("data-product-id") || window.currentProductId; // You'd need to set this

//     if (document.querySelector(".size") && !selectedSize) {
//       showToast("Please select a size before adding to cart", "warning");
//       return;
//     }

//     addToCart(productId, quantity, selectedSize);
//   }
// });
