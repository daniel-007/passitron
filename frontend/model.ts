
export const rootFolderId = 'root';
export const rootFolderName = 'root';

export interface Account {
	Id: string;
	FolderId: string;
	Title: string;
	Username: string;
	Description: string;
}

export interface Folder {
	Id: string;
	ParentId: string;
	Name: string;
}

export interface FolderResponse {
	Folder: Folder | null;
	SubFolders: Folder[];
	ParentFolders: Folder[];
	Accounts: Account[];
}

export interface Secret {
	Id: string;
	Kind: SecretKind;
	Title: string;
	Created: string;
	Password: string;
	OtpProof: string;
	OtpProofTime: string;
	SshPublicKeyAuthorized: string;
	KeylistKeys: SecretKeylistKey[];
}

export interface SecretKeylistKey {
	Key: string;
	Value: string;
}

export enum SecretKind {
    Password = 'password',
    SshKey = 'ssh_key',
    OtpToken = 'otp_token',
    Keylist = 'keylist',
}
