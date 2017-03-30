import { HandleCommand, HandlerContext, Message, Plan, Respondable, Execute, MappedParameters, HandleResponse, Response } from '@atomist/rug/operations/Handlers';
import { CommandHandler, Parameter, Tags, Intent, MappedParameter, Secrets, ResponseHandler } from '@atomist/rug/operations/Decorators';
import { Pattern } from '@atomist/rug/operations/RugOperation';

/**
 * A command handler to trigger build of a Rug archive on Travis CI.
 */
@CommandHandler("TravisBuildRug", "command handler to trigger build of a Rug archive on Travis CI")
@Tags("documentation")
@Intent("build rug")
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
    version: string; // version of Rug archive to publish

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

        let message: Message = new Message(`Starting ${msgTail}`);
        plan.add(message);

        let execute: Respondable<Execute> = {
            instruction: {
                kind: "execute",
                name: "travis-build-rug",
                parameters: this
            },
            onSuccess: {
                kind: "respond",
                name: "GenericSuccessHandler",
                parameters: { msg: `Successfully started ${msgTail}` }
            },
            onError: {
                kind: "respond",
                name: "GenericErrorHandler",
                parameters: { msg: `Failed to start ${msgTail}` }
            }
        };
        plan.add(execute);
        return plan;
    }
}

export const travisBuildRug = new TravisBuildRug();
@ResponseHandler("BuildStartError", "Displays an error in chat")
@Tags("errors")
class BuildStartErrorHandler implements HandleResponse<any> {

    @Parameter({ description: "Error message", pattern: "@any", required: true })
    msg: string

    handle(response: Response<any>): Message {
        return new Message(this.msg);
    }
}

export const buildStartErrorHandler = new BuildStartErrorHandler();

@ResponseHandler("BuildStartSuccess", "Displays a success message in chat")
@Tags("success")
class BuildStartSuccessHandler implements HandleResponse<any> {

    @Parameter({ description: "Success msg", pattern: "@any" })
    msg: string

    handle(response: Response<any>): Message {
        return new Message(this.msg);
    }
}

export const buildStartSuccessHandler = new BuildStartSuccessHandler();
