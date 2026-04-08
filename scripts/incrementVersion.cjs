var fs = require("fs");
var path = require("path");

var packagePath = path.join(__dirname, "..", "package.json");
var versionJsonPath = path.join(__dirname, "..", "src", "version.json");

var packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

// Parse major.minor.patch — increment patch
var parts = packageJson.version.split(".").map(function (p) {
	return parseInt(p, 10);
});
parts[2] = parts[2] + 1;
var newVersion = parts.join(".");

packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + "\n", "utf8");

var versionJson = JSON.stringify({ version: parts[2] }) + "\n";
fs.writeFileSync(versionJsonPath, versionJson, "utf8");

console.log("Version updated to " + newVersion);
