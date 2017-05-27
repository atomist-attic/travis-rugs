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
    CommandPlan, HandleCommand, HandlerContext, MappedParameters,
} from "@atomist/rug/operations/Handlers";

import { wrap } from "@atomist/rugs/operations/CommonHandlers";

import { repoToggle } from "./RepoToggle";
import { travisSecretPath } from "./SecretPath";

/**
 * A disable repository build on Travis CI command handler.
 */
@CommandHandler("DisableRepo", "disable repository build on Travis CI")
@Tags("travis-ci", "ci")
@Intent("disable travis")
@Secrets(travisSecretPath)
export class DisableRepo implements HandleCommand {

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    public repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    public owner: string;

    public handle(command: HandlerContext): CommandPlan {
        return repoToggle(false, this.repo, this.owner);
    }
}

export const disableRepo = new DisableRepo();
