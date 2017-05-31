
routes.credview = function (args) {
	var id = args[1];

	credentialById(id).then(function (cred){
		var titleHeading = $('<h1></h1>')
			.text(cred.Title)
			.appendTo(cc());

		attachCommand(titleHeading, {
			cmd: 'RenameSecretRequest',
			prefill: {
				Id: id,
				Title: cred.Title
			} });

		var detailsTable = createTable();

		var usernameTr = detailsTable.tr();
		detailsTable.td(usernameTr).text('Username');
		detailsTable.td(usernameTr).attr('id', 'username').text(cred.Username);
		detailsTable.td(usernameTr).attr('data-clipboard-target', '#username').text('📋');

		var pwdTr = detailsTable.tr();
		detailsTable
			.td(pwdTr)
			.text('Password');
		var pwdTd = detailsTable
			.td(pwdTr)
			.attr('id', 'pwd')
			.text('.. requesting authorization ..');
		detailsTable
			.td(pwdTr)
			.attr('data-clipboard-target', '#pwd')
			.text('📋');

		exposedCred(cred.Id).then(function (exposeResult){
			pwdTd.text(exposeResult.Password);
		});

		var descriptionTr = detailsTable.tr();
		var descriptionHeadingTd = detailsTable.td(descriptionTr).text('Description');
		detailsTable
			.td(descriptionTr)
			.css('font-family', 'monospace')
			.css('white-space', 'pre')
			.text(cred.Description);

		attachCommand(descriptionHeadingTd, {
			cmd: 'ChangeDescriptionRequest',
			prefill: {
				Id: id,
				Description: cred.Description
			} });


		detailsTable.table.appendTo(cc());

		var secretDeleteBtn = $('<button class="btn btn-default"></button>')
			.text('Delete')
			.appendTo(cc());

		attachCommand(secretDeleteBtn, {
			cmd: 'DeleteSecretRequest',
			prefill: {
				Id: id
			} });

		var changePasswordBtn = $('<button class="btn btn-default"></button>')
			.text('Change pwd')
			.appendTo(cc());

		attachCommand(changePasswordBtn, {
			cmd: 'ChangePasswordRequest',
			prefill: {
				Id: id
			} });
	});
}
