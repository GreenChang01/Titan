import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: 'http://127.0.0.1:4000/api/:path*',
			},
		];
	},
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
