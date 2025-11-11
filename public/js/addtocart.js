// Global variable to store current product data
let currentProduct = null;

// Function to load product data or cart data
function loadProductData() {
  try {
    const currentPath = window.location.pathname;
    let apiURL;

    // ✅ Detect which page we are on
    if (currentPath.includes("/cart")) {
      console.log("Detected cart page, skipping product API");
      return; // We don't need to fetch product data on the cart page
    } else {
      // Get product ID from URL (e.g., /products/123)
      const productId = getProductIdFromCurrentURL();
      apiURL = `/api/products/${productId}`;
    }

    // Fetch data from the correct API
    fetch(apiURL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((productData) => {
        // Store product data globally
        currentProduct = productData;
        console.log("✅ Product loaded successfully:", currentProduct);
      })
      .catch((error) => {
        console.error("❌ Error loading product:", error);
        showToast("Failed to load product details", "error");
      });
  } catch (error) {
    console.error("❌ Error in loadProductData:", error);
  }
}

// Function to extract product ID from URL
function getProductIdFromCurrentURL() {
  const currentURLPath = window.location.pathname;
  const pathSegments = currentURLPath.split("/");
  const lastSegment = pathSegments[pathSegments.length - 1];
  return lastSegment;
}

// Toast notification function
function showToast(message, type = "success") {
  const toastElement = document.createElement("div");
  toastElement.className = "toast toast-" + type;
  toastElement.innerHTML = `
      <div class="toast-icon">${getToastIcon(type)}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" onclick="removeToast(this)">×</button>
  `;

  document.body.appendChild(toastElement);

  setTimeout(() => toastElement.classList.add("show"), 10);

  setTimeout(() => {
    if (toastElement.parentElement) {
      toastElement.classList.remove("show");
      setTimeout(() => toastElement.remove(), 300);
    }
  }, 1500);
}

// Helper to remove toast manually
function removeToast(closeButton) {
  const toastElement = closeButton.parentElement;
  if (toastElement && toastElement.parentElement) {
    toastElement.remove();
  }
}

// Add to cart
function addToCart() {
  if (currentProduct === null) {
    showToast("Product information is not loaded yet", "error");
    return;
  }

  const selectedSizeInput = document.querySelector(
    'input[name="size"]:checked'
  );
  const quantityInputElement = document.querySelector(".qtyview");
  const quantityValue = quantityInputElement ? quantityInputElement.value : "1";

  const sizeSectionElement = document.querySelector(".size");
  if (sizeSectionElement && selectedSizeInput === null) {
    showToast("Please select a size before adding to cart", "warning");
    return;
  }

  showToast(currentProduct.name + " added to Cart", "success");

  const cartItem = {
    id: currentProduct.id,
    name: currentProduct.name,
    price: currentProduct.price,
    image: currentProduct.image,
    size: selectedSizeInput ? selectedSizeInput.value : undefined,
    quantity: parseInt(quantityValue),
  };

  addItemToCartStorage(cartItem);
  console.log("Product added to cart:", cartItem);
}

// Save item to localStorage
function addItemToCartStorage(cartItem) {
  let cartItems = [];
  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    try {
      cartItems = JSON.parse(storedCart);
    } catch {
      console.error("Error parsing cart data");
      cartItems = [];
    }
  }

  let itemExists = false;
  for (let i = 0; i < cartItems.length; i++) {
    if (
      cartItems[i].id === cartItem.id &&
      cartItems[i].size === cartItem.size
    ) {
      cartItems[i].quantity += cartItem.quantity;
      itemExists = true;
      break;
    }
  }

  if (!itemExists) cartItems.push(cartItem);

  try {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  } catch {
    console.error("Error saving to localStorage");
    showToast("Failed to save cart", "error");
  }

  updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
  const cartContainer = document.getElementById("cart");
  const cartEmptyMessage = document.querySelector(".cart-empty");

  if (!cartContainer) return;

  let cartItems = [];
  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    try {
      cartItems = JSON.parse(storedCart);
    } catch {
      console.error("Error parsing cart data");
      cartItems = [];
    }
  }

  if (cartItems.length === 0) {
    cartContainer.innerHTML = `
      <div class="cart-empty">
          <p>Your cart is empty</p>
          <a href="/products" class="btn">Continue Shopping</a>
      </div>`;
    if (cartEmptyMessage) cartEmptyMessage.style.display = "block";
    return;
  }

  if (cartEmptyMessage) cartEmptyMessage.style.display = "none";
  cartContainer.style.display = "block";

  let cartHTML = "";
  for (let item of cartItems) {
    cartHTML += `
    <div class="main-cart">
      <div class="cart-item">
        <img src="${item.image}" alt="${
      item.name
    }" onerror="this.src='/images/placeholder.avif'">
        <div class="item-details">
            <h3>${item.name}</h3>
            <p class="price">$${item.price}</p>
            <p class="quantity">Quantity: ${item.quantity}</p>
            ${item.size ? `<p class="size">Size: ${item.size}</p>` : ""}
        </div>
        <div class="item-total">
        <h3>Total Price</h3>
        $${(item.price * item.quantity).toFixed(2)}
        </div>

        <div class="cart-actions">
         <button class="btn btn-primary" onclick="decreaseQuantity('${
           item.id
         }', '${item.size || ""}')">Decrease</button>
          <button class="btn btn-primary" onclick="removeFromCart('${
            item.id
          }', '${item.size || ""}')">Remove</button>
        </div>
      </div>
    </div>`;
  }

  // ✅ Add total price and checkout button at the bottom
  const total = cartItems
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  cartHTML += `
    <div class="cart-total">
      <h2>Total Amount: $${total}</h2>
      <button class="btn btn-success" onclick="proceedToCheckout()">Proceed to Checkout</button>
    </div>
  `;

  cartContainer.innerHTML = cartHTML;
}

// Decrease quantity of item in cart
function decreaseQuantity(productId, size = "") {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Make sure IDs are compared as strings
  const itemIndex = cart.findIndex(
    (item) =>
      String(item.id) === String(productId) &&
      (item.size ? item.size === size : true)
  );

  if (itemIndex !== -1) {
    const item = cart[itemIndex];

    if (item.quantity > 1) {
      item.quantity -= 1;
      showToast(`Reduced ${item.name} quantity by 1`, "info");
    } else {
      cart.splice(itemIndex, 1);
      showToast(`${item.name} removed from cart`, "info");
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartDisplay();
  } else {
    console.warn("Cart items:", cart);
    console.warn("Product ID searched:", productId, "Size:", size);
    showToast("Item not found in cart", "error");
  }
}
// Remove item from cart
function removeFromCart(productId, size = "") {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const initialLength = cart.length;
  cart = cart.filter(
    (item) =>
      !(
        String(item.id) === String(productId) &&
        (item.size ? item.size === size : true)
      )
  );
  if (cart.length < initialLength) {
    localStorage.setItem("cart", JSON.stringify(cart));
    showToast(`item removed from cart`, "info");
    updateCartDisplay();
  } else {
    showToast(`item not found in cart`, "error");
  }
}

// Toast icon helper
function getToastIcon(type) {
  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };
  return icons[type] || "ℹ";
}

// Initialize page logic
function initializePage() {
  const addToCartButton = document.getElementById("addToCartBtn");
  const currentPath = window.location.pathname;

  // ✅ Product page
  if (currentPath.includes("/products/")) {
    console.log("Product page detected");
    loadProductData();
    if (addToCartButton) addToCartButton.addEventListener("click", addToCart);
  }

  // ✅ Cart page
  if (currentPath.includes("/cart")) {
    console.log("Cart page detected");
    updateCartDisplay();
  }
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", initializePage);

// Clear entire cart
function clearCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    showToast("Cart is already empty", "info");
    return;
  }

  if (confirm("Are you sure you want to clear your entire cart?")) {
    localStorage.removeItem("cart");
    showToast("Cart cleared successfully", "success");
    updateCartDisplay();
    console.log("Entire cart cleared");
  }
}

// ✅ define cartItems globally
// 1️⃣ Get cart items from localStorage
const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

// 2️⃣ Start building cart HTML
let cartHTML = "";

// 3️⃣ Get container element in your HTML
const cartContainer = document.getElementById("cartContainer");
async function proceedToCheckout() {
  const popup = document.getElementById("checkoutPopup");
  const qrContainer = document.getElementById("qrcode");
  const amountElement = document.getElementById("checkoutAmount");

  //   let cartHTML = "";
  if (cartItems.length === 0) {
    showToast("Your cart is empty","info"); // or showToast() if you have it
    return;
  }

  const total = cartItems
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);
  amountElement.innerHTML = `<strong>Total: </strong>$${total}`;

  qrContainer.innerHTML = "";

  // Assuming you retrieved `merchantId`, `accountNumber`, `currency` etc from your backend/config
  const merchantId = "1494394";
  const account = "003 615 761";
  const currency = "USD"; // or "USD" depending
  const orderRef = "ORDER" + Date.now(); // unique reference
  const amount = total; // from your calculation

  try {
    const response = await fetch("/api/generate-qr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
        // "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ amount: parseFloat(total), orderRef }),
    });

    const data = await response.json();

    if (data.qrImage) {
      const img = document.createElement("img");
      img.src = data.qrImage; // this comes from your backend (ABA QR)
      img.alt = "ABA QR Code";
      img.style.width = "200px";
      img.style.height = "200px";
      qrContainer.appendChild(img);

      popup.style.display = "flex";
    } else {
      showToast("Failed to generate QR code. Please try again.", "warning");
      console.error(data);
    }
  } catch (err) {
    console.error("Error generating ABA QR:", err);
    showToast("An error occurred while generating QR code.", "warning");
  }
  cartHTML += amount;
}
function closeCheckout() {
  document.getElementById("checkoutPopup").style.display = "none";
}

document.addEventListener("click", function (e) {
  const popup = document.getElementById("checkoutPopup");
  if (popup && e.target === popup) {
    closeCheckout();
  }
});

cartContainer.innerHTML = cartHTML;
