---
name: ci-mode
description: Detect CI environment and adjust behavior for automated pipelines
event: SessionStart
---

# CI Mode Detection

Check for CI environment variables:
- `CI=true`
- `GITHUB_ACTIONS=true`
- `JENKINS_HOME` is set
- `GITLAB_CI=true`
- `CIRCLECI=true`
- `BUILDKITE=true`

If any CI indicator is detected:
1. Default output format to JSON and SARIF (not text)
2. Disable interactive prompts — use config file or CLI flags only
3. Ensure exit code 1 on failures exceeding `--fail-on` threshold
4. Suppress color output
5. Write results to `.prompt-armor/` for artifact collection
