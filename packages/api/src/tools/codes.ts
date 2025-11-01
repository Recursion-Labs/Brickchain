export async function generateCode(length: number) {
	let code = "";
	const characters = "0123456789";
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		code += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return code;
}
