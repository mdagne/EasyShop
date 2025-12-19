let cartService;

class ShoppingCartService {

    constructor() {
        console.log("ShoppingCartService loaded (with cart fixes).");
    }

    cart = {
        items:[],
        total:0
    };

    addToCart(productId)
    {
        const url = `${config.baseUrl}/cart/products/${productId}`;
        const headers = userService.getHeaders();

        axios.post(url, {}, {headers})
            .then(response => {
                console.log("AddToCart response:", response.data);
                this.setCart(response.data)

                this.updateCartDisplay()
                // If cart page is open, refresh it
               // this.loadCartPage()

                // Fallback: reload cart from server to ensure consistency
             //   this.loadCart()

            })
            .catch(error => {
                console.error("AddToCart error:", error?.response || error);
                const data = { error: "Add to cart failed." };
                templateBuilder.append("error", data, "errors")
            })
    }

    updateItemQuantity(productId, quantity)
    {
        // Do not allow less than 1
        const newQty = Math.max(1, parseInt(quantity || 1));
        const url = `${config.baseUrl}/cart/products/${productId}`;
        const headers = userService.getHeaders();

        axios.put(url, { quantity: newQty }, {headers})
            .then(response => {
                this.setCart(response.data)
                this.updateCartDisplay()
                this.loadCartPage()
            })
            .catch(error => {
                const data = { error: "Update quantity failed." };
                templateBuilder.append("error", data, "errors")
            })
    }

    setCart(data)
    {
        // Reset local cart
//        this.cart = {
//            items: [],
//            total: 0
//        };

        if (!data) return;

        // If the API returns a ShoppingCart object { items: {...}, total: number }
        if (data.items) {
            this.cart.total = Number(data.total || 0);
            this.cart.items = data.items;
//            Object.values(data.items).forEach(item => {
//                this.cart.items.push(item);
//            });
            return;
        }


    }

    loadCart()
    {

        const url = `${config.baseUrl}/cart`;
        const headers = userService.getHeaders();

        axios.get(url, {headers})
            .then(response => {
                this.setCart(response.data)

                this.updateCartDisplay()

            })
            .catch(error => {

                const data = {
                    error: "Load cart failed."
                };

                templateBuilder.append("error", data, "errors")
            })

    }

    loadCartPage()
    {
        // Build cart template and populate its list container
        //templateBuilder.build("cart", this.cart, "main");



        const contentDiv = document.getElementById("content");
        contentDiv.innerHTML = "";

        const main = document.getElementById("main");
        main.innerHTML = "";

        let listParent = document.getElementById("cart-item-list");
        if(!listParent){
            listParent = document.createElement("div");
            listParent.id = "cart-item-list";
            contentDiv.appendChild(listParent);
        }
        listParent.innerHTML = "";

        // Update cart meta (items count and total)
        const itemsCount = this.cart.items.length;
        const total = Number(this.cart.total || 0).toFixed(2);
        const countEl = document.getElementById("cart-items-count");
        const totalEl = document.getElementById("cart-total");
        if(countEl) countEl.innerText = itemsCount;
        if(totalEl) totalEl.innerText = total;

        // Inject Proceed to Checkout into existing header
        const cartHeader = contentDiv.querySelector(".cart-header");
        if(cartHeader){
            const checkoutBtn = document.createElement("button");
            checkoutBtn.classList.add("btn","btn-primary");
            checkoutBtn.style.marginLeft = "8px";
            checkoutBtn.innerText = "Proceed to Checkout";
            checkoutBtn.addEventListener("click", () => showCheckout());
            cartHeader.appendChild(checkoutBtn);
        }

        console.log("Rendering cart items:", this.cart.items?.length || 0);
        console.log(this.cart)
        Object.values(this.cart.items).forEach((item, idx) => {
            try {
                this.buildItem(item, listParent)
            } catch (err) {
                console.error("Failed to render cart item", idx, item, err);
            }
        });

        // Order Summary
        const summary = document.createElement("div");
        summary.classList.add("cart-summary");

        // already computed above

        const h3 = document.createElement("h3");
        h3.innerText = "Order Summary";
        summary.appendChild(h3);

        const pItems = document.createElement("p");
        pItems.innerText = `Items: ${itemsCount}`;
        summary.appendChild(pItems);

        const pTotal = document.createElement("p");
        pTotal.innerText = `Total: $${total}`;
        summary.appendChild(pTotal);

        contentDiv.appendChild(summary);

        // Checkout items: thumbnails with name and quantity
        const checkout = document.createElement("div");
        checkout.classList.add("checkout-items");

        const ch = document.createElement("h3");
        ch.innerText = "Checkout Items";
        checkout.appendChild(ch);

        const grid = document.createElement("div");
        grid.classList.add("checkout-grid");

        Object.values(this.cart.items).forEach(it => {
            const cell = document.createElement("div");
            cell.classList.add("checkout-item");

            const thumb = document.createElement("img");
            thumb.src = `images/products/${it.product.imageUrl}`;
            thumb.alt = it.product.name;

            const cap = document.createElement("div");
            cap.classList.add("checkout-caption");
            cap.innerText = `${it.product.name} × ${it.quantity}`;

            cell.appendChild(thumb);
            cell.appendChild(cap);
            grid.appendChild(cell);
        });

        checkout.appendChild(grid);
        contentDiv.appendChild(checkout);
        main.appendChild(contentDiv);
    }

    buildItem(item, parent)
    {
        if (!item || !item.product) {
            console.warn("Skipping invalid cart item", item);
            return;
        }

        const outerDiv = document.createElement("div");
        outerDiv.classList.add("cart-item");

        // Product name
        const nameDiv = document.createElement("div");
        const h4 = document.createElement("h4");
        h4.innerText = item.product.name;
        nameDiv.appendChild(h4);
        outerDiv.appendChild(nameDiv);

        // Photo + price
        const photoDiv = document.createElement("div");
        photoDiv.classList.add("photo");
        const img = document.createElement("img");
        img.src = `images/products/${item.product.imageUrl}`;
        img.alt = item.product.name;
        img.addEventListener("click", () => {
            showImageDetailForm(item.product.name, img.src);
        });
        photoDiv.appendChild(img);

        const priceH4 = document.createElement("h4");
        priceH4.classList.add("price");
        priceH4.innerText = `$${item.product.price}`;
        photoDiv.appendChild(priceH4);
        outerDiv.appendChild(photoDiv);

        // Quantity controls
        const quantityDiv = document.createElement("div");
        quantityDiv.classList.add("quantity-controls");

        const decBtn = document.createElement("button");
        decBtn.classList.add("btn", "btn-light");
        decBtn.innerText = "-";
        decBtn.addEventListener("click", () =>
            this.updateItemQuantity(item.product.productId, (item.quantity || 1) - 1)
        );

        const qtyInput = document.createElement("input");
        qtyInput.type = "number";
        qtyInput.min = "1";
        qtyInput.value = item.quantity || 1;
        qtyInput.addEventListener("change", (e) =>
            this.updateItemQuantity(item.product.productId, e.target.value)
        );
        qtyInput.style.width = "60px";
        qtyInput.style.margin = "0 8px";

        const incBtn = document.createElement("button");
        incBtn.classList.add("btn", "btn-light");
        incBtn.innerText = "+";
        incBtn.addEventListener("click", () =>
            this.updateItemQuantity(item.product.productId, (item.quantity || 1) + 1)
        );

        quantityDiv.appendChild(decBtn);
        quantityDiv.appendChild(qtyInput);
        quantityDiv.appendChild(incBtn);
        outerDiv.appendChild(quantityDiv);

        // Line total + remove button
        const lineTotalDiv = document.createElement("div");
        const unitPrice = Number(item.product.price || 0);
        const qty = Number(item.quantity || 1);
        const lineTotal = Number(item.lineTotal || (unitPrice * qty)).toFixed(2);
        lineTotalDiv.classList.add("line-total");
        lineTotalDiv.innerText = `Line Total: $${lineTotal}`;

        const removeBtn = document.createElement("button");
        removeBtn.classList.add("btn", "btn-danger");
        removeBtn.style.marginLeft = "12px";
        removeBtn.innerText = "Remove";
        removeBtn.addEventListener("click", () =>
            this.removeItem(item.product.productId)
        );

        lineTotalDiv.appendChild(removeBtn);
        outerDiv.appendChild(lineTotalDiv);

        parent.appendChild(outerDiv);
    }

    removeItem(productId)
    {
        const url = `${config.baseUrl}/cart/products/${productId}`;
        const headers = userService.getHeaders();

        axios.delete(url, {headers})
            .then(response => {
                this.setCart(response.data);
                this.updateCartDisplay();
                this.loadCartPage();
            })
            .catch(error => {
                const data = { error: "Remove item failed." };
                templateBuilder.append("error", data, "errors");
            });
    }

    clearCart()
    {

        const url = `${config.baseUrl}/cart`;
        const headers = userService.getHeaders();

        axios.delete(url, {headers})
             .then(response => {
                 this.cart = {
                     items: [],
                     total: 0
                 }

                 this.cart.total = response.data.total;

                 for (const [key, value] of Object.entries(response.data.items)) {
                     this.cart.items.push(value);
                 }

                 this.updateCartDisplay()
                 this.loadCartPage()

             })
             .catch(error => {

                 const data = {
                     error: "Empty cart failed."
                 };

                 templateBuilder.append("error", data, "errors")
             })
    }

    updateCartDisplay()
    {
        try {
            // Show total quantity across all items
            const itemCount = Object.keys(this.cart.items).length;
            const cartControl = document.getElementById("cart-items");

            if (cartControl) {
                cartControl.innerText = itemCount;
            }
        }
        catch (e) {
            console.error("Failed to update cart display", e);
        }
    }
    }
document.addEventListener('DOMContentLoaded', () => {
    cartService = new ShoppingCartService();

    if (userService && userService.isLoggedIn && userService.isLoggedIn()) {
        cartService.loadCart();
    }
});
