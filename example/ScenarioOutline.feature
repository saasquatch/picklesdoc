Feature: Mobile App Configuration

    Background: A new mobile app called App would be configured to accept new settings and customization
    Scenario Outline: Settings Configuration
        Given A user downloads the App on a mobile device
        When A user logs into the App or creates an account
        Then A user can see profile settings

        Examples:
            | Log in | Create Account | Display   |
            | Yes    | Yes            | Settings  |
            | No     | No             | No        |