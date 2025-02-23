export function b64encode(data) {
	return btoa(String(data))
}

export function b64decode(data) {
	return atob(data)
}