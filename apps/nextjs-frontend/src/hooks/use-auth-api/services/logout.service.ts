export const logout = async (): Promise<void> => {
	await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
	});
};
