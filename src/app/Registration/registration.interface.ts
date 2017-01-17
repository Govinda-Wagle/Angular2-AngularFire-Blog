export interface User {
	firstName:string,
	lastName:string,
	account: {
		email: string,
		password:string,
		confirm:string
	}
}