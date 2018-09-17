import {Breadcrumb, BreadcrumbTrail} from 'components/breadcrumbtrail';
import Navigation from 'components/Navigation';
import {SearchBox} from 'components/SearchBox';
import {version} from 'generated/version';
import * as React from 'react';
import {indexRoute} from 'routes';

interface DefaultLayoutProps {
	title: string;
	breadcrumbs: Breadcrumb[];
	children: JSX.Element[] | JSX.Element;
}

export default class DefaultLayout extends React.Component<DefaultLayoutProps, {}> {
	render() {
		document.title = `${this.props.title} - PiLockBox`;

		return <div>
			<div className="header clearfix">
				<div className="pull-left">
					<h3 className="text-muted">
						<a href={indexRoute.buildUrl({})}>PiLockBox</a>
					</h3>
				</div>

				<div className="pull-left" style={{padding: '14px 0 0 20px'}}><SearchBox /></div>

				<nav className="pull-right">
					<Navigation />
				</nav>
			</div>

			<BreadcrumbTrail items={this.props.breadcrumbs} />

			{ this.props.children }

			<div className="panel panel-default" style={{marginTop: '16px'}}>
				<div className="panel-footer">
					<a href="https://github.com/function61/pi-security-module" target="_blank">PiLockBox</a>
					&nbsp;
					{version}</div>
			</div>
		</div>;
	}
}

