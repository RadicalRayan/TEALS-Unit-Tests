'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { isUndefined } from 'util';

let request = require('request');
let fs = require('fs');
let path = require('path');

const baseUrl = "https://raw.githubusercontent.com/RadicalRayan/TEALS-Unit-Tests/master/labFiles/introCS";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "teals-labs" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.getLab', getLab);
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('extension.testMyCode', testMyCode);
    context.subscriptions.push(disposable);
}

function getLab()
{
    let rootPath = vscode.workspace.rootPath;

    if (!rootPath)
    {
        vscode.window.showErrorMessage("Please open a directory in Visual Studio Code before getting a lab.");
        return;
    }

    // TODO: Fetch list of available labs from service.
    let availableLabs = [ 'Lab01.py', 'Lab02.py', 'Lab03.py' ];

    vscode.window.showQuickPick(availableLabs).then((name: string | undefined) =>
    {
        if (!isUndefined(name))
        {
            // User has made a choice. Check that the file doesn't already exist locally.
            let filePath = path.join(vscode.workspace.rootPath, name);

            if (fs.existsSync(filePath))
            {
                // File already exists. Warn user about impending doom!
                let choices = [ 'No', 'Yes' ];
                let options = { placeHolder: `WARNING: ${name} already exists. Do you really want to overwrite it?` };
                vscode.window.showQuickPick(choices, options).then((pick: string | undefined) =>
                {
                    // Proceed to download only if user has picked 'Yes'.
                    if (pick === 'Yes')
                    {
                        downloadAndOpen(name, filePath);
                    }
                });
            }
            else
            {
                // File does not exist. Safe to download.
                downloadAndOpen(name, filePath);
            }
        }
    });
}

function downloadAndOpen(name: string, filePath: string)
{
    let url = `${baseUrl}/${name}`;

    request(url, (error: string, response: any, body: string) =>
    {
        if (!error && response.statusCode === 200)
        {
            // Successfully downloaded the file. Save it to the workspace and open it in the editor.
            fs.writeFileSync(filePath, body, 'utf8');
            vscode.window.showTextDocument(vscode.Uri.file(filePath));
        }
        else
        {
            vscode.window.showErrorMessage(`Unable to download ${name}. (statusCode: ${response.statusCode})`);
        }
    });
}

function testMyCode() {
    vscode.window.showInformationMessage('Hello World!');
}

// this method is called when your extension is deactivated
export function deactivate() {
}
