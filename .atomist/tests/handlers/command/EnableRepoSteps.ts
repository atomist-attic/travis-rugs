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

Given("nothing", (w) => { return; });

const testOwner = "uncle";
const testRepo = "tupelo";

When("the EnableRepo is invoked", (w: CommandHandlerScenarioWorld) => {
    const handler = w.commandHandler("EnableRepo");
    w.invokeHandler(handler, {
        org: ".org",
        owner: testOwner,
        repo: testRepo,
    });
});

When("the EnableRepo is invoked with a bad parameter", (w: CommandHandlerScenarioWorld) => {
    const handler = w.commandHandler("EnableRepo");
    w.invokeHandler(handler, {
        org: ".not",
        owner: testOwner,
        repo: testRepo,
    });
});

Then("a message is sent", (w: CommandHandlerScenarioWorld) => {
    return w.plan().messages.length === 1;
});

Then("there is an instruction", (w: CommandHandlerScenarioWorld) => {
    return w.plan().instructions.length === 1;
});
