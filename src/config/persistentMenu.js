const MENU_ADDRESS = "Menu_Address";
const MENU_TIME = "Menu_Time";
const MENU_WARRANTY = "Menu_Warranty";
const MENU_SEARCH_PRODUCT = "Menu_Search_Product";
const MENU_SEARCH_ORDER = "Menu_Search_Order";
export const CHAT_CS = "Chat-CS";
export const MEET_BOT = "Meet-Bot";

export default [
  {
    locale: "default",
    composer_input_disabled: false,
    call_to_actions: [
      {
        title: "Đến với Phong Vũ",
        type: "web_url",
        url: "https://phongvu.vn",
        webview_height_ratio: "full",
        messenger_extensions: true,
      },
      {
        title: "Chat với CSKH",
        type: "web_url",
        url: "https://m.me/cskhphongvu",
      },
    ],
  },
];

export const forceStartBotEvents = [
  MENU_ADDRESS,
  MENU_TIME,
  MENU_WARRANTY,
  MENU_SEARCH_PRODUCT,
  MENU_SEARCH_ORDER,
  MEET_BOT,
];
export const forceEndBotEvents = [CHAT_CS];
