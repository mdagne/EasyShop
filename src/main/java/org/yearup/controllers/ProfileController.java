package org.yearup.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.yearup.data.ProfileDao;
import org.yearup.data.UserDao;
import org.yearup.models.Profile;
import org.yearup.models.User;

import java.security.Principal;

@RestController
@RequestMapping("/profile")
@CrossOrigin
@PreAuthorize("isAuthenticated()")
public class ProfileController
{
    private ProfileDao profileDao;
    private UserDao userDao;

    @Autowired
    public ProfileController(ProfileDao profileDao, UserDao userDao)
    {
        this.profileDao = profileDao;
        this.userDao = userDao;
    }

    @GetMapping
    public Profile getProfile(Principal principal)
    {
        try
        {
            // Get the currently logged in username
            String userName = principal.getName();
            // Find database user by username
            User user = userDao.getByUserName(userName);
            int userId = user.getId();

            // Get the profile for this user
            Profile profile = profileDao.getByUserId(userId);

            if (profile == null)
            {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found.");
            }

            return profile;
        }
        catch (ResponseStatusException e)
        {
            throw e;
        }
        catch (Exception e)
        {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Oops... our bad.");
        }
    }

    @PutMapping
    public Profile updateProfile(@RequestBody Profile profile, Principal principal)
    {
        try
        {
            // Get the currently logged in username
            String userName = principal.getName();
            // Find database user by username
            User user = userDao.getByUserName(userName);
            int userId = user.getId();

            // Ensure the profile userId matches the authenticated user
            profile.setUserId(userId);

            // Update the profile
            profileDao.update(userId, profile);

            // Return the updated profile
            return profileDao.getByUserId(userId);
        }
        catch (Exception e)
        {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Oops... our bad.");
        }
    }
}

