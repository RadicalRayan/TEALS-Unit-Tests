"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as _ from "lodash";
import { isUndefined } from "util";
const { exec } = require("child_process");

let request = require("request");
let fs = require("fs");
let path = require("path");

const baseUrl =
  "https://raw.githubusercontent.com/RadicalRayan/TEALS-Unit-Tests/master/labFiles/introCS";

// TODO: Fetch list of available labs from service.
enum Labs {
  Lab01 = "Lab01",
  Lab02 = "Lab02",
  Lab03 = "Lab03"
}

enum Result {
  ok = "ok",
  FAIL = "FAIL",
  ERROR = "ERROR" // TODO: Verify....
}

interface ITestResult {
  name: string;
  result: Result;
}

interface ILab {
  student: string;
  test: string;
}

const LabLookup: _.Dictionary<ILab> = {
  [Labs.Lab01]: { student: "Lab01.py", test: "Lab01.test.py" },
  [Labs.Lab02]: { student: "Lab02.py", test: "Lab02.test.py" },
  [Labs.Lab03]: { student: "Lab03.py", test: "Lab03.test.py" }
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "teals-labs" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("extension.getLab", getLab);
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    "extension.testMyCode",
    testMyCode
  );
  context.subscriptions.push(disposable);
}

function getLab() {
  let rootPath = vscode.workspace.rootPath;

  if (!rootPath) {
    vscode.window.showErrorMessage(
      "Please open a directory in Visual Studio Code before getting a lab."
    );
    return;
  }

  vscode.window
    .showQuickPick(
      Object.keys(Labs).filter(item => {
        return isNaN(Number(item));
      })
    )
    .then((name: string | undefined) => {
      if (!isUndefined(name)) {
        // User has made a choice. Check that the file doesn't already exist locally.
        let filePath = path.join(
          vscode.workspace.rootPath,
          LabLookup[name].student
        );

        if (fs.existsSync(filePath)) {
          // File already exists. Warn user about impending doom!
          let choices = ["No", "Yes"];
          let options = {
            placeHolder: `WARNING: ${
              LabLookup[name].student
            } already exists. Do you really want to overwrite it?`
          };
          vscode.window
            .showQuickPick(choices, options)
            .then((pick: string | undefined) => {
              // Proceed to download only if user has picked 'Yes'.
              if (pick === "Yes") {
                downloadAndOpen(LabLookup[name].student, filePath);
              }
            });
        } else {
          // File does not exist. Safe to download.
          downloadAndOpen(LabLookup[name].student, filePath);
        }
      }
    });
}

function download(name: string, filePath: string): Promise<any> {
  const deferredPromise = new Promise((resolve: any, reject: any) => {
    let url = `${baseUrl}/${name}`;
    request(url, (error: string, response: any, body: string) => {
      if (!error && response.statusCode === 200) {
        // Successfully downloaded the file. Save it to the workspace and open it in the editor.
        fs.writeFileSync(filePath, body, "utf8");
        resolve(filePath);
      } else {
        reject(response.statusCode);
      }
    });
  });

  return deferredPromise;
}

function downloadAndOpen(name: string, filePath: string) {
  download(name, filePath)
    .then(updatedFilePath => {
      vscode.window.showTextDocument(vscode.Uri.file(updatedFilePath));
    })
    .catch(statusCode => {
      vscode.window.showErrorMessage(
        `Unable to download ${name}. (statusCode: ${statusCode})`
      );
    });
}

// function getStudentVersion(lab: Labs): string {
//     return lab + ".py";
// }

// function getTestVersion(lab: Labs): string {
//     return lab + "test.py";
// }

function testMyCode(name: string) {
  vscode.window.showInformationMessage("Starting test!");
  console.log("Starting download and test...");
  // We could check if the test already exists...
  // Download the test file to a temp directory.

  if (vscode.window.activeTextEditor) {
    const filePath = vscode.window.activeTextEditor.document.fileName;
    const testFileName =
      LabLookup[path.basename(filePath, path.extname(filePath))].test;
    let downloadFilePath = path.join(vscode.workspace.rootPath, testFileName);
    const panel: vscode.WebviewPanel = vscode.window.createWebviewPanel(
      "testTEALS",
      "TEALS Tests",
      vscode.ViewColumn.One,
      {}
    );
    const updateWebview = (isRunning: boolean, items: ITestResult[]) => {
      const thing = getWebviewContent(isRunning, items);
      panel.webview.html = thing;
    };
    panel.reveal();
    let text = "";
    let isRunning = true;
    text += "We're attempting to run the tests...";
    updateWebview(isRunning, []);
    download(testFileName, downloadFilePath)
      .then((updatedFilePath: string) => {
        console.log("Successful download!");
        // Run the test code with the current open file...
        exec(
          `python "${updatedFilePath}" --verbose`,
          (err: any, stdout: any, stderr: any) => {
            isRunning = false;
            const items: ITestResult[] = stderr
              .split("\n")
              .filter((line: string) => line.startsWith("test_"))
              .map((testLine: string) => {
                const splitted: string[] = testLine.split(" ");
                return {
                  name: splitted[0],
                  result: Result[splitted[3].trim() as any]
                };
              });
            // if (err) {
            //   console.error(err);
            //   console.error(stderr);

            //   const failedTestNames = stderr.split("\n").filter((line: string) => { return line.startsWith("FAIL: test_");}).map((line: string) => { return line.split(" ")[1] });
            //   const resultLine = stderr.split("\n")[0];
            //   const numFailures = resultLine.match(/F/g).length;
            //   const numTestsRan = resultLine.length - 1; // Account for carriage return \r
            //   if (numFailures > 0) {
            //     text="";
            //     text+=("Uh Oh!");
            //     text+=("Looks like you have some failures here...");
            //     text+=(
            //       numFailures +
            //         " of our tests failed. Please look at your code again."
            //     );
            //     text+=(
            //       "Consider edge cases and make sure the program runs with the base cases."
            //     );
            //     updateWebview(isRunning, numFailures, numTestsRan, text);
            //     vscode.window.showInformationMessage(
            //       `Bad news... You got ${numFailures} out of ${numTestsRan} incorrect. Please look for edge cases and general running.`
            //     );
            //     testCleanup(updatedFilePath);
            //     return;
            //   }
            // }
            // text+=("Successful test!");
            // text+=(
            //   "Congrats! Looks like your code will get a full 'Functionality' points."
            // );
            // text+=(
            //   "Remember to add comments and clean up your code to ensure you get full credit for the lab."
            // );
            updateWebview(isRunning, items);
            console.log("Successfully ran test!");
            // vscode.window.showInformationMessage(
            //   "Congrats! Looks like your code will get full 'Functionality' points. Remember to add comments and clean it up before submitting!"
            // );

            testCleanup(updatedFilePath);
          }
        );
      })
      .catch(() => {
        console.error("Couldn't download test file...");
        vscode.window.showErrorMessage(
          `Unable to validate your test due to connectivity issues. Please talk to an instructor.`
        );
      });
  }
}

function getWebviewContent(isRunning: boolean, items: ITestResult[]) {
  return `<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
</head>
<body>
<table id="mytable">
<tbody>
<tr><td>Pass?</td><td>Test name</td><td>Result</td></tr>
${items.map((item: ITestResult) => {
    return `<tr id="${item.result}"><td>${
      item.result === Result.ok
        ? "❎"
        : item.result === Result.FAIL
          ? "❌"
          : "⚠"
    }</td>  <td>${item.name}</td><td>${item.result}</td> </tr>`;
  })}
</tbody>
</table>    

</body>
</html>`;
}

function testCleanup(filePath: string): void {
  // Delete the downloaded file...
  console.log("Deleting file...");
  fs.unlink(filePath);
}

// this method is called when your extension is deactivated
export function deactivate() {}
