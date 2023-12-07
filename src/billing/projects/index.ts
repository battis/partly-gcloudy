import cli from '@battis/qui-cli';
import * as rootProjects from '../../projects';
import * as shell from '../../shell';
import * as accounts from '../accounts';

export async function enable({
  account,
  projectId
}: { account?: string; projectId?: string } = {}) {
  account = await accounts.selectidentifier({ name: account });
  if (account) {
    projectId = await rootProjects.selectIdentifier({ projectId });
    await shell.gcloudBeta(
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
