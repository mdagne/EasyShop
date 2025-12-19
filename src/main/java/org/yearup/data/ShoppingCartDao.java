package org.yearup.data;

import org.yearup.models.ShoppingCart;
import org.yearup.models.ShoppingCartItem;

import java.util.List;

public interface ShoppingCartDao
{
    ShoppingCart getByUserId(int userId);

    // Retrieve all items in the shopping cart
    List<ShoppingCartItem> getCartItems();

    // Retrieve all items in the shopping cart for a user
    List<ShoppingCartItem> getCartByUserId(int userId);

    // Check if a product exists in the user's cart
    boolean existsInCart(int userId, int productId);

    // Increment the quantity of a product in the user's cart
    void incrementQuantity(int userId, int productId);

    // Add a product to the user's cart
    void addProductToCart(int userId, int productId, int quantity);

    // Update the quantity of a product in the user's cart
    void updateQuantity(int userId, int productId, int quantity);

    // Clear all items from the user's cart
    void clearCart(int userId);

    // Delete a single product from the user's cart
    void deleteItem(int userId, int productId);
}
