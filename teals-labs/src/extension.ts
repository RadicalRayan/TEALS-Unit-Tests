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
  vscode.window.showInformationMessage("Hello World!");
  // We could check if the test already exists...
  // Download the test file to a temp directory.

  if (vscode.window.activeTextEditor) {
    const filePath = vscode.window.activeTextEditor.document.fileName;
    const testFileName = LabLookup[path.basename(filePath, path.extname(filePath))].test;
    let downloadFilePath = path.join(
      vscode.workspace.rootPath,
      testFileName
    );
    download(
      testFileName,
      downloadFilePath
    )
      .then((updatedFilePath: string) => {
        // Run the test code with the current open file...
        exec(`python "${updatedFilePath}"`, (err: any, stdout: any, stderr: any) => {
          if (err) {
            const resultLine = stderr.split("\n")[0]
            const numFailures = resultLine.match(/F/g).length;
            const numTestsRan = resultLine.length - 1; // Account for carriage return \r
            vscode.window.showInformationMessage(`Bad news... You got ${numFailures} out of ${numTestsRan} incorrect. Please look for edge cases and general running.`);
          } else {
              vscode.window.showInformationMessage("Congrats! Looks like your code will get full 'Functionality' points. Remember to add comments and clean it up before submitting!");
          }

          // Delete the downloaded file...
          fs.unlink(updatedFilePath);
        });
      })
      .catch(() => {
        vscode.window.showErrorMessage(
          `Unable to validate your test due to connectivity issues. Please talk to an instructor.`
        );
      });
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
