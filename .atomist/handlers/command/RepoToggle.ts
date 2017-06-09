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

import {
    CommandPlan, CommandRespondable, Execute, HandlerContext, ResponseMessage,
} from "@atomist/rug/operations/Handlers";

import { wrap } from "@atomist/rugs/operations/CommonHandlers";

/**
 * Enable or disable a repo build on Travis CI.
 */
export function repoToggle(enable: boolean, repo: string, owner: string): CommandPlan {
    const fnName = (enable) ? "travis-enable-repo" : "travis-disable-repo";
    const action = (enable) ? "enabled" : "disabled";
    const actioning = action.replace("ed", "ing");
    const Actioning = actioning.charAt(0).toUpperCase() + actioning.slice(1);
    const plan = new CommandPlan();
    const message = new ResponseMessage(`${Actioning} Travis CI builds for ${owner}/${repo}…`);
    plan.add(message);
    const execute: CommandRespondable<Execute> = {
        instruction: {
            kind: "execute",
            name: fnName,
            parameters: { owner, repo },
        },
    };
    plan.add(wrap(execute, `Successfully ${action} ${owner}/${repo} on Travis CI`, this));
    return plan;
}
