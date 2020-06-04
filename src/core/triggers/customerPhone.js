import db from "models";
import io from "config/socket";
import { THREAD_SOCKET_KEY, SOCKET_UPDATE_CUSTOMER_PHONE } from "constants";

import { getRoomName } from "utils/socket";

export const findPhoneNumberInText = (text) => {
  if (!text || typeof text !== "string") return null;
  const phoneRegex = /\D*(\+84|0)( *\d *){9}(\D+|$)/;
  const regexExec = phoneRegex.exec(text);
  if (!regexExec) return null;
  const phone = regexExec[0];
  let formatPhone = phone.replace(/^\+84/, "0").replace(/\D/g, "");
  return formatPhone;
};

export default async (message) => {
  const customer = await db.Customer.findByPk(message.customerId);
  if (!customer || customer.phone) return;
  const phone = findPhoneNumberInText(message.content);
  await customer.update({ phone });

  io.of("/")
    .to(getRoomName(THREAD_SOCKET_KEY, message.threadId))
    .emit(SOCKET_UPDATE_CUSTOMER_PHONE, { customer });
};
