import { defaultErrorHandler } from 'backenderrors';
import { Panel } from 'components/bootstrap';
import { Breadcrumb } from 'components/breadcrumbtrail';
import { CommandLink } from 'components/CommandButton';
import { CommandButton } from 'components/CommandButton';
import { Dropdown } from 'components/dropdown';
import { Loading } from 'components/loading';
import { Timestamp } from 'components/timestamp';
import { RegisterResponse, U2FEnrolledToken, User } from 'generated/apitypes';
import {
	DatabaseChangeMasterPassword,
	DatabaseExportToKeepass,
	SessionSignOut,
	UserChangePassword,
	UserRegisterU2FToken,
} from 'generated/commanddefinitions';
import { RootFolderName } from 'generated/domain';
import { u2fEnrolledTokens, u2fEnrollmentChallenge, userList } from 'generated/restapi';
import DefaultLayout from 'layouts/DefaultLayout';
import * as React from 'react';
import { indexRoute } from 'routes';
import {
	isU2FError,
	U2FStdRegisteredKey,
	U2FStdRegisterRequest,
	U2FStdRegisterResponse,
} from 'u2ftypes';
import { shouldAlwaysSucceed } from 'utils';

interface SettingsPageState {
	u2fregistrationrequest?: string;
	enrolledTokens?: U2FEnrolledToken[];
	users?: User[];
}

export default class SettingsPage extends React.Component<{}, SettingsPageState> {
	state: SettingsPageState = {};
	private title = 'Settings';

	componentDidMount() {
		shouldAlwaysSucceed(this.fetchData());
	}

	render() {
		const enrollOrFinish = this.state.u2fregistrationrequest ? (
			<CommandButton command={UserRegisterU2FToken(this.state.u2fregistrationrequest)} />
		) : (
			<p>
				<a
					className="btn btn-default"
					onClick={() => {
						this.startTokenEnrollment();
					}}>
					Enroll token
				</a>
			</p>
		);

		return (
			<DefaultLayout title={this.title} breadcrumbs={this.getBreadcrumbs()}>
				<div className="row">
					<div className="col-md-4">
						<Panel heading="Actions">
							<div>
								<CommandButton command={DatabaseChangeMasterPassword()} />
							</div>

							<div className="margin-top">
								<CommandButton command={DatabaseExportToKeepass()} />
							</div>

							<div className="margin-top">
								<CommandButton command={SessionSignOut()} />
							</div>
						</Panel>
					</div>
					<div className="col-md-8">
						<Panel heading="Users">{this.renderUsers()}</Panel>

						<Panel heading="U2F tokens">
							<h3>Enrolled tokens</h3>

							{this.renderEnrolledTokens()}

							{enrollOrFinish}
						</Panel>
					</div>
				</div>
			</DefaultLayout>
		);
	}

	private renderUsers() {
		return this.state.users ? (
			<table className="table">
				<thead>
					<tr>
						<th>Id</th>
						<th>Username</th>
						<th>Created</th>
						<th>Password last changed</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{this.state.users.map((user) => (
						<tr key={user.Id}>
							<td>{user.Id}</td>
							<td>{user.Username}</td>
							<td>
								<Timestamp ts={user.Created} />
							</td>
							<td>
								<Timestamp ts={user.PasswordLastChanged} />
							</td>
							<td>
								<Dropdown>
									<CommandLink command={UserChangePassword(user.Id)} />
								</Dropdown>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		) : (
			<Loading />
		);
	}

	private renderEnrolledTokens() {
		return this.state.enrolledTokens ? (
			<table className="table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Type</th>
						<th>EnrolledAt</th>
					</tr>
				</thead>
				<tbody>
					{this.state.enrolledTokens.map((token) => (
						<tr key={token.EnrolledAt}>
							<td>{token.Name}</td>
							<td>{token.Version}</td>
							<td>
								<Timestamp ts={token.EnrolledAt} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		) : (
			<Loading />
		);
	}

	private startTokenEnrollment() {
		u2fEnrollmentChallenge().then((res) => {
			const challenge = res.Challenge;

			const u2fRegisterCallback = (regResponse: U2FStdRegisterResponse) => {
				if (isU2FError(regResponse)) {
					return;
				}

				const enrollmentRequest: RegisterResponse = {
					Challenge: challenge,
					RegisterResponse: {
						RegistrationData: regResponse.registrationData,
						Version: regResponse.version,
						ClientData: regResponse.clientData,
					},
				};

				const enrollmentRequestAsJson = JSON.stringify(enrollmentRequest);

				this.setState({ u2fregistrationrequest: enrollmentRequestAsJson });
			};

			const reqs: U2FStdRegisterRequest[] = res.RegisterRequest.RegisterRequests.map(
				(item) => {
					return {
						version: item.Version,
						challenge: item.Challenge,
					};
				},
			);

			const keys: U2FStdRegisteredKey[] = res.RegisterRequest.RegisteredKeys.map((item) => {
				return {
					version: item.Version,
					keyHandle: item.KeyHandle,
					appId: item.AppID,
				};
			});

			u2f.register(res.RegisterRequest.AppID, reqs, keys, u2fRegisterCallback, 30);
		}, defaultErrorHandler);
	}

	private getBreadcrumbs(): Breadcrumb[] {
		return [
			{ url: indexRoute.buildUrl({}), title: RootFolderName },
			{ url: '', title: this.title },
		];
	}

	private async fetchData() {
		const fetchEnrolledTokens = async () => {
			const enrolledTokens = await u2fEnrolledTokens();
			this.setState({ enrolledTokens });
		};

		const fetchUsers = async () => {
			const users = await userList();
			this.setState({ users });
		};

		try {
			// does in parallel
			await Promise.all([fetchEnrolledTokens(), fetchUsers()]);
		} catch (ex) {
			defaultErrorHandler(ex);
		}
	}
}
