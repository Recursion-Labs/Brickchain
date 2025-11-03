import ContactUs from './contact-us';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export const metadata = {
	title: 'Contact — BrickChain',
	description: 'Get in touch with the BrickChain team',
};

export default function ContactPage() {
	return (
		<>
			<Header />
			<ContactUs />
			<Footer />
		</>
	);
}
