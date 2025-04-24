Feature: Login functionality

Scenario: The user logs in successfully
Given A registered user with valid credentials
When I fill the login form and submit it
Then I should be redirected to the homepage

Scenario: The user logs in with invalid credentials
Given A user with invalid credentials
When I fill the login form and submit it
Then An error message should appear indicating invalid credentials

Scenario: The user attempts to log in more than 5 times with incorrect credentials and is told to try again later
Given A user who attempts to log in more than 5 times with incorrect credentials
When I attempt to log in with invalid credentials more than 5 times
Then A security message should appear saying to try again later
