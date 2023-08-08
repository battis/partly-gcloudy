import cli from '@battis/qui-cli';
import rootProjects from '../../projects';
import shell from '../../shell';
import accounts from '../accounts';

class projects {
  protected constructor() {
    // ignore
  }

  public static async enable({
    account,
    projectId
  }: { account?: string; projectId?: string } = undefined) {
    account = await accounts.selectidentifier({ name: account });
    if (account) {
      projectId = await rootProjects.selectIdentifier({ projectId });
      shell.gcloudBeta(
        `billing projects link ${projectId} --billing-account=${account}`,
        { includeProjectIdFlag: false }
      );
    } else {
      // TODO create a new billing account interactively
      await cli.prompts.confirm({
        message:
          'Confirm that you have created a billing account for this project'
      });
    }
  }
}

namespace projects { }

export { projects as default };
