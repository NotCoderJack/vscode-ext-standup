// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as Schedule from 'node-schedule'

let allJobs: Schedule.Job[] = []
const REMIND_MSG = 'Hi there, you sit too long, please stand up! (Select next remind time)'
const REMIND_OPTIONS = ['15mins', '1hour', 'No more today']

const jobRemind = () => {
	vscode.window.showWarningMessage(REMIND_MSG, {
	}, ...REMIND_OPTIONS).then((selected) => {
		if (selected === REMIND_OPTIONS[4]) {
			clearAllJobs()
		}
		switch (selected) {
			case REMIND_OPTIONS[0]:
				Schedule.rescheduleJob(allJobs[0], genCron(15))
				break;
			case REMIND_OPTIONS[1]:
				Schedule.rescheduleJob(allJobs[0], genCron(60))
				break;
			case REMIND_OPTIONS[2]:
				Schedule.rescheduleJob(allJobs[0], genCron(120))
				break;
		}
	})
}

const genCron = (interval = 30) => {
	const now = new Date()
	let cron = ''
	if (interval < 60) {
		cron = `${now.getSeconds()} ${now.getMinutes()}/${interval} * * * *`
	} else {
		cron = `${now.getSeconds()} ${now.getMinutes()} ${now.getHours() / (Math.floor(interval / 60))} * * *`
	}
	return cron
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const cron = genCron()
	const remindJob = Schedule.scheduleJob(cron, jobRemind)
	allJobs.push(remindJob)

	let disposable = vscode.commands.registerCommand('standup.helloWorld', () => {
		vscode.window.showInformationMessage('Hi there, You Sit too Long, Stand up!');
	});

	context.subscriptions.push(disposable);
}

const clearAllJobs = () => {
	allJobs.forEach(job => {
		if (job instanceof Schedule.Job) {
			job.cancel()
		}
	})
	allJobs = []
}

// this method is called when your extension is deactivated
export function deactivate() {
	clearAllJobs()
}
