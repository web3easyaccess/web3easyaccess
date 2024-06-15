import { redirect } from "next/navigation";

import myCookies from "./myCookies";

function dashboard(ownerId: string) {
  console.log("dashboard,11", ownerId);
  console.log("dashboard,22", myCookies.getOwnerId());
  let redirectPath = "/";
  try {
    if (ownerId == myCookies.getOwnerId()) {
      console.log("redirect to dashboard");
      redirectPath = "/dashboard";
    } else {
      console.log("redirect to login");
      redirectPath = "/login";
    }
  } catch (error) {
    redirectPath = "/";
  } finally {
    redirect(redirectPath);
  }
}

function loginCheck() {
  if (!myCookies.checkLoggedIn()) {
    console.log("not logged in, redirect to login");
    redirect("/login");
  }
}

export default {
  dashboard,
  loginCheck,
};
