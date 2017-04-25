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
    CommandHandler, Intent, MappedParameter, Parameter, Secrets, Tags,
} from "@atomist/rug/operations/Decorators";
import {
    CommandPlan, CommandRespondable, Execute, HandleCommand, HandlerContext,
    MappedParameters, ResponseMessage,
} from "@atomist/rug/operations/Handlers";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import { wrap } from "@atomist/rugs/operations/CommonHandlers";

/**
 * A command handler to trigger build of a Rug archive on Travis CI.
 */
@CommandHandler("TravisBuildRug", "command handler to trigger build of a Rug archive on Travis CI")
@Tags("travis-ci", "rug")
@Intent("publish rug")
@Secrets(
    "secret://team?path=travis_token",
    "secret://team?path=maven_base_url",
    "secret://team?path=maven_user",
    "secret://team?path=maven_token",
    "github://user_token?scopes=repo",
)
export class TravisBuildRug implements HandleCommand {

    @Parameter({
        displayName: "Version",
        description: "version of Rug archive to publish",
        pattern: Pattern.semantic_version,
        validInput: "a semantic version, it must be unique",
        minLength: 5,
        maxLength: 100,
        required: true,
    })
    public version: string;

    @Parameter({
        displayName: "Git Reference",
        description: "branch, tag, or commit to checkout and build",
        pattern: Pattern.project_name,
        validInput: "a valid Git reference",
        minLength: 1,
        maxLength: 100,
        required: false,
    })
    public gitRef: string = "master";

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    public repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    public owner: string;

    @MappedParameter(MappedParameters.SLACK_TEAM)
    public teamId: string;

    public handle(command: HandlerContext): CommandPlan {
        const plan: CommandPlan = new CommandPlan();

        const msgTail = `Travis CI build for Rug project ${this.owner}/${this.repo}`;

        const message: ResponseMessage = new ResponseMessage(`Starting ${msgTail}`);
        plan.add(message);

        const execute: CommandRespondable<Execute> = {
            instruction: {
                kind: "execute",
                name: "travis-build-rug",
                parameters: this,
            },
        };
        plan.add(wrap(execute, `Successfully started ${msgTail}`, this));
        return plan;
    }
}

export const travisBuildRug = new TravisBuildRug();
