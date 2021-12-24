Feature: Track Eye Movement

    This feature enables Example App to track an active user's eye movement when they use the application 

Scenario: Detect Eye Movement
    When User wears the smart glasses
    Then Example App detects the users eyes and logs the current position

Scenario: Track Eye Movement
    Given The User is already wearing the smart glasses
    When User looks through any reading material
    Then Example App tracks the user's eye movement based on the changes in the eye pupil position. 