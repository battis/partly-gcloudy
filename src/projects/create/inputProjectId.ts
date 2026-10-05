import * as lib from '#lib';
import { Validators } from '@qui-cli/validators';

type ProjectId = string;

type Options = {
  projectId?: string;
} & lib.PartialOptions<typeof lib.prompts.input<ProjectId>>;

export async function inputProjectId({
  projectId,
  validate,
  ...options
}: Options = {}) {
  return await lib.prompts.input<ProjectId>({
    arg: projectId,
    message: 'Google Cloud project unique identifier',
    validate: Validators.combine(
      validate || (() => true),
      Validators.lengthBetween(6, 30)
    ),
    default: lib.generate.projectId(),
    ...options
  });
}
