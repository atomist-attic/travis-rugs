Feature: TravisBuildRug handler builds a Rug archive on Travis
  The TravisBuildRug should accept its needed parameters and
  start a build of an arbitrary Rug project into an archive on
  Travis CI

  Scenario: TravisBuildRug receives proper parameters
    Given nothing
    When the TravisBuildRug is invoked
    Then the plan contains a starting message
    Then the plan contains a call to the Travis build function
