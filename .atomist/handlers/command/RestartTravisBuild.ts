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

import { CommandHandler, Intent, Parameter, Secrets, Tags } from "@atomist/rug/operations/Decorators";
import {
    CommandPlan, CommandRespondable, Execute, HandleCommand, HandlerContext,
} from "@atomist/rug/operations/Handlers";

import { wrap } from "@atomist/rugs/operations/CommonHandlers";

@CommandHandler("RestartTravisBuild", "Restart a Travis CI build")
@Tags("travis-ci", "ci")
@Secrets("github://user_token?scopes=repo")
@Intent("restart build", "restart travis build")
class RestartBuild implements HandleCommand {

    @Parameter({ description: "The Travis CI build ID", pattern: "^.*$" })
    public buildId: number;

    @Parameter({ description: ".org or .com", pattern: "^\.com|\.org$" })
    public org: string = ".org";

    public handle(ctx: HandlerContext): CommandPlan {
        const plan = new CommandPlan();
        const execute: CommandRespondable<Execute> = {
            instruction: {
                kind: "execute",
                name: "restart-travis-build",
                parameters: this,
            },
        };
        plan.add(wrap(execute, `Successfully restarted Travis build ${this.buildId}`, this));
        return plan;
    }
}

export const restartBuild = new RestartBuild();
