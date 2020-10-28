const { execSync } = require("child_process");
const fs = require("fs");

class SyncNodeModules {
  functionName = null;

  constructor(options) {
    this.functionName = options.functionName;
  }

  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    let packageLastModified;
    compiler.hooks.emit.tap("SyncNodeModules", () => {
      // execSync(
      //   `cd ${compiler.options.output.path} && find . -type f -not -name '*node_modules' -delete`
      // );
      const packageModifiedAt = fs.statSync("package.json").mtime.getTime();
      if (!packageLastModified || packageLastModified != packageModifiedAt) {
        console.log("Source package.json was modified, executing SAM BUILD");
        execSync("cp -R package.json " + compiler.options.output.path);
        execSync("cd ../../ && npm run sam:build");
        execSync(
          `cp ../../.aws-sam/build/${this.functionName}/node_modules ${compiler.options.output.path}/node_modules`
        );
        packageLastModified = packageModifiedAt;
      }
    });
  }
}

module.exports = SyncNodeModules;
