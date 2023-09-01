import {execSync} from 'child_process'
import config from '../../config.json'

/**
 * Sanitizes a branch name by removing any character that is not a letter, number, or hyphen.
 *
 * @param {string} branch - The branch name to sanitize.
 * @return {string} The sanitized branch name.
 */
const sanitizeBranchName = (branch: string): string =>
  branch.replace(/[^a-zA-Z0-9-]/g, '')

/**
 * Gets the branch name from the GitHub environment variables.
 *
 * This function works for every trigger that you can specify under 'on' in the GitHub Actions
 * workflow file (e.g., push or pull_request).
 *
 * The trick is that `GITHUB_HEAD_REF` is only set when the workflow was triggered by a pull_request,
 * and it contains the value of the source branch of the PR.
 * `GITHUB_REF_NAME` will then only be used if the workflow was not triggered by a pull_request,
 * and it also just contains the branch name.
 * ```yml
 * env:
 *   BRANCH_NAME: ${{ github.head_ref || github.ref_name }}
 *```
 * @return {string|null} The sanitized branch name, or null if neither `GITHUB_HEAD_REF` nor
 * `GITHUB_REF_NAME` are set.
 */
const getBranchFromGithubRef = (): string | null => {
  const gitValue = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME
  if (gitValue) {
    return sanitizeBranchName(gitValue)
  }
  return null
}

const getLocalBranchName = (): string => {
  try {
    // if local development, acquire the branch name from the local git configuration
    const branchName = execSync('git rev-parse --abbrev-ref HEAD')
      .toString()
      .trim()

    return sanitizeBranchName(branchName)
  } catch (error) {
    console.error('Error getting branch name:', error)
    return 'local' // Default to 'local' or any fallback you'd prefer if git command fails
  }
}

const getCurrentBranchName = (): string =>
  getBranchFromGithubRef() || getLocalBranchName()

type StaticEnvironment = 'dev' | 'stage' | 'prod'
type EnvironmentConfig = {
  backend_subdomain: string
  frontend_subdomain: string
  deployment: string
}

/**
 * Retrieves the environment configuration based on the provided environment name (which could be a predefined one
 * like 'dev', 'stage', 'prod' or a dynamic branch name for other cases). The returned configuration includes
 * the backend and frontend subdomains specific to that environment or branch.
 * Additionally, it returns the name of the environment or branch as 'deployment'.
 *
 * @param {StaticEnvironment | string} env - The name of the environment or branch. If it matches one of the
 * predefined environments ('dev', 'stage', 'prod'), the configuration for that environment is returned.
 * Otherwise, the configuration is dynamically constructed based on the branch name.
 *
 * @returns {EnvironmentConfig} The corresponding environment configuration, which includes 'backend_subdomain',
 * 'frontend_subdomain', and 'deployment'.
 *
 * @example
 * // For a predefined environment:
 * getEnvironmentConfig('dev');
 * // Returns:
 * // {
 * //   backend_subdomain: "dev-backend-cdk-book",
 * //   frontend_subdomain: "dev-frontend-cdk-book",
 * //   deployment: "dev"
 * // }
 *
 * @example
 * // For a custom branch named 'feature-x':
 * getEnvironmentConfig('feature-x');
 * // Might return:
 * // {
 * //   backend_subdomain: "feature-x-backend-cdk-book",
 * //   frontend_subdomain: "feature-x-frontend-cdk-book",
 * //   deployment: "feature-x"
 * // }
 */
export const getEnvironmentConfig = (
  env: StaticEnvironment | string, // Allow both static and arbitrary string values
): EnvironmentConfig => {
  const deployment =
    env === 'dev' || env === 'stage' || env === 'prod'
      ? env
      : getCurrentBranchName()

  const environmentConfig =
    env in config.environments
      ? config.environments[env as StaticEnvironment]
      : {
          backend_subdomain: `${deployment}-backend-cdk-book`,
          frontend_subdomain: `${deployment}-frontend-cdk-book`,
        }

  return {...environmentConfig, deployment}
}
