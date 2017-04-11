import { Given, When, Then, HandlerScenarioWorld, CommandHandlerScenarioWorld } from "@atomist/rug/test/handler/Core"
import { Execute, Respondable, ResponseMessage } from "@atomist/rug/operations/Handlers"

Given("nothing", f => { });

const owner = "atomist-test";
const repo = "rug-repo";

When("the TravisBuildRug is invoked", (world: HandlerScenarioWorld) => {
    let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    let handler = w.commandHandler("TravisBuildRug");
    let handlerParameters = {
        owner: owner,
        repo: repo,
        version: "1.2.3",
        teamId: "TK421WAYAYP",
        gitRef: "master",
        travisToken: "not0a0valid0travis0token",
        mavenBaseUrl: "https://atomust.jtoad.io/atomust",
        mavenUser: "maven-writer",
        mavenToken: "not0a0real0maven0token",
        userToken: "not0a0valid0github0token"
    }
    w.invokeHandler(handler, handlerParameters);
});

Then("the plan contains a starting message", (world: HandlerScenarioWorld) => {
    let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    const expected = `Starting Travis CI build for Rug project ${owner}/${repo}`;
    const message = (w.plan().messages[0] as ResponseMessage).body;
    console.log(`message:${message}`);
    return message == expected;
});

Then("the plan contains a call to the Travis build function", (world: HandlerScenarioWorld) => {
    let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    const respondable = w.plan().instructions[0] as Respondable<Execute>;
    const instruction = respondable.instruction as Execute;
    const name = instruction.name as string;
    return name == "travis-build-rug";
});
