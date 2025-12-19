package org.yearup.data.mysql;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.yearup.models.Product;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class MySqlProductDaoTest extends BaseDaoTestClass {
    private MySqlProductDao dao;

    @BeforeEach
    public void setup() {
        dao = new MySqlProductDao(dataSource);
    }

    @Test
    public void getById_shouldReturn_theCorrectProduct() {
        // Arrange
        int productId = 1;
        Product expected = new Product(
                productId,
                "Smartphone",
                new BigDecimal("499.99"),
                1,
                "A powerful and feature-rich smartphone for all your communication needs.",
                "Black",
                50,
                false,
                "smartphone.jpg"
        );

        // Act
        Product actual = dao.getById(productId);

        // Assert
        assertNotNull(actual, "Product should not be null");
        assertEquals(expected.getName(), actual.getName());
        assertEquals(expected.getPrice(), actual.getPrice());
        assertEquals(expected.getDescription(), actual.getDescription());
    }
}