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

import { repoToggle } from "../handlers/command/RepoToggle";

import "mocha";
import assert = require("power-assert");

describe("repoToggle", () => {

    function checkPlan(enable: boolean) {
        const enabled = ((enable) ? "en" : "dis") + "abled";
        const enabling = ((enable) ? "En" : "Dis") + "abling";
        const fn = "travis-" + ((enable) ? "en" : "dis") + "able-repo";

        const org = ".com";
        const repo = "double-nickels-on-the-dime";
        const owner = "minutemen";
        const plan = repoToggle(enable, org, repo, owner);

        assert(plan.messages.length === 1);
        assert(plan.messages[0].kind === "response");
        const msg = plan.messages[0] as ResponseMessage;
        assert(msg.body === `${enabling} Travis CI builds for ${owner}/${repo}...`);

        assert(plan.instructions.length === 1);
        const resp = plan.instructions[0] as CommandRespondable<Execute>;
        const instruction = resp.instruction;
        assert(instruction.kind === "execute");
        assert(instruction.name === fn);
        const params = instruction.parameters as any;
        assert(params.owner === owner);
        assert(params.repo === repo);
        assert(params.org === org);
        const successParams = (resp.onSuccess as Respond).parameters as any;
        assert(successParams.msg === `Successfully ${enabled} ${owner}/${repo} on Travis CI`);
    }

    it("should return a plan to enable a repo", () => {
        checkPlan(true);
    });

    it("should return a plan to disable a repo", () => {
        checkPlan(false);
    });

});
