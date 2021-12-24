Feature: Overdue tasks
  Let users know when tasks are overdue, even when using other
  features of the app

  Background: A new mobile app called App would be configured to accept new settings and customization
    Scenario Outline: Settings Configuration
        Given A user downloads the App on a mobile device
        When A user logs into the App or creates an account
        Then A user can see profile settings

        Examples:
            | Log in | Create Account | Display   |
            | Yes    | Yes            | Settings  |
            | No     | No             | No        |  
  
  Rule: Users are notified about overdue tasks on first use of the day
    Background: Users are ....
      Given I have overdue tasks

    Example: First use of the day
      Given I last used the app yesterday
      When I use the app
      Then I am notified about overdue tasks
      
    Example: Already used today
      Given I last used the app earlier today
      When I use the app
      Then I am not notified about overdue tasks
