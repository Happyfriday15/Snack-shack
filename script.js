const categoryLinks = document.querySelectorAll('.category-link');
const categories = document.querySelectorAll('.menu-category');

const todayDate = document.querySelector('#today-date');
const dateText = new Intl.DateTimeFormat('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
}).format(new Date()).replace(', ', ' · ');
todayDate.textContent = dateText;

categoryLinks.forEach((link) => {
  link.addEventListener('click', () => {
    categoryLinks.forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
  });
});

const observer = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  categoryLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${visible.target.id}`));
}, { rootMargin: '-18% 0px -65% 0px', threshold: [0, 0.25, 0.75] });

categories.forEach((category) => observer.observe(category));

const cart = [];
const cartToggle = document.querySelector('#cart-toggle');
const cartClose = document.querySelector('#cart-close');
const cartPanel = document.querySelector('#cart-panel');
const cartBackdrop = document.querySelector('#cart-backdrop');
const cartItems = document.querySelector('#cart-items');
const cartSummary = document.querySelector('#cart-summary');
const cartCount = document.querySelector('#cart-count');
const cartTotal = document.querySelector('#cart-total');
const checkoutForm = document.querySelector('#checkout-form');
const confirmation = document.querySelector('#order-confirmation');
const confirmationCopy = document.querySelector('#confirmation-copy');

function openCart() {
  cartPanel.hidden = false;
  cartBackdrop.hidden = false;
  cartPanel.setAttribute('aria-hidden', 'false');
  cartToggle.setAttribute('aria-expanded', 'true');
}

function closeCart() {
  cartPanel.hidden = true;
  cartBackdrop.hidden = true;
  cartPanel.setAttribute('aria-hidden', 'true');
  cartToggle.setAttribute('aria-expanded', 'false');
}

function addToCart(card) {
  const name = card.dataset.name;
  const price = Number(card.dataset.price);
  const existing = cart.find((item) => item.name === name);
  if (existing) existing.quantity += 1;
  else cart.push({ name, price, quantity: 1 });
  renderCart();
  openCart();
}

function renderCart() {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCount.textContent = itemCount;
  cartTotal.textContent = `$${total.toFixed(2)}`;
  cartSummary.hidden = cart.length === 0;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.<br />Tap “Add to cart” on anything you want.</p>';
    return;
  }

  cartItems.innerHTML = cart.map((item) => `
    <div class="cart-line">
      <div><h3>${item.name}</h3><p>$${item.price.toFixed(2)} each</p></div>
      <div class="quantity-controls">
        <button type="button" data-action="decrease" data-name="${item.name}" aria-label="Remove one ${item.name}">−</button>
        <span>${item.quantity}</span>
        <button type="button" data-action="increase" data-name="${item.name}" aria-label="Add one ${item.name}">+</button>
      </div>
    </div>`).join('');
}

document.querySelectorAll('.menu-card').forEach((card) => {
  card.addEventListener('click', (event) => {
    if (!event.target.closest('button')) addToCart(card);
  });
  card.querySelector('.add-button').addEventListener('click', () => addToCart(card));
});

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const item = cart.find((entry) => entry.name === button.dataset.name);
  if (!item) return;
  if (button.dataset.action === 'increase') item.quantity += 1;
  if (button.dataset.action === 'decrease') item.quantity -= 1;
  if (item.quantity <= 0) cart.splice(cart.indexOf(item), 1);
  renderCart();
});

cartToggle.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartBackdrop.addEventListener('click', closeCart);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !cartPanel.hidden) closeCart();
});

checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = new FormData(checkoutForm).get('studentName').trim();
  if (!name) return;
  confirmationCopy.textContent = `Thanks, ${name}! We’ll have your order ready at Room L110 during the 12:15–12:45 PM pickup window.`;
  cartSummary.hidden = true;
  cartItems.hidden = true;
  confirmation.hidden = false;
  cart.length = 0;
  cartCount.textContent = '0';
});

document.querySelector('#new-order').addEventListener('click', () => {
  confirmation.hidden = true;
  cartItems.hidden = false;
  checkoutForm.reset();
  renderCart();
});

renderCart();
