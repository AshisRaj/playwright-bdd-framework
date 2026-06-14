Feature: GraphQL examples

  Scenario: GraphQL query example
    When I query country code "US"
    Then the last graphql country code should be "US"
    And the last graphql country name should be "United States"

  Scenario: GraphQL mutation create resource
    When I create a test post with title "GraphQL Create Example" and body "This is a new GraphQL post created by test."
    Then the created post id is saved as "postId"

  Scenario: GraphQL mutation update resource
    When I create a test post with title "GraphQL Update Example" and body "Original body for update test."
    And I update the post with saved id with title "Updated title" and body "Updated body content."
    Then the created post id is saved as "postId"

  Scenario: GraphQL mutation delete resource
    When I create a test post with title "GraphQL Delete Example" and body "Body content for delete test."
    And I delete the post with saved id
    Then querying the post by saved id returns no post
