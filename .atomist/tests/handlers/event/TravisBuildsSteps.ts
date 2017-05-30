/*
 * Copyright © 2017 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DirectedMessage, LifecycleMessage } from "@atomist/rug/operations/Handlers";
import { EventHandlerScenarioWorld, Then, When } from "@atomist/rug/test/handler/Core";

import * as stub from "@atomist/cortex/stub/Types";

const testSha = "1966may16";
const testBuildId = "3557";
const testBuildUrl = "https://en.wikipedia.org/wiki/Pet_Sounds";
const testScreenName = "pet";
const testTag = "sounds";
const testRepo = "beach";
const testOwner = "boys";
const testChannel = "wouldnt-it-be-nice";

const testCID = `commit_event/${testOwner}/${testRepo}/${testSha}`;

When("a successful build event is received", (w: EventHandlerScenarioWorld) => {
    const event = build(null).withStatus("passed");
    w.sendEvent(event);
});

When("a failed build event with ChatId is received", (w: EventHandlerScenarioWorld) => {
    const person = new stub.Person().withChatId(new stub.ChatId().withScreenName(testScreenName));
    const event = build(person).withStatus("failed");
    w.sendEvent(event);
});

When("a failed build event is received", (w: EventHandlerScenarioWorld) => {
    const event = build(null).withStatus("failed");
    w.sendEvent(event);
});

Then("a lifecycle message with release button is planned", (w: EventHandlerScenarioWorld) => {
    const message = w.plan().messages[0] as LifecycleMessage;
    return w.plan().messages.length === 1
        && message.lifecycleId === testCID
        && message.instructions.length === 1
        && message.instructions[0].label === "Release";
});

Then("a lifecycle message with restart button is planned", (w: EventHandlerScenarioWorld) => {
    const mLength = w.plan().messages.length;
    const message = w.plan().messages[mLength - 1] as LifecycleMessage;
    return message.lifecycleId === testCID
        && message.instructions.length === 1
        && message.instructions[0].label === "Restart";
});

Then("a DM to committer is planned", (w: EventHandlerScenarioWorld) => {
    const message = w.plan().messages[0] as DirectedMessage;
    const expected = `Travis CI build \`#${testBuildId}\` of \`${testOwner}/${testRepo}\` failed after` +
        ` your last commit \`${testSha}\`: ${testBuildUrl}`;
    return message.body === expected;
});

Then("no DM to committer is planned", (w: EventHandlerScenarioWorld) => {
    const message = w.plan().messages[0] as LifecycleMessage;
    return w.plan().messages.length === 1
        && message.lifecycleId === testCID;
});

function build(person: stub.Person): stub.Build {
    const commit = new stub.Commit().withSha(testSha)
        .withAuthor(new stub.GitHubId().withPerson(person))
        .addTags(new stub.Tag().withName(testTag));
    const repo = new stub.Repo().withName(testRepo).withOwner(testOwner)
        .addChannels(new stub.ChatChannel().withName(testChannel));
    const event = new stub.Build().withProvider("travis").withId("19650712").withName(testBuildId)
        .withBuildUrl(testBuildUrl)
        .withCommit(commit)
        .withRepo(repo)
        .withPush(new stub.Push().addCommits(commit).withRepo(repo));
    return event;
}
