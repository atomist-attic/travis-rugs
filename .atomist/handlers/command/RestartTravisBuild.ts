import {HandleResponse, Execute, Respondable, MappedParameters, HandleCommand, Respond, Response, HandlerContext, Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'

@CommandHandler("RestartTravisBuild", "Restart a Travis CI build")
@Tags("travis", "ci")
@Secrets("github://user_token?scopes=repo")
@Intent("restart build", "restart travis build")
class RestartBuild implements HandleCommand {
    
    @Parameter({description: "The Travis CI build ID", pattern: "^.*$"})
    buildId: number

    @Parameter({description: ".org or .com", pattern: "^\.com|\.org$"})
    org: string = ".org"

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = 
        {instruction:
          {kind: "execute", name: "restart-travis-build", parameters: this},
        onSuccess: {kind: "respond", name: "GenericSuccessHandler", parameters: {msg: `Successfully restarted Travis build ${this.buildId}`}},
        onError: {kind: "respond", name: "GenericErrorHandler", parameters: {msg: `Failed to restart Travis build ${this.buildId}: `}}}
        plan.add(execute)
        return plan;
    }
}

export const restarter = new RestartBuild();