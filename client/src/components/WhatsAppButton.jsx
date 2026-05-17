// client/src/components/WhatsAppButton.jsx
import { FaWhatsapp } from "react-icons/fa";

const whatsappNumber = "17543669922";
const whatsappMessage = encodeURIComponent(
  "Hi Junior, I need help with a TeePoP order."
);

export const whatsappHref = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

export default function WhatsAppButton() {
  return (
    <a
      href={whatsappHref}
      className="whatsapp-float"
      target="_blank"
      rel="noreferrer"
      aria-label="Contact Junior on WhatsApp"
    >
      <FaWhatsapp size={24} aria-hidden="true" />
      <span>Customer Service</span>
    </a>
  );
}
