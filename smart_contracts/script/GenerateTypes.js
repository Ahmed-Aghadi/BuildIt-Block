const { glob } = require("glob");
var path = require("path");
const { runTypeChain } = require("typechain");

const FRONTEND_TYPES_DIR = "../frontend/types";

const extraFiles = ["LinkTokenInterface.sol"];

async function main() {
  const cwd = process.cwd();
  const files = (await glob("./src/**/*.sol")).map((str) => path.basename(str));
  files.push(...extraFiles);
  const allFiles = files.map((file) => {
    return (
      "./out/" +
      file +
      "/" +
      (file === "UtilsLxLy.sol"
        ? file.replace(".sol", "").replace("LxLy", "")
        : file === "UtilsCCIP.sol"
        ? file.replace(".sol", "").replace("CCIP", "")
        : file.replace(".sol", "")) +
      ".json"
    );
  });

  const result = await runTypeChain({
    cwd,
    filesToProcess: allFiles,
    allFiles,
    outDir: FRONTEND_TYPES_DIR,
    // I wasn't able to detect network changes in v6. So I'm using v5 for now.
    target: "ethers-v5", // "ethers-v6",
  });
  console.log(result);
}

main();
