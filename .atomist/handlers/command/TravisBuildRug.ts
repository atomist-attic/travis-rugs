import { HandleCommand, HandlerContext, Plan, Respondable, Execute, MappedParameters, HandleResponse, Response, ResponseMessage } from '@atomist/rug/operations/Handlers';
import { CommandHandler, Parameter, Tags, Intent, MappedParameter, Secrets, ResponseHandler } from '@atomist/rug/operations/Decorators';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import { wrap } from '@atomist/rugs/operations/CommonHandlers';

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
    "github://user_token?scopes=repo"
)
export class TravisBuildRug implements HandleCommand {

    @Parameter({
        displayName: "Version",
        description: "version of Rug archive to publish",
        pattern: Pattern.semantic_version,
        validInput: "a semantic version, it must be unique",
        minLength: 5,
        maxLength: 100,
        required: true
    })
    version: string;

    @Parameter({
        displayName: "Git Reference",
        description: "branch, tag, or commit to checkout and build",
        pattern: Pattern.project_name,
        validInput: "a valid Git reference",
        minLength: 1,
        maxLength: 100,
        required: false
    })
    gitRef: string = "master";

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string;

    @MappedParameter(MappedParameters.SLACK_TEAM)
    teamId: string;

    handle(command: HandlerContext): Plan {
        let plan: Plan = new Plan();

        const msgTail = `Travis CI build for Rug project ${this.owner}/${this.repo}`;

        let message: ResponseMessage = new ResponseMessage(`Starting ${msgTail}`);
        plan.add(message);

        let execute: Respondable<Execute> = {
            instruction: {
                kind: "execute",
                name: "travis-build-rug",
                parameters: this
            }
        };
        plan.add(wrap(execute, `Successfully started ${msgTail}`, this));
        return plan;
    }
}

export const travisBuildRug = new TravisBuildRug();
