# Pre-submission checks — do not skip

This source bundle implements the application and passes the included Node.js business-rule tests. It is not yet a complete course submission until the checks below are completed on a machine with npm registry access and in the student's own GitHub account.

## Environment-dependent checks
1. Run `npm install`. The preparation environment could not resolve `registry.npmjs.org`, so a valid `package-lock.json` could not be generated here. Keep the generated `package-lock.json` in the repository and ZIP.
2. Run `npm run build` and resolve any build errors.
3. Run `npm test` (the current Node-only test suite passes 9/9).
4. Run the site in the latest Chrome or Edge. Inspect the console and test all routes, cart, checkout, storage restore, loading failure/retry, changed availability, keyboard access, and 390px/1280px layouts.
5. Capture real screenshots of the three reference sites and the running application. Insert them into the report template and complete the observed-result column.
6. Create the public GitHub repository and genuine incremental commits. Do not fabricate or backdate history. Add the actual repository URL and final commit hash to the report.
7. Deploy the same final commit. Test the public URL, assets, nested route refresh and complete shopping journey. Add the real deployment URL to the report.
8. Export the completed report to PDF and submit it with the source ZIP, public repository link and deployed website link.

## Why the lockfile is absent in this bundle
The package registry hostname could not be resolved from the build environment. A fabricated or incomplete lockfile would be misleading and could make `npm ci` fail. Generate the real lockfile by running `npm install` in a network-connected environment before submission.
