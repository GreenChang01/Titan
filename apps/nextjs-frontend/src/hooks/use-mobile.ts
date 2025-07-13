import {useEffect, useState} from 'react';

const mobileBreakpoint = 768;

export function useIsMobile() {
	const [isMobile, setIsMobile] = useState<boolean>(false);

	useEffect(() => {
		const checkIsMobile = () => {
			setIsMobile(window.innerWidth < mobileBreakpoint);
		};

		checkIsMobile();
		window.addEventListener('resize', checkIsMobile);

		return () => {
			window.removeEventListener('resize', checkIsMobile);
		};
	}, []);

	return isMobile;
}
