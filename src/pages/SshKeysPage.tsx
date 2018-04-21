import * as React from 'react';
import DefaultLayout from 'layouts/DefaultLayout';
import {rootFolderId, FolderResponse} from 'model';
import {getFolder, defaultErrorHandler} from 'repo';
import {SecretListing} from 'components/SecretListing';

interface SshKeysPageState {
	listing: FolderResponse;
}

export default class SshKeysPage extends React.Component<{}, SshKeysPageState> {
	componentDidMount() {
		this.fetchData();
	}

	render() {
		if (!this.state || !this.state.listing) {
			return <h1>loading</h1>;
		}

		const breadcrumbs = [
			{ url: '', title: 'SSH keys' },
		];

		return <DefaultLayout breadcrumbs={breadcrumbs}>
			<SecretListing searchTerm="" listing={this.state.listing} />
		</DefaultLayout>;
	}

	private fetchData() {
		getFolder(rootFolderId).then((listing: FolderResponse) => {
			this.setState({ listing });
		}, defaultErrorHandler);
	}
}
