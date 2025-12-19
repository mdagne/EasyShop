package org.yearup.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.yearup.data.ProductDao;
import org.yearup.data.ShoppingCartDao;
import org.yearup.data.UserDao;
import org.yearup.models.ShoppingCart;
import org.yearup.models.ShoppingCartItem;
import org.yearup.models.User;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.stream.Collectors;

// convert this class to a REST controller
// only logged in users should have access to these actions
@RestController
@RequestMapping("/cart")
@CrossOrigin
@PreAuthorize("isAuthenticated()")
public class ShoppingCartController {

    private final ShoppingCartDao shoppingCartDao;
    private final UserDao userDao;
    private final ProductDao productDao;

    public ShoppingCartController(ShoppingCartDao shoppingCartDao, UserDao userDao, ProductDao productDao) {
        this.shoppingCartDao = shoppingCartDao;
        this.userDao = userDao;
        this.productDao = productDao;
    }

    @GetMapping
    public ShoppingCart getCart(Principal principal) {
        try {
            String userName = principal.getName();
            User user = userDao.getByUserName(userName);
            int userId = user.getId();

            // Fetch the shopping cart items for the user as a List
            List<ShoppingCartItem> items = shoppingCartDao.getCartByUserId(userId);

            // Convert the list to a map for the ShoppingCart model
            Map<Integer, ShoppingCartItem> itemsMap = items.stream()
                    .collect(Collectors.toMap(ShoppingCartItem::getProductId, item -> item));

            // Create a ShoppingCart object and set the items
            ShoppingCart cart = new ShoppingCart();
            cart.setItems(itemsMap);

            // Log the cart for debugging
            System.out.println("Cart retrieved: " + cart);

            return cart;
        } catch (Exception e) {
            e.printStackTrace(); // Log the exception for debugging
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Oops... our bad.");
        }
    }

    // New helper endpoint that returns the cart as a plain List instead of a map
    // GET /cart/items
    @GetMapping("/items")
    public List<ShoppingCartItem> getCartItems(Principal principal) {
        try {
            String userName = principal.getName();
            User user = userDao.getByUserName(userName);
            int userId = user.getId();

            // Directly return the List of items for this user
            return shoppingCartDao.getCartByUserId(userId);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Oops... our bad.");
        }
    }

    // add a POST method to add a product to the cart - the url should be
    // https://localhost:8080/cart/products/15 (15 is the productId to be added
    @PostMapping("/products/{productId}")
    public ShoppingCart addProductToCart(@PathVariable int productId, Principal principal) {
        try {
            System.out.println("addProductToCart called with productId: " + productId);

            String userName = principal.getName();
            User user = userDao.getByUserName(userName);
            int userId = user.getId();

            System.out.println("User ID: " + userId);
            System.out.println("Product exists in cart: " + shoppingCartDao.existsInCart(userId, productId));

            // Check if the product is already in the cart
            if (shoppingCartDao.existsInCart(userId, productId)) {
                shoppingCartDao.incrementQuantity(userId, productId);
            } else {
                shoppingCartDao.addProductToCart(userId, productId, 1);
            }

            // Return updated cart
            return shoppingCartDao.getByUserId(userId);
        } catch (Exception e) {
            e.printStackTrace(); // Log the exception for debugging
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Oops... our bad.");
        }
    }

    // add a PUT method to update an existing product in the cart - the url should be
    // https://localhost:8080/cart/products/15 (15 is the productId to be updated)
    // the BODY should be a ShoppingCartItem - quantity is the only value that will be updated
    @PutMapping("/products/{productId}")
    public ShoppingCart updateProductInCart(@PathVariable int productId, @RequestBody Map<String, Integer> body, Principal principal) {
        try {
            String userName = principal.getName();
            User user = userDao.getByUserName(userName);
            int userId = user.getId();

            int quantity = body.get("quantity");
            // Only update if the product already exists in the user's cart
            if (shoppingCartDao.existsInCart(userId, productId)) {
                shoppingCartDao.updateQuantity(userId, productId, quantity);
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product not in cart");
            }

            return shoppingCartDao.getByUserId(userId);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Oops... our bad.");
        }
    }

    // add a DELETE method to clear all products from the current users cart
    // https://localhost:8080/cart
    @DeleteMapping
    public ShoppingCart clearCart(Principal principal) {
        try {
            String userName = principal.getName();
            User user = userDao.getByUserName(userName);
            int userId = user.getId();

            // Clear the shopping cart for the user
            shoppingCartDao.clearCart(userId);
            return shoppingCartDao.getByUserId(userId);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Oops... our bad.");
        }
    }

    // delete a single product from the current user's cart
    // https://localhost:8080/cart/products/{productId}
    @DeleteMapping("/products/{productId}")
    public ShoppingCart removeProductFromCart(@PathVariable int productId, Principal principal) {
        try {
            String userName = principal.getName();
            User user = userDao.getByUserName(userName);
            int userId = user.getId();

            shoppingCartDao.deleteItem(userId, productId);
            return shoppingCartDao.getByUserId(userId);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Oops... our bad.");
        }
    }
}
