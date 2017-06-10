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
    CommandHandler, Intent, MappedParameter, Parameter, ParseJson, ResponseHandler, Secrets, Tags,
} from "@atomist/rug/operations/Decorators";
import {
    CommandPlan, CommandRespondable, Execute, HandleCommand, HandlerContext, HandleResponse,
    MappedParameters, Response, ResponseMessage,
} from "@atomist/rug/operations/Handlers";

import { handleErrors, wrap } from "@atomist/rugs/operations/CommonHandlers";
import { execute } from "@atomist/rugs/operations/PlanUtils";

import { travisSecretPath } from "./SecretPath";

const buildIdParameter = {
    displayName: "Build ID",
    description: "Travis CI identifier of build to restart",
    pattern: "^\\d+$",
};

/**
 * Command handler for restarting a Travis CI build that responds to
 * the intent `restart build`.
 *
 * @param buildId  integer ID of Travis CI build to restart
 * @param repo     name of repository
 * @param owner    owner (user or organization) of repository
 */
@CommandHandler("RestartBuild", "restart a Travis CI build")
@Tags("travis-ci", "ci")
@Secrets(travisSecretPath)
@Intent("restart build", "restart travis build")
class RestartBuild implements HandleCommand {

    @Parameter(buildIdParameter)
    public buildId: string;

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    public repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    public owner: string;

    public handle(ctx: HandlerContext): CommandPlan {
        const plan = new CommandPlan();

        plan.add(wrap(execute("travis-restart-build", this),
            `Successfully restarted Travis CI build ${this.buildId}`, this));

        return plan;
    }
}

export const restartBuild = new RestartBuild();
