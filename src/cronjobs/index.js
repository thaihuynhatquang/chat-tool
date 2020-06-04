import threadAssign from "./threadsAssign";
import reUnreadThread from "./reUnreadThread";
import turnOnReceiveThreads from "./turnOnReceiveThreads";
import { NODE_APP_INSTANCE } from "constants";

export default () => {
  if (NODE_APP_INSTANCE === 0) {
    // Only run if start with PM2
    // Skip using botSupportStaff for now...
    threadAssign();
    reUnreadThread();
    turnOnReceiveThreads();
  }
};
