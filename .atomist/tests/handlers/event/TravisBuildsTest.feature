# Copyright © 2017 Atomist, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

Feature: Provide lifecycle message updates for Travis CI build events
  Respond to Travis CI builds, updating lifecycle messages with build
  status.


  Scenario: Update lifecycle message for successful build
    Given TravisBuilds handler
    When a successful build event is received
    Then a lifecycle message with release button is planned


  Scenario: Update lifecycle message and DM for failed build
    Given TravisBuilds handler
    When a failed build event with ChatId is received
    Then a lifecycle message with restart button is planned
    Then a DM to committer is planned


  Scenario: Update lifecycle message for failed build
    Given TravisBuilds handler
    When a failed build event is received
    Then a lifecycle message with restart button is planned
    Then no DM to committer is planned
