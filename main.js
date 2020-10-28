const { execSync } = require("child_process");
const fs = require("fs");

class SyncNodeModules {
  functionName = null;

  constructor(options) {
    this.functionName = options.functionName;
  }

  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    compiler.hooks.emit.tap("SyncNodeModules", () => {
      // execSync(
      //   `cd ${compiler.options.output.path} && find . -type f -not -name '*node_modules' -delete`
      // );
      const sourceStats = fs.statSync("package.json");

      let destStats;
      try {
        destStats = fs.statSync(compiler.options.output.path + "/package.json");
      } catch (e) {}

      if (
        !destStats ||
        destStats.mtime.getTime() != sourceStats.mtime.getTime()
      ) {
        console.log("Source package.json was modified, executing SAM BUILD");
        execSync("cp package.json " + compiler.options.output.path);
        fs.utimesSync(
          compiler.options.output.path + "/package.json",
          sourceStats.atime,
          sourceStats.mtime
        );
        execSync(
          `cd ${compiler.options.output.path}/../../ && pwd && npm run sam:build`
        );
        execSync(
          `cp -R ${compiler.options.output.path}/../../.aws-sam/build/${this.functionName}/node_modules ${compiler.options.output.path}/node_modules`
        );
      }
    });
  }
}

module.exports = SyncNodeModules;
