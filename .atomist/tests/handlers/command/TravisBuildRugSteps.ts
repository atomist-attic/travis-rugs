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

import { CommandRespondable, Execute, ResponseMessage } from "@atomist/rug/operations/Handlers";
import { CommandHandlerScenarioWorld, Given, Then, When } from "@atomist/rug/test/handler/Core";

Given("nothing", (f) => { return; });

const owner = "atomist-test";
const repo = "rug-repo";

When("the TravisBuildRug is invoked", (w: CommandHandlerScenarioWorld) => {
    const handler = w.commandHandler("TravisBuildRug");
    const handlerParameters = {
        owner,
        repo,
        version: "1.2.3",
        teamId: "TK421WAYAYP",
        gitRef: "master",
        travisToken: "not0a0valid0travis0token",
        mavenBaseUrl: "https://atomust.jtoad.io/atomust",
        mavenUser: "maven-writer",
        mavenToken: "not0a0real0maven0token",
        userToken: "not0a0valid0github0token",
    };
    w.invokeHandler(handler, handlerParameters);
});

Then("the plan contains a starting message", (w: CommandHandlerScenarioWorld) => {
    const expected = `Starting Travis CI build for Rug project ${owner}/${repo}`;
    const message = (w.plan().messages[0] as ResponseMessage).body;
    return message === expected;
});

Then("the plan contains a call to the Travis build function", (w: CommandHandlerScenarioWorld) => {
    const respondable = w.plan().instructions[0] as CommandRespondable<Execute>;
    const instruction = respondable.instruction as Execute;
    const name = instruction.name as string;
    return name === "travis-build-rug";
});
