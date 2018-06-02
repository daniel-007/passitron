import {CommandDefinition} from 'commandtypes';
import {ModalDialog} from 'components/modaldialog';
import {defaultErrorHandler} from 'generated/restapi';
import {CommandChangesArgs, CommandPagelet, initialCommandState} from 'plumbing';
import * as React from 'react';

interface CommandButtonProps {
	command: CommandDefinition;
}

interface CommandButtonState {
	dialogOpen: boolean;
	cmdState: CommandChangesArgs;
}

export class CommandButton extends React.Component<CommandButtonProps, CommandButtonState> {
	state = { dialogOpen: false, cmdState: initialCommandState() };

	private cmdPagelet: CommandPagelet | null = null;

	save() {
		// FIXME: remove duplication of this code
		this.cmdPagelet!.submit().then(() => {
			document.location.reload();
		}, defaultErrorHandler);
	}

	render() {
		const commandTitle = this.props.command.title;

		const maybeDialog = this.state.dialogOpen ?
			<ModalDialog title={commandTitle} onSave={() => { this.save(); }} submitEnabled={this.state.cmdState.submitEnabled}>
				<CommandPagelet
					command={this.props.command}
					onSubmit={() => { this.save(); }}
					onChanges={(cmdState) => { this.setState({ cmdState }); }}
					ref={(el) => { this.cmdPagelet = el; }} />
			</ModalDialog> : null;

		return <div style={{display: 'inline-block'}}>
			<a className="btn btn-default" onClick={() => { this.setState({ dialogOpen: true }); }}>{commandTitle}</a>

			{ maybeDialog }
		</div>;
	}
}

type EditType = 'add' | 'edit' | 'remove';

interface CommandIconProps {
	command: CommandDefinition;
	type?: EditType;
}

interface CommandIconState {
	dialogOpen: boolean;
	cmdState: CommandChangesArgs;
}

const typeToIcon: {[key: string]: string} = {
	add: 'glyphicon-plus',
	edit: 'glyphicon-pencil',
	remove: 'glyphicon-remove',
};

export class CommandIcon extends React.Component<CommandIconProps, CommandIconState> {
	state = { dialogOpen: false, cmdState: initialCommandState() };

	private cmdPagelet: CommandPagelet | null = null;

	save() {
		// FIXME: remove duplication of this code
		this.cmdPagelet!.submit().then(() => {
			document.location.reload();
		}, defaultErrorHandler);
	}

	render() {
		const commandTitle = this.props.command.title;

		const type = this.props.type ? this.props.type : 'edit';
		const icon = typeToIcon[type];

		const maybeDialog = this.state.dialogOpen ?
			<ModalDialog title={commandTitle} onSave={() => { this.save(); }} submitEnabled={this.state.cmdState.submitEnabled}>
				<CommandPagelet
					command={this.props.command}
					onSubmit={() => { this.save(); }}
					onChanges={(cmdState) => { this.setState({ cmdState }); }}
					ref={(el) => { this.cmdPagelet = el; }} />
			</ModalDialog> : null;

		return <span className={`glyphicon ${icon} hovericon margin-left`} onClick={() => { this.setState({dialogOpen: true}); }} title={commandTitle}>
			{maybeDialog}
		</span>;
	}
}

interface CommandLinkProps {
	command: CommandDefinition;
}

interface CommandLinkState {
	dialogOpen: boolean;
	cmdState: CommandChangesArgs;
}

export class CommandLink extends React.Component<CommandLinkProps, CommandLinkState> {
	state = { dialogOpen: false, cmdState: initialCommandState() };

	private cmdPagelet: CommandPagelet | null = null;

	save() {
		// FIXME: remove duplication of this code
		this.cmdPagelet!.submit().then(() => {
			document.location.reload();
		}, defaultErrorHandler);
	}

	render() {
		const commandTitle = this.props.command.title;

		const maybeDialog = this.state.dialogOpen ?
			<ModalDialog title={commandTitle} onSave={() => { this.save(); }} submitEnabled={this.state.cmdState.submitEnabled}>
				<CommandPagelet
					command={this.props.command}
					onSubmit={() => { this.save(); }}
					onChanges={(cmdState) => { this.setState({ cmdState }); }}
					ref={(el) => { this.cmdPagelet = el; }} />
			</ModalDialog> : null;

		return <a className="fauxlink" onClick={() => { this.setState({dialogOpen: true}); }} key={this.props.command.key}>
			{commandTitle}
			{maybeDialog}
		</a>;
	}
}
