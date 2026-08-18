import { contactService } from "@/src/services/contact.service";

/**
 * Screen-facing wrapper around contactService. The logic lives in the service so
 * notification handlers, which run outside React, can reuse the same behaviour.
 */
export function useContactActions(options?: {
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
}) {
  const callSupport = () => contactService.call(options?.phone);
  const whatsappOrder = () => contactService.whatsapp(options?.whatsapp);
  const emailSupport = () => contactService.email(options?.email);

  return { callSupport, whatsappOrder, emailSupport };
}
