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

import { CommandRespondable, Execute, Respond, ResponseMessage } from "@atomist/rug/operations/Handlers";
import { CommandHandlerScenarioWorld, Given, Then, When } from "@atomist/rug/test/handler/Core";

Given("nothing", w => { return; });

const testOwner = "uncle";
const testRepo = "tupelo";
const testBuildId = "1992031620";

When("RestartBuild is invoked", (w: CommandHandlerScenarioWorld) => {
    const handler = w.commandHandler("RestartBuild");
    w.invokeHandler(handler, {
        owner: testOwner,
        repo: testRepo,
        buildId: testBuildId,
    });
});

Then("there is an instruction", (w: CommandHandlerScenarioWorld) => {
    return w.plan().instructions.length === 1;
});

/* tslint:disable:no-string-literal */
Then("the instruction executes travis-restart-build", (w: CommandHandlerScenarioWorld) => {
    const instruction = w.plan().instructions[0].instruction as Execute;
    const param = instruction.parameters as any;
    return instruction.kind === "execute"
        && instruction.name === "travis-restart-build"
        && param.owner === "uncle"
        && param.repo === "tupelo"
        && param.buildId === "1992031620";
});
