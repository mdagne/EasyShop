package org.yearup.data;

import org.springframework.stereotype.Component;
import org.yearup.models.Category;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
public class MySqlCategoriesDao implements CategoryDao {

    private final DataSource dataSource;

    public MySqlCategoriesDao(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public List<Category> getAllCategories() {
        String query = "SELECT * FROM categories";
        List<Category> categories = new ArrayList<>();

        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                categories.add(mapRowToCategory(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving categories", e);
        }

        return categories;
    }

    @Override
    public Category getById(int categoryId) {
        String query = "SELECT * FROM categories WHERE category_id = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, categoryId);
            ResultSet resultSet = statement.executeQuery();

            if (resultSet.next()) {
                return mapRowToCategory(resultSet);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving category by ID", e);
        }

        return null;
    }

    @Override
    public Category create(Category category) {
        String query = "INSERT INTO categories (name, description) VALUES (?, ?)";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query, PreparedStatement.RETURN_GENERATED_KEYS)) {

            statement.setString(1, category.getName());
            statement.setString(2, category.getDescription());
            statement.executeUpdate();

            ResultSet keys = statement.getGeneratedKeys();
            if (keys.next()) {
                category.setCategoryId(keys.getInt(1));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error creating category", e);
        }

        return category;
    }

    @Override
    public void update(int categoryId, Category category) {
        String query = "UPDATE categories SET name = ?, description = ? WHERE category_id = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setString(1, category.getName());
            statement.setString(2, category.getDescription());
            statement.setInt(3, categoryId);
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating category", e);
        }
    }

    @Override
    public void delete(int categoryId) {
        String query = "DELETE FROM categories WHERE category_id = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, categoryId);
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting category", e);
        }
    }

    private Category mapRowToCategory(ResultSet resultSet) throws SQLException {
        return new Category(
                resultSet.getInt("category_id"),
                resultSet.getString("name"),
                resultSet.getString("description")
        );
    }
}