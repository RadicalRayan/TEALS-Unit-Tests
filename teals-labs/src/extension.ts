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

// TODO: Fix the base urls, we'll have two that are used, one for tests, and one for the starting lab.
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

// TODO: Add a "friendly name" attribute and show that + the lab name.
const LabLookup: _.Dictionary<ILab> = {
  [Labs.Lab01]: { student: "Lab01.py", test: "Lab01.test.py" },
  [Labs.Lab02]: { student: "Lab02.py", test: "Lab02.test.py" },
  [Labs.Lab03]: { student: "Lab03.py", test: "Lab03.test.py" }
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
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

function testMyCode(name: string) {
  vscode.window.showInformationMessage("Starting test!");
  console.log("Starting download and test...");
  // Download the test file to a temp directory.
  // TODO: Actually download to a temp directory... VS Code doesn't have permission to acccess %TEMP%. We could maybe make a private directory ".test" and copy both files there for a run?
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
    const updateWebview = (items: ITestResult[] = []) => {
      panel.webview.html = getWebviewContent(items);
    };
    panel.reveal();
    updateWebview();
    // TODO: Check if the file the user has opened is an expected / allowable file (ie: Has a cooresponding test file)
    download(testFileName, downloadFilePath)
      .then((updatedFilePath: string) => {
        console.log("Successful download!");
        // Run the test code with the current open file...
        exec(
          `python "${updatedFilePath}" --verbose`,
          (err: any, stdout: any, stderr: any) => {
            const items: ITestResult[] = stderr
              .split("\n")
              .filter((line: string) => line.startsWith("test_"))
              .map((testLine: string) => {
                const splitted: string[] = testLine.split(" ");
                return {
                  name: splitted[0], // 0 index for name
                  result: Result[splitted[3].trim() as any] // 3 index for result
                };
              });
            updateWebview(items);
            console.log("Successfully ran test!");
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

function getWebviewContent(items: ITestResult[]) {
  return `<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TEALS Autograding Test</title>
</head>
<body>
<table id="mytable">
<tbody>
<tr><td>Pass?</td><td>Test name</td><td>Result</td></tr>
${items.map((item: ITestResult) => {
    return `<tr style="background-color:${resultToColor(item.result)}"><td>${resultToIcon(
      item.result
    )}</td>  <td>${item.name}</td><td>${item.result}</td> </tr>`;
  })}
</tbody>
</table>    
</body>
</html>`;
}

function resultToIcon(result: Result): string {
  if (result === Result.FAIL) {
    return "❌";
  } else if (result === Result.ERROR) {
    return "⚠";
  } else {
    return "❎";
  }
}

function resultToColor(result: Result): string {
  if (result === Result.FAIL) {
    return "#C62828";
  } else if (result === Result.ERROR) {
    return "#F9A825";
  } else {
    return "#2E7D32";
  }
}

function testCleanup(filePath: string): void {
  // Delete the downloaded file...
  console.log("Deleting file...");
  fs.unlink(filePath);
}

// this method is called when your extension is deactivated
export function deactivate() {}
