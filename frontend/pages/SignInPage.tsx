import { coerceToStructuredErrorResponse, isNotSignedInError, isSealedError } from 'backenderrors';
import { navigateTo } from 'f61ui/browserutils';
import { WarningAlert } from 'f61ui/components/alerts';
import { Button, Panel } from 'f61ui/components/bootstrap';
import { Breadcrumb } from 'f61ui/components/breadcrumbtrail';
import { CommandInlineForm } from 'f61ui/components/CommandButton';
import { Loading } from 'f61ui/components/loading';
import { shouldAlwaysSucceed, unrecognizedValue } from 'f61ui/utils';
import { DatabaseUnseal, SessionSignIn } from 'generated/commanddefinitions';
import { RootFolderId, RootFolderName } from 'generated/domain';
import { getFolder } from 'generated/restapi';
import { AppDefaultLayout } from 'layout/appdefaultlayout';
import * as React from 'react';
import { indexRoute } from 'routes';

const storedUsernameLocalStorageKey = 'signInLastUsername';

// Sealed => AwaitingUsername => AwaitingPassword
enum UnauthenticatedKind {
	Sealed, // while database is sealed, signing in is not possible
	AwaitingUsername,
	AwaitingPassword,
}

interface SignInPageProps {
	redirect: string;
}

interface SignInPageState {
	status?: UnauthenticatedKind;
	username: string;
}

export default class SignInPage extends React.Component<SignInPageProps, SignInPageState> {
	state: SignInPageState = {
		username: localStorage.getItem(storedUsernameLocalStorageKey) || '',
	};
	private title = 'Sign in';

	componentDidMount() {
		shouldAlwaysSucceed(this.fetchData());
	}

	render() {
		const widget =
			this.state.status !== undefined ? this.widgetByStatus(this.state.status) : <Loading />;

		return (
			<AppDefaultLayout title={this.title} breadcrumbs={this.getBreadcrumbs()}>
				{widget}
			</AppDefaultLayout>
		);
	}

	private widgetByStatus(status: UnauthenticatedKind): JSX.Element {
		switch (status) {
			case UnauthenticatedKind.Sealed:
				return (
					<Panel heading="Database is sealed">
						<WarningAlert text="Database is sealed. You can only log in after database has been unsealed." />

						<CommandInlineForm command={DatabaseUnseal()} />
					</Panel>
				);
			case UnauthenticatedKind.AwaitingUsername:
				return (
					<Panel heading={this.title}>
						<form
							onSubmit={() => {
								this.rememberUsername();
							}}>
							<div className="form-group">
								<label>
									Username *
									<input
										type="text"
										className="form-control"
										value={this.state.username}
										onChange={(e) => {
											this.setState({ username: e.target.value });
										}}
									/>
								</label>
							</div>
							<input type="submit" value="Next" className="btn btn-primary" />
						</form>
					</Panel>
				);
			case UnauthenticatedKind.AwaitingPassword:
				return (
					<Panel heading={this.title}>
						<div className="form-group">
							<label>Username *</label>

							<p>
								{this.state.username}
								<span className="margin-left">
									<Button
										label="Change user"
										click={() => {
											this.forgetUsername();
										}}
									/>
								</span>
							</p>
						</div>
						<CommandInlineForm command={SessionSignIn(this.state.username)} />
					</Panel>
				);
			default:
				return unrecognizedValue(status);
		}
	}

	private rememberUsername() {
		if (this.state.username === '') {
			return;
		}

		// store, so next on next login we can pre-fill this
		localStorage.setItem(storedUsernameLocalStorageKey, this.state.username);

		this.setState({ status: UnauthenticatedKind.AwaitingPassword });
	}

	private forgetUsername() {
		localStorage.removeItem(storedUsernameLocalStorageKey);

		this.setState({ status: UnauthenticatedKind.AwaitingUsername });
	}

	private getBreadcrumbs(): Breadcrumb[] {
		return [
			{ url: indexRoute.buildUrl({}), title: RootFolderName },
			{ url: '', title: this.title },
		];
	}

	private async fetchData() {
		const status = await this.determineUnauthenticatedKind();

		if (status !== null) {
			this.setState({ status });
		} else {
			// signed in => redirect to where we wanted to go
			navigateTo(this.props.redirect);
		}
	}

	private async determineUnauthenticatedKind(): Promise<UnauthenticatedKind | null> {
		try {
			// dummy request just to gauge problems status
			await getFolder(RootFolderId);

			return null;
		} catch (ex) {
			const ser = coerceToStructuredErrorResponse(ex);

			if (isSealedError(ser)) {
				return UnauthenticatedKind.Sealed;
			} else if (isNotSignedInError(ser)) {
				return this.state.username === ''
					? UnauthenticatedKind.AwaitingUsername
					: UnauthenticatedKind.AwaitingPassword;
			}

			throw ex; // some other error - shouldn't happen
		}
	}
}
