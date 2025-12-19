let cartService;

class ShoppingCartService {

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
                this.setCart(response.data)

                this.updateCartDisplay()

            })
            .catch(error => {

                const data = {
                    error: "Add to cart failed."
                };

                templateBuilder.append("error", data, "errors")
            })
    }

    setCart(data)
    {
        this.cart = {
            items: [],
            total: 0
        }

        this.cart.total = data.total;

        for (const [key, value] of Object.entries(data.items)) {
            this.cart.items.push(value);
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
        // templateBuilder.build("cart", this.cart, "main");

        const main = document.getElementById("main")
        main.innerHTML = "";

        let div = document.createElement("div");
        div.classList="filter-box";
        main.appendChild(div);

        const contentDiv = document.createElement("div")
        contentDiv.id = "content";
        contentDiv.classList.add("content-form");

        const cartHeader = document.createElement("div")
        cartHeader.classList.add("cart-header")

        const h1 = document.createElement("h1")
        h1.innerText = "Cart";
        cartHeader.appendChild(h1);

        const button = document.createElement("button");
        button.classList.add("btn")
        button.classList.add("btn-danger")
        button.innerText = "Clear";
        button.addEventListener("click", () => this.clearCart());
        cartHeader.appendChild(button)

        contentDiv.appendChild(cartHeader)
        main.appendChild(contentDiv);

        // Display empty cart message if no items
        if (this.cart.items.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.style.textAlign = "center";
            emptyMessage.style.padding = "40px";
            emptyMessage.style.color = "#666";
            emptyMessage.innerHTML = "<h3>Your cart is empty</h3><p>Add some items to get started!</p>";
            contentDiv.appendChild(emptyMessage);
        } else {
            // let parent = document.getElementById("cart-item-list");
            this.cart.items.forEach(item => {
                this.buildItem(item, contentDiv)
            });
        }

        // Add cart summary with total and checkout button
        const cartSummary = document.createElement("div");
        cartSummary.classList.add("cart-summary");
        cartSummary.style.marginTop = "20px";
        cartSummary.style.padding = "20px";
        cartSummary.style.borderTop = "2px solid #ddd";
        cartSummary.style.display = "flex";
        cartSummary.style.justifyContent = "space-between";
        cartSummary.style.alignItems = "center";

        const totalDiv = document.createElement("div");
        const totalLabel = document.createElement("h3");
        totalLabel.style.margin = "0";
        totalLabel.innerText = "Total: ";
        const totalAmount = document.createElement("span");
        totalAmount.style.color = "#28a745";
        totalAmount.style.fontSize = "1.5em";
        totalAmount.style.fontWeight = "bold";
        totalAmount.innerText = `$${parseFloat(this.cart.total).toFixed(2)}`;
        totalLabel.appendChild(totalAmount);
        totalDiv.appendChild(totalLabel);

        const checkoutButton = document.createElement("button");
        checkoutButton.classList.add("btn");
        checkoutButton.classList.add("btn-success");
        checkoutButton.style.padding = "10px 30px";
        checkoutButton.style.fontSize = "1.1em";
        checkoutButton.innerText = "Checkout";
        checkoutButton.disabled = this.cart.items.length === 0;
        if (checkoutButton.disabled) {
            checkoutButton.style.opacity = "0.6";
            checkoutButton.style.cursor = "not-allowed";
        }
        checkoutButton.addEventListener("click", () => this.checkout());

        cartSummary.appendChild(totalDiv);
        cartSummary.appendChild(checkoutButton);
        contentDiv.appendChild(cartSummary);
    }

    buildItem(item, parent)
    {
        let outerDiv = document.createElement("div");
        outerDiv.classList.add("cart-item");

        let div = document.createElement("div");
        outerDiv.appendChild(div);
        let h4 = document.createElement("h4")
        h4.innerText = item.product.name;
        div.appendChild(h4);

        let photoDiv = document.createElement("div");
        photoDiv.classList.add("photo")
        let img = document.createElement("img");
        // Use relative path like product template, with fallback to no-image.jpg
        const imageUrl = item.product.imageUrl || "no-image.jpg";
        img.src = `images/products/${imageUrl}`
        img.alt = item.product.name
        img.onerror = function() {
            // If image fails to load, use the no-image fallback
            this.src = "images/products/no-image.jpg";
        }
        img.addEventListener("click", () => {
            showImageDetailForm(item.product.name, `/images/products/${imageUrl}`)
        })
        photoDiv.appendChild(img)
        let priceH4 = document.createElement("h4");
        priceH4.classList.add("price");
        priceH4.innerText = `$${item.product.price}`;
        photoDiv.appendChild(priceH4);
        outerDiv.appendChild(photoDiv);

        let descriptionDiv = document.createElement("div");
        descriptionDiv.innerText = item.product.description;
        outerDiv.appendChild(descriptionDiv);

        let quantityDiv = document.createElement("div")
        quantityDiv.innerText = `Quantity: ${item.quantity}`;
        outerDiv.appendChild(quantityDiv)


        parent.appendChild(outerDiv);
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
            // Sum up the quantities of all items, not just count the number of different items
            const itemCount = this.cart.items.reduce((total, item) => total + item.quantity, 0);
            const cartControl = document.getElementById("cart-items")

            cartControl.innerText = itemCount;
        }
        catch (e) {

        }
    }

    checkout()
    {
        if (this.cart.items.length === 0)
        {
            const data = {
                error: "Your cart is empty. Please add items before checkout."
            };
            templateBuilder.append("error", data, "errors");
            return;
        }

        // For now, just show an alert. You can implement actual checkout logic later
        alert(`Proceeding to checkout with total: $${parseFloat(this.cart.total).toFixed(2)}\n\nThis is a placeholder. Implement checkout functionality as needed.`);
        

        // This could redirect to a checkout page, create an order, etc.
    }
}





document.addEventListener('DOMContentLoaded', () => {
    cartService = new ShoppingCartService();

    if(userService.isLoggedIn())
    {
        cartService.loadCart();
    }

});
