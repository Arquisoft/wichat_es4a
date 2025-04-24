Feature: Change user password functionality

Scenario: User successfully changes their password
  Given A user logged in
  When They fill in the change password form and submit it
  Then A confirmation modal should be shown
  And The password should be updated for their account