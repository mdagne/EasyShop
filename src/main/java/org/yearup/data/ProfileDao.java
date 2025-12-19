package org.yearup.data;


import org.yearup.models.Profile;

public interface ProfileDao
{
    Profile create(Profile profile);

    // Retrieve a profile by user ID
    Profile getByUserId(int userId);

    // Update an existing profile
    void update(Profile profile);
}
