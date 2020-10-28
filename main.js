const { execSync } = require("child_process");
const fs = require("fs");

class SyncNodeModules {
  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    let packageLastModified;
    compiler.hooks.emit.tap("SyncNodeModules", () => {
      execSync(
        `cd ${compiler.options.output.path} && find . -type f -not -name '*node_modules' -delete`
      );
      const packageModifiedAt = fs.statSync("package.json").mtime.getTime();
      if (!packageLastModified || packageLastModified != packageModifiedAt) {
        console.log("Source package.json was modified, executing NPM INSTALL");
        execSync("cp package.json " + compiler.options.output.path);
        execSync(
          `cd ${compiler.options.output.path} && npm install --production`
        );
        packageLastModified = packageModifiedAt;
      }
    });
  }
}

module.exports = SyncNodeModules;
