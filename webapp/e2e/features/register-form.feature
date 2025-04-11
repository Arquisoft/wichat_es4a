Feature: Registering a new user

Scenario: The user is not registered in the site
  Given An unregistered user
  When I fill the registration form and submit it
  Then A success message should appear

Scenario: The user is not registered but the password is invalid
  Given An unregistered user with an invalid password
  When I fill the registration form and submit it
  Then An error message about password content should appear

Scenario: The user is not registered, the password is valid but they don't match
  Given An unregistered user with valid but mismatching passwords
  When I fill the registration form and submit it
  Then An error message about password mismatch should appear

Scenario: The user tries to register with an existing username
  Given A user that is already registered
  When I fill the registration form with the same username and submit it
  Then An error message about existing username should appear